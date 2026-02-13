
import { 
    default as makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    delay
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import express from 'express';
import QRCode from 'qrcode';
import fs from 'fs-extra';
import pino from 'pino';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { getBotReply } from './services/geminiService.js';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080; 
const SESSIONS_BASE_DIR = path.join(__dirname, 'sessions');

app.use(express.json());
const logger = pino({ level: 'silent' });

let instances = new Map();
let supabaseClient = null;

let botSettings = {
    isEnabled: true,
    context: "Andri Logistik adalah jasa pengiriman kargo dan paket kilat. Cabang kami meliputi Lelilef, Weda, dan Jakarta. Gudang buka 24 jam. Paket hanya dititipkan 3 hari. Harap siapkan uang pas."
};

let supabaseSettings = {
    url: '',
    key: '',
    tableName: 'deliveries',
    isEnabled: false,
    lastSync: null
};

let db = {
    stats: { sent: 0, received: 0, botReplies: 0, aggregated: 0 },
    logs: [],
};

if (!fs.existsSync(SESSIONS_BASE_DIR)) fs.mkdirSync(SESSIONS_BASE_DIR);

// FUNGSI INISIALISASI ULANG SUPABASE
function initSupabase() {
    if (supabaseSettings.url && supabaseSettings.key) {
        try {
            supabaseClient = createClient(supabaseSettings.url, supabaseSettings.key);
            console.log("✅ Supabase Client Re-Initialized");
        } catch (e) {
            console.error("❌ Supabase Init Error:", e.message);
            supabaseClient = null;
        }
    }
}

// SINKRONISASI OTOMATIS
async function startSupabaseSync() {
    if (!supabaseSettings.isEnabled || !supabaseClient) return;

    try {
        const { data, error } = await supabaseClient
            .from(supabaseSettings.tableName)
            .select('*')
            .eq('wa_sent', false)
            .eq('status', 'RECEIVED');

        if (error) throw error;
        if (data && data.length > 0) {
            console.log(`[Supabase] Mengolah ${data.length} paket...`);
            await processPackageAggregation(data);
        }
        supabaseSettings.lastSync = new Date().toISOString();
    } catch (e) {
        console.error("[Polling Error]", e.message);
    }
}

async function processPackageAggregation(rawData) {
    const activeAccounts = Array.from(instances.values()).filter(i => i.status === 'CONNECTED');
    if (activeAccounts.length === 0) return;

    // Grouping by phone number
    const groups = rawData.reduce((acc, item) => {
        const phone = item.customer_phone.replace(/[^0-9]/g, "");
        if (!acc[phone]) acc[phone] = { items: [], name: item.customer_name, branch: item.branch_name };
        acc[phone].items.push(item);
        return acc;
    }, {});

    let accIdx = 0;
    for (const [phone, group] of Object.entries(groups)) {
        const inst = activeAccounts[accIdx % activeAccounts.length];
        const jid = (phone.startsWith('62') ? phone : '62' + phone) + "@s.whatsapp.net";
        
        let packageList = "";
        let totalPrice = 0;
        group.items.forEach((pkg, idx) => {
            const price = pkg.price || 0;
            totalPrice += price;
            packageList += `${idx + 1}. *${pkg.resi}* - ${pkg.item_name || 'Paket'} (Rp${price.toLocaleString()})\n`;
        });

        const text = `📦 *UPDATE ANDRI LOGISTIK [CABANG ${group.branch?.toUpperCase() || 'WEDA'}]*\n\nHalo *${group.name}*,\n\nAda *${group.items.length} paket* tiba di gudang:\n\n${packageList}\n💰 *TOTAL TAGIHAN: Rp${totalPrice.toLocaleString()}*\n\n━━━━━━━━━━━━━━━\n⚠️ *PENTING*:\n1. Mohon siapkan *UANG PAS*.\n2. Paket ditahan *3 HARI*.\n3. Harap segera diambil.\n━━━━━━━━━━━━━━━\n_Andri Logistik Bot_`;

        try {
            await inst.sock.sendPresenceUpdate('composing', jid);
            await delay(2000);
            await inst.sock.sendMessage(jid, { text });
            
            const ids = group.items.map(i => i.id);
            await supabaseClient.from(supabaseSettings.tableName).update({ wa_sent: true }).in('id', ids);

            db.stats.sent++;
            db.stats.aggregated += group.items.length - 1;
            db.logs.push({ id: Date.now(), type: 'AUTO', to: phone, msg: `Sent ${group.items.length} aggregated` });
            accIdx++;
            await delay(5000 + Math.random() * 5000); 
        } catch (e) {}
    }
}

setInterval(startSupabaseSync, 60000);

async function initWAInstance(sessionId) {
    const sessionPath = path.join(SESSIONS_BASE_DIR, sessionId);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({ 
        version, auth: state, logger,
        browser: ["Andri Logistik Elite", "Chrome", "20.0"],
        printQRInTerminal: false
    });

    instances.set(sessionId, { id: sessionId, sock, qr: null, status: 'INITIALIZING', number: null });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        const inst = instances.get(sessionId);
        if (qr) { inst.qr = await QRCode.toDataURL(qr); inst.status = 'WAITING_SCAN'; }
        if (connection === 'open') { 
            inst.status = 'CONNECTED'; 
            inst.qr = null;
            inst.number = sock.user.id.split(':')[0];
        }
        if (connection === 'close') { 
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) initWAInstance(sessionId); 
            else {
                instances.delete(sessionId);
                await fs.remove(sessionPath);
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;
        const sender = m.key.remoteJid;
        const msgText = m.message.conversation || m.message.extendedTextMessage?.text || "";
        db.stats.received++;

        if (botSettings.isEnabled && msgText.length > 2) {
            const reply = await getBotReply(msgText, botSettings.context);
            if (reply) {
                await sock.sendPresenceUpdate('composing', sender);
                await delay(2000);
                await sock.sendMessage(sender, { text: reply });
                db.stats.botReplies++;
                db.logs.push({ id: Date.now(), type: 'BOT', to: sender.split('@')[0], msg: msgText, reply: reply.substring(0, 50) + "..." });
            }
        }
    });
}

// API ENDPOINTS
app.get('/api/status', (req, res) => {
    res.json({ 
        accounts: Array.from(instances.values()).map(i => ({ id: i.id, status: i.status, qr: i.qr, number: i.number })),
        stats: db.stats,
        logs: db.logs.slice(-25).reverse(),
        botSettings,
        supabaseSettings,
        system: { 
            ram: (os.freemem()/1024/1024/1024).toFixed(2) + "GB Free", 
            cpu: os.loadavg()[0].toFixed(2),
            uptime: Math.floor(os.uptime() / 3600) + " Hours"
        }
    });
});

app.post('/api/supabase-settings', (req, res) => {
    supabaseSettings = { ...supabaseSettings, ...req.body };
    initSupabase(); // Langsung re-init begitu setting diterima
    res.json({ success: true });
});

app.post('/api/bot-settings', (req, res) => {
    botSettings = { ...botSettings, ...req.body };
    res.json({ success: true });
});

app.post('/api/add-account', async (req, res) => {
    const id = `NODE-${Date.now()}`;
    await initWAInstance(id);
    res.json({ id });
});

app.delete('/api/account/:id', async (req, res) => {
    const inst = instances.get(req.params.id);
    if (inst) {
        try { inst.sock.logout(); } catch(e) {}
        instances.delete(req.params.id);
        await fs.remove(path.join(SESSIONS_BASE_DIR, req.params.id));
    }
    res.json({ success: true });
});

const buildPath = path.join(__dirname, 'dist');
app.use(express.static(buildPath));
app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Andri Logistik v18.0 Ultra-Instinct VPS-READY on ${PORT}`);
    fs.readdir(SESSIONS_BASE_DIR).then(dirs => dirs.forEach(d => initWAInstance(d)));
});
