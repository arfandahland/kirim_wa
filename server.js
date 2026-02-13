
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
const SESSIONS_DIR = path.join(__dirname, 'sessions');

app.use(express.json());
const logger = pino({ level: 'silent' });

let instances = new Map();
let supabase = null;

let settings = {
    bot: { isEnabled: true, context: "Andri Logistik: Jasa Kargo & Paket. Buka 24 Jam. Lokasi: Lelilef, Weda, Jakarta." },
    supabase: { url: '', key: '', tableName: 'packages', isEnabled: false, lastSync: null },
    broadcast: { delayMin: 5000, delayMax: 10000, typingMode: true },
    templates: [
        { id: '1', name: 'Paket Tiba', content: 'Halo Kak {{name}}, paket {{resi}} sudah tiba di gudang. Total Ongkir: Rp{{cost}}.' }
    ]
};

let stats = { sent: 0, received: 0, bot: 0, aggregate: 0, failed: 0 };
let logs = [];

if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR);

function initSupabase() {
    if (settings.supabase.url && settings.supabase.key) {
        try {
            supabase = createClient(settings.supabase.url, settings.supabase.key);
            console.log("🚀 Supabase Connected");
        } catch (e) { console.error("Supabase Error:", e.message); }
    }
}

async function syncPackages() {
    if (!settings.supabase.isEnabled || !supabase) return;
    try {
        const { data, error } = await supabase.from(settings.supabase.tableName)
            .select('*').eq('status', 'RECEIVED').eq('wa_sent', false);
        if (error) throw error;
        if (data && data.length > 0) await processPackages(data);
        settings.supabase.lastSync = new Date().toISOString();
    } catch (e) { console.error("Sync Error:", e.message); }
}

async function processPackages(data) {
    const activeAccs = Array.from(instances.values()).filter(i => i.status === 'CONNECTED');
    if (activeAccs.length === 0) return;

    const groups = data.reduce((acc, item) => {
        const phone = item.owner_phone?.replace(/\D/g, "");
        if (!phone) return acc;
        if (!acc[phone]) acc[phone] = { items: [], name: item.owner_name || 'Pelanggan' };
        acc[phone].items.push(item);
        return acc;
    }, {});

    let idx = 0;
    for (const [phone, group] of Object.entries(groups)) {
        const inst = activeAccs[idx % activeAccs.length];
        const jid = (phone.startsWith('62') ? phone : '62' + phone) + "@s.whatsapp.net";
        
        let list = "";
        let total = 0;
        group.items.forEach((p, i) => {
            total += (p.shipping_cost || 0);
            list += `${i+1}. *${p.receipt_number}* (Rp${(p.shipping_cost || 0).toLocaleString()})\n`;
        });

        const msg = `📦 *UPDATE ANDRI LOGISTIK*\n\nHalo *${group.name}*,\n\nAda *${group.items.length} paket* tiba di gudang:\n\n${list}\n💰 *TOTAL TAGIHAN: Rp${total.toLocaleString()}*\n\nMohon segera diambil. Terima kasih.`;

        try {
            if (settings.broadcast.typingMode) {
                await inst.sock.sendPresenceUpdate('composing', jid);
                await delay(2000);
            }
            await inst.sock.sendMessage(jid, { text: msg });
            const ids = group.items.map(i => i.Id);
            await supabase.from(settings.supabase.tableName).update({ wa_sent: true }).in('Id', ids);
            stats.sent++;
            logs.push({ id: Date.now(), to: phone, msg: `Sent ${group.items.length} items.` });
            idx++;
            await delay(settings.broadcast.delayMin + Math.random() * 5000);
        } catch (e) { stats.failed++; }
    }
}

setInterval(syncPackages, 60000);

async function initWA(id) {
    try {
        const sessionPath = path.join(SESSIONS_DIR, id);
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();
        
        const sock = makeWASocket({ 
            version, auth: state, logger,
            browser: ["Andri Logistik v30", "Chrome", "1.0.0"]
        });

        instances.set(id, { id, sock, qr: null, status: 'STARTING', number: null });

        sock.ev.on('connection.update', async (upd) => {
            const { connection, lastDisconnect, qr } = upd;
            const inst = instances.get(id);
            if (!inst) return;

            if (qr) { 
                try {
                    inst.qr = await QRCode.toDataURL(qr); 
                    inst.status = 'QR_READY'; 
                } catch (e) { console.error("QR Error", e); }
            }
            
            if (connection === 'open') { 
                inst.status = 'CONNECTED'; 
                inst.qr = null; 
                inst.number = sock.user.id.split(':')[0]; 
                console.log(`Node ${id} connected as ${inst.number}`);
            }
            
            if (connection === 'close') {
                const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
                if (code !== DisconnectReason.loggedOut) {
                    console.log(`Node ${id} reconnecting...`);
                    initWA(id);
                } else {
                    console.log(`Node ${id} logged out. Cleaning up...`);
                    instances.delete(id); 
                    await fs.remove(sessionPath).catch(() => {});
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            const m = messages[0];
            if (!m.message || m.key.fromMe) return;
            const from = m.key.remoteJid;
            const text = m.message.conversation || m.message.extendedTextMessage?.text || "";
            stats.received++;

            if (settings.bot.isEnabled && text.length > 2) {
                const reply = await getBotReply(text, settings.bot.context);
                if (reply) {
                    await sock.sendMessage(from, { text: reply });
                    stats.bot++;
                }
            }
        });
    } catch (err) {
        console.error(`Fatal error in initWA for ${id}:`, err);
        instances.delete(id);
    }
}

// REST API
app.get('/api/status', (req, res) => {
    res.json({ 
        nodes: Array.from(instances.values()).map(i => ({ id: i.id, status: i.status, qr: i.qr, number: i.number })),
        stats, logs: logs.slice(-50).reverse(), settings,
        system: { 
            ram: (os.freemem()/1024/1024/1024).toFixed(2) + "GB Free", 
            cpu: os.loadavg()[0].toFixed(2),
            uptime: Math.floor(os.uptime() / 3600) + "h"
        }
    });
});

app.post('/api/settings/:type', (req, res) => {
    settings[req.params.type] = { ...settings[req.params.type], ...req.body };
    if (req.params.type === 'supabase') initSupabase();
    res.json({ success: true });
});

app.post('/api/node', (req, res) => {
    const id = `NODE-${Date.now()}`;
    // Jangan gunakan await di sini agar respon HTTP segera dikirim
    initWA(id); 
    res.json({ success: true, id });
});

app.delete('/api/node/:id', async (req, res) => {
    const inst = instances.get(req.params.id);
    if (inst) { 
        try {
            await inst.sock.logout().catch(() => {}); 
        } catch (e) {}
        instances.delete(req.params.id); 
        await fs.remove(path.join(SESSIONS_DIR, req.params.id)).catch(() => {}); 
    }
    res.json({ success: true });
});

const dist = path.join(__dirname, 'dist');
app.use(express.static(dist));
app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 v30.0 SINGULARITY ENGINE READY PORT ${PORT}`);
    // Auto restore sessions on startup
    if (fs.existsSync(SESSIONS_DIR)) {
        fs.readdirSync(SESSIONS_DIR).forEach(d => {
            if (fs.statSync(path.join(SESSIONS_DIR, d)).isDirectory()) {
                console.log(`Restoring session: ${d}`);
                initWA(d);
            }
        });
    }
});
