
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
const PORT = 8080; 
const SESSIONS_BASE_DIR = './sessions';

app.use(express.json());
const logger = pino({ level: 'silent' });

let instances = new Map();
let botSettings = {
    isEnabled: true,
    context: "Andri Logistik adalah jasa pengiriman kargo dan paket kilat. Kami melayani pengiriman motor, barang pindahan, dan paket e-commerce. Gudang pusat berlokasi di Jakarta Timur. Jam operasional 08:00 - 22:00."
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

// SUPABASE SYNC ENGINE
async function startSupabaseSync() {
    if (!supabaseSettings.isEnabled || !supabaseSettings.url || !supabaseSettings.key) return;

    try {
        const supabase = createClient(supabaseSettings.url, supabaseSettings.key);
        // Ambil data yang berstatus 'RECEIVED' dan belum dikirim WA nya
        const { data, error } = await supabase
            .from(supabaseSettings.tableName)
            .select('*')
            .eq('wa_sent', false)
            .eq('status', 'RECEIVED');

        if (error) throw error;
        if (data && data.length > 0) {
            console.log(`[Supabase] Found ${data.length} pending updates.`);
            await processAggregatedMessages(data, supabase);
        }
        supabaseSettings.lastSync = new Date().toISOString();
    } catch (e) {
        console.error("[Supabase Sync Error]", e.message);
    }
}

// Logic Penggabungan Paket per Nomor HP
async function processAggregatedMessages(rawData, supabase) {
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
        
        // Buat daftar resi dan rincian harga
        let packageList = "";
        let totalPrice = 0;
        group.items.forEach((pkg, idx) => {
            const price = pkg.price || 0;
            totalPrice += price;
            packageList += `${idx + 1}. *${pkg.resi}* - ${pkg.item_name || 'Paket'} (Rp${price.toLocaleString()})\n`;
        });

        const text = `📦 *UPDATE ANDRI LOGISTIK [${group.branch || 'PUSAT'}]*\n\nHalo *${group.name}*,\n\nAnda memiliki *${group.items.length} paket* yang telah tiba di gudang kami:\n\n${packageList}\n💰 *TOTAL TAGIHAN: Rp${totalPrice.toLocaleString()}*\n\n━━━━━━━━━━━━━━━\n⚠️ *PENTING*:\n- Mohon siapkan *UANG PAS*.\n- Paket hanya tertahan *3 HARI* di gudang.\n- Harap segera diambil.\n━━━━━━━━━━━━━━━\n_Sent via node: ${inst.number}_`;

        try {
            await inst.sock.sendPresenceUpdate('composing', jid);
            await delay(2000);
            await inst.sock.sendMessage(jid, { text });
            
            // Tandai di Supabase bahwa sudah terkirim
            const ids = group.items.map(i => i.id);
            await supabase.from(supabaseSettings.tableName).update({ wa_sent: true }).in('id', ids);

            db.stats.sent++;
            db.stats.aggregated += group.items.length - 1;
            accIdx++;
            await delay(5000 + Math.random() * 5000); // Anti-ban delay
        } catch (e) {
            console.error(`Failed to send to ${phone}`, e.message);
        }
    }
}

// Jalankan sync setiap 60 detik
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

        if (botSettings.isEnabled && msgText.length > 3) {
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

app.get('/api/status', (req, res) => {
    res.json({ 
        accounts: Array.from(instances.values()).map(i => ({ id: i.id, status: i.status, qr: i.qr, number: i.number })),
        stats: db.stats,
        logs: db.logs.slice(-20).reverse(),
        botSettings,
        supabaseSettings,
        system: { ram: (os.freemem()/1024/1024/1024).toFixed(2) + "GB Free", cpu: os.loadavg()[0].toFixed(2) }
    });
});

app.post('/api/supabase-settings', (req, res) => {
    supabaseSettings = { ...supabaseSettings, ...req.body };
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
        inst.sock.logout();
        instances.delete(req.params.id);
        await fs.remove(path.join(SESSIONS_BASE_DIR, req.params.id));
    }
    res.json({ success: true });
});

app.post('/api/send-mass', async (req, res) => {
    const { messages } = req.body;
    const activeAccounts = Array.from(instances.values()).filter(i => i.status === 'CONNECTED');
    if (activeAccounts.length === 0) return res.status(500).send("No active accounts");
    res.json({ status: "started" });

    // Logic grouping juga diterapkan di manual send
    const groups = messages.reduce((acc, item) => {
        if (!acc[item.phone]) acc[item.phone] = { items: [], name: item.name };
        acc[item.phone].items.push(item);
        return acc;
    }, {});

    let accIdx = 0;
    for (const [phone, group] of Object.entries(groups)) {
        const inst = activeAccounts[accIdx % activeAccounts.length];
        const jid = (phone.startsWith('62') ? phone : '62' + phone) + "@s.whatsapp.net";
        
        let packageList = group.items.map((it, idx) => `${idx+1}. *${it.resi}* (${it.status})`).join('\n');
        const text = `📦 *ANDRI LOGISTIK MANUAL DISPATCH*\n\nHalo *${group.name}*,\n\nStatus Paket Anda:\n${packageList}\n\nMohon siapkan uang pas & ambil maks 3 hari.\n_Sent via node: ${inst.number}_`;
        
        try {
            await inst.sock.sendPresenceUpdate('composing', jid);
            await delay(1500);
            await inst.sock.sendMessage(jid, { text });
            db.stats.sent++;
            accIdx++;
            await delay(5000 + Math.random() * 5000);
        } catch (e) {}
    }
});

const buildPath = path.join(__dirname, 'dist');
app.use(express.static(buildPath));
app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 Andri Logistik v16.0 Ultra-Instinct running on ${PORT}`);
    fs.readdir(SESSIONS_BASE_DIR).then(dirs => dirs.forEach(d => initWAInstance(d)));
});
