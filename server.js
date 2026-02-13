
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

// Pastikan direktori sesi ada
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
            console.log("✅ WHATSAPP CONNECTED - ANDRI LOGISTIK ENGINE ACTIVE"); 
        }
        if (connection === 'close') { 
            isConnected = false; 
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log("❌ CONNECTION CLOSED: ", reason);
            if (reason !== DisconnectReason.loggedOut) {
                console.log("🔄 RECONNECTING...");
                startTitan(); 
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;
        
        const senderName = m.pushName || "Customer";
        const senderPhone = m.key.remoteJid.split('@')[0];
        const messageText = m.message.conversation || m.message.extendedTextMessage?.text || "Media/Other";

        db.stats.received++;
        db.inbox.unshift({ 
            id: Date.now(),
            time: new Date().toLocaleTimeString(), 
            name: senderName, 
            phone: senderPhone, 
            msg: messageText
        });
        
        if (db.inbox.length > 50) db.inbox.pop();
    });
}

// WEBHOOK SUPABASE (SMART GROUPING LOGIC)
app.post('/webhook/status-update', async (req, res) => {
    const data = req.body.record || req.body;
    db.stats.hits++;
    
    const phoneRaw = (data.no_hp || data.phone || "").toString().replace(/[^0-9]/g, "");
    const phone = phoneRaw.startsWith('0') ? '62' + phoneRaw.slice(1) : phoneRaw;
    
    if (!phone) return res.status(400).json({ error: "No valid phone number provided" });

    // Update Logs for UI
    db.logs.unshift({ 
        id: Date.now(), 
        time: new Date().toLocaleTimeString(), 
        resi: data.resi || "N/A", 
        status: data.status || "UPDATE", 
        phone: phone 
    });
    if (db.logs.length > 100) db.logs.pop();

    // Smart Notification Grouping (10s window)
    if (!pendingNotifications.has(phone)) {
        pendingNotifications.set(phone, { name: data.nama || "Pelanggan", items: [] });
        
        setTimeout(async () => {
            const entry = pendingNotifications.get(phone);
            if (!entry || !isConnected) {
                pendingNotifications.delete(phone);
                return;
            }
            
            try {
                let list = entry.items.map((it, idx) => `${idx + 1}. *${it.resi}* → _${it.status}_`).join('\n');
                const message = `📦 *UPDATE ANDRI LOGISTIK*\n\nHalo *${entry.name}*,\nAda pembaruan status paket Anda:\n\n${list}\n\n━━━━━━━━━━━━━━━\n⚠️ *CATATAN PENTING*:\n- *Mohon siapkan uang pas*\n- *Batas pengambilan maksimal 3 hari*\n━━━━━━━━━━━━━━━\n_Andri Logistik Enterprise System_`;
                
                await sock.sendMessage(phone + "@s.whatsapp.net", { text: message });
                db.stats.sent++;
                console.log(`✅ NOTIF SENT TO ${phone} (${entry.items.length} items)`);
            } catch (err) {
                console.error(`❌ FAILED TO SEND TO ${phone}:`, err);
            } finally {
                pendingNotifications.delete(phone);
            }
        }, 10000); // 10 Detik Jeda untuk grouping
    }
    
    pendingNotifications.get(phone).items.push({ 
        resi: data.resi || "-", 
        status: data.status || "Update" 
    });
    
    res.json({ status: "queued", phone });
});

// API UNTUK UI REACT
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

// Catch-all: Kirim index.html untuk SPA
app.get('*', (req, res) => {
    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("Frontend build not found. Please run 'npm run build' first.");
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ANDRI LOGISTIK BACKEND RUNNING ON PORT ${PORT}`);
    startTitan();
});
