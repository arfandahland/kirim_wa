
import { 
    default as makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    delay,
    makeInMemoryStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import express from 'express';
import QRCode from 'qrcode';
import fs from 'fs-extra';
import pino from 'pino';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080; 
const SESSION_DIR = './sessions';

app.use(express.json());
const logger = pino({ level: 'silent' });
const store = makeInMemoryStore({ logger });

let db = {
    stats: { sent: 0, received: 0, hits: 0 },
    settings: { ai_mode: true, auto_read: true, typing: true, anti_ban: true },
    inbox: [],
    logs: []
};

let pendingNotifications = new Map();
let qrCodeData = null;
let isConnected = false;
let sock;

if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR);
}

// SERVE FRONTEND (Hasil Build Vite)
const buildPath = path.join(__dirname, 'dist');
app.use(express.static(buildPath));

async function startTitan() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();
    
    sock = makeWASocket({ 
        version, 
        auth: state, 
        logger,
        browser: ["Andri Logistik Enterprise", "Chrome", "14.0"],
        markOnlineOnConnect: true,
        printQRInTerminal: true
    });

    if (store) store.bind(sock.ev);

    sock.ev.on('connection.update', async (u) => {
        const { connection, lastDisconnect, qr } = u;
        if (qr) {
            qrCodeData = await QRCode.toDataURL(qr);
        }
        if (connection === 'open') { 
            isConnected = true; 
            qrCodeData = null; 
            console.log("✅ WHATSAPP CONNECTED"); 
        }
        if (connection === 'close') { 
            isConnected = false; 
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                startTitan(); 
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;
        
        db.stats.received++;
        db.inbox.unshift({ 
            id: Date.now(),
            time: new Date().toLocaleTimeString(), 
            name: m.pushName || "Customer", 
            phone: m.key.remoteJid.split('@')[0], 
            msg: m.message.conversation || m.message.extendedTextMessage?.text || "Media Message"
        });
        if (db.inbox.length > 50) db.inbox.pop();
    });
}

// API KIRIM MASSAL
app.post('/api/send-mass', async (req, res) => {
    const { messages } = req.body;
    if (!isConnected) return res.status(500).json({ error: "WhatsApp not connected" });
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Invalid data" });

    res.json({ status: "processing", total: messages.length });

    // Background processing dengan anti-ban delay
    for (const item of messages) {
        try {
            const phone = item.phone.replace(/[^0-9]/g, "");
            const jid = (phone.startsWith('0') ? '62' + phone.slice(1) : phone) + "@s.whatsapp.net";
            
            const text = `📦 *UPDATE ANDRI LOGISTIK*\n\nHalo *${item.name}*,\nAda pembaruan status paket Anda:\n\n1. *${item.resi}* → _${item.status}_\n\n━━━━━━━━━━━━━━━\n⚠️ *CATATAN PENTING*:\n- *Mohon siapkan uang pas*\n- *Batas pengambilan maksimal 3 hari*\n━━━━━━━━━━━━━━━\n_Andri Logistik Enterprise System_`;
            
            await sock.sendMessage(jid, { text });
            db.stats.sent++;
            
            // Jeda 3-7 detik antar pesan (Anti-Ban)
            await delay(3000 + Math.random() * 4000);
        } catch (e) {
            console.error("Failed to send mass:", e);
        }
    }
});

app.post('/webhook/status-update', async (req, res) => {
    const data = req.body.record || req.body;
    db.stats.hits++;
    const phoneRaw = (data.no_hp || data.phone || "").toString().replace(/[^0-9]/g, "");
    const phone = phoneRaw.startsWith('0') ? '62' + phoneRaw.slice(1) : phoneRaw;
    
    if (!phone) return res.status(400).json({ error: "No Phone" });

    db.logs.unshift({ id: Date.now(), time: new Date().toLocaleTimeString(), resi: data.resi, status: data.status, phone });

    if (!pendingNotifications.has(phone)) {
        pendingNotifications.set(phone, { name: data.nama || "Pelanggan", items: [] });
        setTimeout(async () => {
            const entry = pendingNotifications.get(phone);
            if (!entry || !isConnected) return;
            let list = entry.items.map((it, idx) => `${idx + 1}. *${it.resi}* → _${it.status}_`).join('\n');
            const message = `📦 *UPDATE ANDRI LOGISTIK*\n\nHalo *${entry.name}*,\nAda pembaruan status paket Anda:\n\n${list}\n\n━━━━━━━━━━━━━━━\n⚠️ *CATATAN PENTING*:\n- *Mohon siapkan uang pas*\n- *Batas pengambilan maksimal 3 hari*\n━━━━━━━━━━━━━━━\n_Andri Logistik Enterprise System_`;
            await sock.sendMessage(phone + "@s.whatsapp.net", { text: message });
            db.stats.sent++;
            pendingNotifications.delete(phone);
        }, 10000);
    }
    pendingNotifications.get(phone).items.push({ resi: data.resi || "-", status: data.status || "Update" });
    res.json({ status: "queued" });
});

app.get('/api/status', (req, res) => {
    res.json({ 
        isConnected, 
        stats: db.stats, 
        settings: db.settings, 
        inbox: db.inbox, 
        logs: db.logs, 
        qr: qrCodeData,
        system: { 
            ram: ((os.totalmem() - os.freemem())/1024/1024/1024).toFixed(2) + " GB", 
            cpu: (os.loadavg()[0]*10).toFixed(1) + "%" 
        }
    });
});

app.get('*', (req, res) => {
    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) res.sendFile(indexPath);
    else res.status(404).send("Build frontend dulu boss! 'npm run build'");
});

app.listen(PORT, '0.0.0.0', () => {
    console.log("🚀 Server running on Port " + PORT);
    startTitan();
});
