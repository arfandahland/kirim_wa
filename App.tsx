
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, MessageSquare, Truck, SendHorizontal, 
  Shield, Rocket, Send, Database, ClipboardCheck,
  CheckCircle2, Loader2, BarChart3, Bot, Activity,
  Bell, Terminal, Search, MoreHorizontal, Zap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [massInput, setMassInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiResponse, setAiResponse] = useState("Halo Kak Andri! Ada yang bisa saya bantu hari ini?");
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [data, setData] = useState({
    isConnected: false,
    stats: { sent: 0, received: 0, hits: 0 },
    inbox: [] as any[],
    logs: [] as any[],
    qr: null as string | null,
    system: { ram: '0 GB', cpu: '0%', uptime: '0h' },
    chartData: [
      { name: '08:00', val: 40 }, { name: '10:00', val: 30 }, 
      { name: '12:00', val: 65 }, { name: '14:00', val: 45 },
      { name: '16:00', val: 90 }, { name: '18:00', val: 75 }
    ]
  });

  // Fetch data dari server
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const r = await fetch('/api/status');
        if (r.ok && isMounted) {
          const d = await r.json();
          setData(prev => ({ ...prev, ...d }));
        }
      } catch (e) {
        // Suppress errors for local dev if backend is not up
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const askAi = useCallback(async (prompt: string) => {
    const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
    
    if (!apiKey) {
      setAiResponse("Error: API_KEY tidak terkonfigurasi di environment.");
      return;
    }
    
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "Anda adalah Andri Logistics Brain. Berikan saran logistik dan anti-ban WhatsApp yang cerdas dan singkat dalam Bahasa Indonesia.",
        }
      });
      setAiResponse(response.text || "AI sedang berpikir keras...");
    } catch (e) {
      setAiResponse("Koneksi AI terputus. Pastikan API KEY valid.");
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  const handleMassSend = async () => {
    if (!massInput.trim() || !data.isConnected) return;
    setIsSending(true);
    setProgress(10);

    try {
      const lines = massInput.split('\n').filter(l => l.includes('|'));
      const messages = lines.map(line => {
        const [phone, name, resi, status] = line.split('|');
        return { phone: phone?.trim(), name: name?.trim(), resi: resi?.trim(), status: status?.trim() };
      });

      const response = await fetch('/api/send-mass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });

      if (response.ok) {
        setProgress(100);
        setTimeout(() => {
          setIsSending(false);
          setProgress(0);
          setMassInput('');
          alert("Pengiriman Massal Berhasil Dijadwalkan!");
        }, 1000);
      } else {
        alert("Gagal menghubungi mesin pengirim.");
        setIsSending(false);
      }
    } catch (e) {
      alert("Format input salah.");
      setIsSending(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics Pro', icon: BarChart3 },
    { id: 'logistics', label: 'Input Massal', icon: Truck },
    { id: 'ai', label: 'AI Logistics', icon: Bot },
    { id: 'inbox', label: 'Inbox', icon: MessageSquare },
    { id: 'terminal', label: 'System Logs', icon: Terminal },
  ];

  return (
    <div className="flex h-screen bg-[#020203] overflow-hidden text-zinc-100 uppercase tracking-tighter">
      {/* Sidebar */}
      <aside className="w-20 lg:w-72 bg-zinc-900/10 border-r border-white/5 flex flex-col glass z-50 transition-all duration-500">
        <div className="p-6 mb-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40 animate-pulse">
            <Rocket size={20} className="text-white" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-black italic tracking-tighter">ANDRI <span className="text-indigo-500">LOG</span></h1>
            <p className="text-[8px] text-zinc-500 font-bold tracking-[0.4em]">V15.0 ENTERPRISE</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' 
                : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
              }`}
            >
              <item.icon size={20} />
              <span className="hidden lg:block text-[10px] font-black italic">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="p-4 bg-zinc-900/40 rounded-3xl border border-white/5 glass">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-2 h-2 rounded-full ${data.isConnected ? 'bg-emerald-500 animate-glow' : 'bg-rose-500'}`} />
              <span className="text-[8px] text-zinc-500 font-bold">NODE-01</span>
            </div>
            <p className="text-[10px] font-black italic">{data.isConnected ? 'SYSTEM ACTIVE' : 'SYSTEM STANDBY'}</p>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto custom-scroll relative">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <header className="sticky top-0 z-40 p-8 flex justify-between items-center glass border-b border-white/5 mb-8">
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter text-indigo-400">{activeTab}</h2>
            <p className="text-[9px] text-zinc-500 font-bold mt-1 tracking-widest">REAL-TIME DATA SYNC ACTIVE</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-4">
              <div className="text-right">
                <p className="text-[8px] text-zinc-500 font-bold">CPU STATUS</p>
                <p className="text-xs font-black text-orange-400">{data.system.cpu}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-zinc-500 font-bold">MEMORY</p>
                <p className="text-xs font-black text-purple-400">{data.system.ram}</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center border border-white/10 group cursor-pointer hover:border-indigo-500 transition-all">
              <Bell size={18} className="text-zinc-400 group-hover:text-indigo-400" />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in duration-1000">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Pesan Terkirim', val: data.stats.sent, icon: Send, color: 'text-emerald-500' },
                  { label: 'Pesan Masuk', val: data.stats.received, icon: MessageSquare, color: 'text-blue-500' },
                  { label: 'Supabase Hits', val: data.stats.hits, icon: Database, color: 'text-indigo-500' },
                  { label: 'Efficiency', val: '99.8%', icon: Zap, color: 'text-yellow-500' },
                ].map((s, i) => (
                  <div key={i} className="p-8 bg-zinc-900/10 border border-white/5 rounded-[2.5rem] glass hover:scale-[1.02] transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-3 bg-zinc-800 rounded-2xl ${s.color}`}><s.icon size={20} /></div>
                      <MoreHorizontal size={16} className="text-zinc-600" />
                    </div>
                    <p className="text-[9px] font-bold text-zinc-500 mb-1 tracking-widest">{s.label}</p>
                    <h3 className={`text-4xl font-black italic tracking-tighter ${s.color}`}>{s.val}</h3>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-8 bg-zinc-900/10 border border-white/5 rounded-[3rem] glass">
                  <div className="flex justify-between items-center mb-10">
                    <h4 className="text-sm font-black italic text-indigo-400">Activity Flow Monitor</h4>
                    <div className="flex gap-2">
                      <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-bold text-zinc-500">LIVE FEED</span>
                    </div>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.chartData}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                        <XAxis dataKey="name" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #1e2937', borderRadius: '12px', fontSize: '10px' }} />
                        <Area type="monotone" dataKey="val" stroke="#6366f1" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-8 bg-zinc-900/10 border border-white/5 rounded-[3rem] glass flex flex-col items-center justify-center text-center">
                   <Shield size={64} className="text-emerald-500 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                   <h5 className="text-xl font-black italic text-white mb-2">ANTI-BAN SHIELD</h5>
                   <p className="text-[10px] text-zinc-500 font-bold mb-6 tracking-widest uppercase italic">Protection Level: Maximum</p>
                   <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-8">
                     <div className="bg-emerald-500 h-full w-[94%]" />
                   </div>
                   <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="p-4 bg-black/30 rounded-2xl border border-white/5">
                        <p className="text-[8px] text-zinc-500 font-bold">DELAY</p>
                        <p className="text-xs font-black text-white">5-15s</p>
                      </div>
                      <div className="p-4 bg-black/30 rounded-2xl border border-white/5">
                        <p className="text-[8px] text-zinc-500 font-bold">SPOOL</p>
                        <p className="text-xs font-black text-white">ACTIVE</p>
                      </div>
                   </div>
                </div>
              </div>

              {!data.isConnected && data.qr && (
                <div className="p-16 bg-white rounded-[4rem] text-center shadow-2xl glass border-8 border-indigo-600/20 relative z-50 animate-in zoom-in duration-500">
                  <h3 className="text-zinc-900 text-2xl font-black mb-8 italic tracking-tighter">⚠️ SYSTEM INITIALIZATION REQUIRED</h3>
                  <div className="inline-block p-6 bg-zinc-100 rounded-[3rem] shadow-inner mb-8">
                    <img src={data.qr} alt="WA QR" className="w-80 h-80 rounded-2xl mix-blend-multiply" />
                  </div>
                  <p className="text-zinc-400 text-xs font-black tracking-[0.3em]">SCAN BARCODE UNTUK AKTIVASI ENGINE v15.0</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="grid lg:grid-cols-2 gap-8 animate-in slide-in-from-right duration-700">
               <div className="p-10 bg-zinc-900/10 border border-white/5 rounded-[3.5rem] glass">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-600/20">
                       <Bot size={28} className="text-indigo-400" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black italic tracking-tighter">ANDRI LOGISTICS BRAIN</h4>
                       <p className="text-[9px] text-zinc-500 font-bold tracking-widest">GEMINI PRO 1.5 INTEGRATED</p>
                    </div>
                 </div>
                 <div className="space-y-4 mb-8">
                    <button onClick={() => askAi("Berikan strategi anti-ban WhatsApp untuk pengiriman 1000 pesan sehari.")} className="w-full p-5 bg-white/5 rounded-2xl border border-white/5 text-left text-[10px] font-black hover:bg-indigo-600/20 transition-all uppercase italic">🛡️ Strategi Anti-Ban 1000 Pesan</button>
                    <button onClick={() => askAi("Buat template pesan logistik yang ramah tapi profesional untuk paket yang tiba di gudang.")} className="w-full p-5 bg-white/5 rounded-2xl border border-white/5 text-left text-[10px] font-black hover:bg-indigo-600/20 transition-all uppercase italic">📦 Template Pesan Paket Tiba</button>
                    <button onClick={() => askAi("Bagaimana cara meningkatkan efisiensi rute pengiriman?")} className="w-full p-5 bg-white/5 rounded-2xl border border-white/5 text-left text-[10px] font-black hover:bg-indigo-600/20 transition-all uppercase italic">🚚 Efisiensi Rute Pengiriman</button>
                 </div>
                 <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/10 min-h-[200px] flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Bot size={120} /></div>
                    {isAiLoading ? <Loader2 className="animate-spin text-indigo-500" size={32} /> : (
                       <p className="text-sm text-zinc-300 italic font-medium leading-relaxed z-10">{aiResponse}</p>
                    )}
                 </div>
               </div>
               <div className="p-10 bg-indigo-600 rounded-[3.5rem] shadow-2xl shadow-indigo-600/20 flex flex-col justify-between overflow-hidden relative">
                  <div className="absolute -right-20 -bottom-20 opacity-10"><Rocket size={300} /></div>
                  <div className="z-10">
                    <h4 className="text-4xl font-black italic tracking-tighter leading-none mb-6">READY TO SCALE YOUR LOGISTICS?</h4>
                    <p className="text-xs font-bold text-indigo-100/70 mb-8 uppercase tracking-widest">Andri Logistik v15.0 memberikan Anda kendali penuh atas ribuan notifikasi pelanggan tanpa rasa khawatir.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6 z-10">
                    <div className="p-6 bg-white/10 rounded-3xl border border-white/20">
                       <h6 className="text-2xl font-black italic">100%</h6>
                       <p className="text-[9px] font-bold text-indigo-200">Uptime System</p>
                    </div>
                    <div className="p-6 bg-white/10 rounded-3xl border border-white/20">
                       <h6 className="text-2xl font-black italic">ULTRA</h6>
                       <p className="text-[9px] font-bold text-indigo-200">Security Shield</p>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'logistics' && (
            <div className="grid lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom duration-700">
               <div className="lg:col-span-2 p-10 bg-zinc-900/10 border border-white/5 rounded-[3.5rem] glass">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-indigo-600/10 rounded-2xl border border-indigo-600/20 text-indigo-400"><SendHorizontal size={24} /></div>
                    <h4 className="text-2xl font-black italic tracking-tighter">MASS DISPATCH ENGINE</h4>
                  </div>
                  
                  <div className="mb-6 space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 tracking-[0.2em] italic uppercase underline decoration-indigo-500/30 underline-offset-4">Format Data Input (PENTING!)</label>
                    <p className="text-[9px] text-indigo-400 font-bold italic">NoHP|Nama|Resi|Status (Contoh: 62812345678|Andri|AL-001|Tiba di Gudang)</p>
                  </div>

                  <textarea 
                    value={massInput}
                    onChange={(e) => setMassInput(e.target.value)}
                    className="w-full h-[400px] bg-black/40 border border-white/5 rounded-[2.5rem] p-8 text-sm text-indigo-300 font-mono focus:ring-4 focus:ring-indigo-600/10 transition-all custom-scroll outline-none uppercase placeholder:text-zinc-800"
                    placeholder="62812345678|Budi|RESI-12345|Tiba di Transit Point"
                  />

                  {isSending && (
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-[9px] font-bold text-indigo-400">
                        <span>SENDING PROGRESS...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleMassSend}
                    disabled={isSending || !data.isConnected}
                    className={`w-full mt-8 py-6 rounded-[2rem] font-black italic uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-2xl ${
                      isSending || !data.isConnected ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
                    }`}
                  >
                    {isSending ? <Loader2 size={22} className="animate-spin" /> : <Rocket size={22} />}
                    {isSending ? 'PROCESSING QUEUE...' : 'ACTIVATE DISPATCH ENGINE'}
                  </button>
               </div>

               <div className="space-y-8">
                  <div className="p-8 bg-zinc-900/10 border border-white/5 rounded-[3rem] glass">
                     <ClipboardCheck size={40} className="text-indigo-400 mb-6" />
                     <h5 className="text-sm font-black italic mb-4">MANDATORY RULES</h5>
                     <ul className="space-y-4">
                        {[
                          "Otomatis menambahkan 'Mohon Siapkan Uang Pas'",
                          "Batas pengambilan 3 hari aktif",
                          "Jeda acak 5-15 detik otomatis",
                          "Rotasi template kalimat otomatis",
                        ].map((r, i) => (
                          <li key={i} className="flex gap-3 text-[10px] font-bold text-zinc-400 uppercase italic">
                            <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                            {r}
                          </li>
                        ))}
                     </ul>
                  </div>
                  <div className="p-8 bg-zinc-900/10 border border-white/5 rounded-[3rem] glass text-center">
                     <Activity size={40} className="text-orange-400 mx-auto mb-6" />
                     <h5 className="text-sm font-black italic mb-2">SYSTEM LOAD</h5>
                     <p className="text-3xl font-black italic text-orange-400 tracking-tighter mb-4">{data.system.cpu}</p>
                     <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Optimized for heavy traffic</p>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'inbox' && (
            <div className="grid lg:grid-cols-2 gap-8 animate-in zoom-in duration-500">
               <div className="bg-zinc-900/10 border border-white/5 rounded-[3.5rem] glass overflow-hidden flex flex-col h-[700px]">
                  <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h4 className="text-sm font-black italic text-blue-400 tracking-widest">CUSTOMER INBOX</h4>
                    <Search size={16} className="text-zinc-500" />
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scroll">
                    {data.inbox.length > 0 ? data.inbox.map((m: any) => (
                      <div key={m.id} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[11px] font-black text-blue-400">{m.name}</span>
                           <span className="text-[9px] font-mono text-zinc-600">{m.time}</span>
                        </div>
                        <p className="text-xs text-zinc-300 italic">"{m.msg}"</p>
                        <div className="mt-3 text-[8px] font-bold text-zinc-600">{m.phone}</div>
                      </div>
                    )) : (
                      <div className="h-full flex flex-col items-center justify-center grayscale opacity-10">
                        <MessageSquare size={64} className="mb-4" />
                        <p className="text-xs font-black italic uppercase">No messages found</p>
                      </div>
                    )}
                  </div>
               </div>
               <div className="bg-zinc-900/10 border border-white/5 rounded-[3.5rem] glass overflow-hidden flex flex-col h-[700px]">
                  <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h4 className="text-sm font-black italic text-indigo-400 tracking-widest">REAL-TIME WEBHOOK LOGS</h4>
                    <Database size={16} className="text-zinc-500" />
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-3 custom-scroll">
                    {data.logs.map((l: any) => (
                      <div key={l.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex justify-between items-center group">
                        <div className="flex gap-4 items-center">
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                          <div>
                            <p className="text-[10px] font-black text-zinc-100">{l.resi}</p>
                            <p className="text-[8px] text-zinc-500 font-bold uppercase">{l.status}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-700">{l.time}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
