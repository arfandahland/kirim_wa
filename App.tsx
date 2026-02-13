
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, MessageSquare, Truck, SendHorizontal, 
  Shield, Rocket, Send, Database, ClipboardCheck,
  CheckCircle2, Loader2, BarChart3, Bot, Activity,
  Bell, Terminal, Search, MoreHorizontal, Zap, Plus, Trash2, Smartphone, Settings, Cpu, Link as LinkIcon, RefreshCw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [massInput, setMassInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [data, setData] = useState({
    accounts: [] as any[],
    stats: { sent: 0, received: 0, botReplies: 0, aggregated: 0 },
    logs: [] as any[],
    botSettings: { isEnabled: true, context: "" },
    supabaseSettings: { url: '', key: '', tableName: 'deliveries', isEnabled: false, lastSync: '' },
    system: { ram: '0GB', cpu: '0' },
    chartData: [
      { name: '08:00', val: 40 }, { name: '10:00', val: 30 }, 
      { name: '12:00', val: 65 }, { name: '14:00', val: 45 },
      { name: '16:00', val: 90 }, { name: '18:00', val: 75 }
    ]
  });

  const fetchData = useCallback(async () => {
    try {
      const r = await fetch('/api/status');
      if (r.ok) {
        const d = await r.json();
        setData(prev => ({ ...prev, ...d }));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const updateSupabase = async (settings: any) => {
    await fetch('/api/supabase-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    fetchData();
  };

  const updateBotSettings = async (settings: any) => {
    await fetch('/api/bot-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    fetchData();
  };

  const handleMassSend = async () => {
    if (!massInput.trim()) return;
    setIsSending(true);
    const lines = massInput.split('\n').filter(l => l.includes('|'));
    const messages = lines.map(line => {
        const [phone, name, resi, status] = line.split('|');
        return { phone: phone?.trim(), name: name?.trim(), resi: resi?.trim(), status: status?.trim() };
    });
    await fetch('/api/send-mass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
    });
    alert("Proses pengiriman dimulai! Sistem akan otomatis menggabungkan resi dengan nomor yang sama.");
    setMassInput("");
    setIsSending(false);
  };

  const activeCount = data.accounts.filter(a => a.status === 'CONNECTED').length;

  return (
    <div className="flex h-screen bg-[#020203] text-zinc-100 uppercase tracking-tighter selection:bg-indigo-500/30">
      {/* Sidebar - Pro Glass */}
      <aside className="w-20 lg:w-72 bg-zinc-950/50 border-r border-white/5 flex flex-col glass z-50 transition-all">
        <div className="p-8 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40 animate-pulse">
            <Rocket size={24} className="text-white" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-black italic tracking-tighter">ANDRI <span className="text-indigo-500">ULTRA</span></h1>
            <p className="text-[9px] text-zinc-500 font-bold tracking-[0.4em]">v16.0 AGGREGATOR</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'accounts', label: 'Nodes WA', icon: Smartphone },
            { id: 'supabase', label: 'Supabase Sync', icon: Database },
            { id: 'bot', label: 'AI Support', icon: Bot },
            { id: 'dispatch', label: 'Dispatch', icon: SendHorizontal },
            { id: 'logs', label: 'Logs', icon: Terminal },
          ].map((item) => (
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

        <div className="p-6">
           <div className="p-4 bg-emerald-600/10 rounded-2xl border border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                 <div className={`w-2 h-2 rounded-full ${activeCount > 0 ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
                 <span className="text-[8px] font-black text-emerald-400">ACTIVE_BRIDGE</span>
              </div>
              <p className="text-[9px] font-bold text-zinc-400">STATUS: {activeCount > 0 ? 'READY' : 'OFFLINE'}</p>
           </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto custom-scroll">
        <header className="sticky top-0 z-40 p-8 flex justify-between items-center glass border-b border-white/5 bg-[#020203]/80">
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter text-white">{activeTab.toUpperCase()}</h2>
            <div className="flex gap-4 mt-2">
               <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-black">● AGGREGATOR ACTIVE</span>
               <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-black">● SYNC ENABLED</span>
            </div>
          </div>
          <div className="flex gap-6 items-center">
             <div className="text-right hidden sm:block">
                <p className="text-[8px] text-zinc-500 font-bold italic">LAST SYNC</p>
                <p className="text-xs font-black text-indigo-400">{data.supabaseSettings.lastSync ? new Date(data.supabaseSettings.lastSync).toLocaleTimeString() : 'NEVER'}</p>
             </div>
             <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-all">
                <RefreshCw size={20} className="text-zinc-400" />
             </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: 'WA SENT', val: data.stats.sent, icon: Send, color: 'text-emerald-500' },
                   { label: 'SAVED MSGS (AGG)', val: data.stats.aggregated, icon: Zap, color: 'text-yellow-500' },
                   { label: 'BOT REPLIES', val: data.stats.botReplies, icon: Bot, color: 'text-blue-500' },
                   { label: 'INCOMING', val: data.stats.received, icon: MessageSquare, color: 'text-indigo-500' },
                 ].map((s, i) => (
                   <div key={i} className="p-10 bg-zinc-900/20 border border-white/5 rounded-[3rem] glass hover:scale-[1.02] transition-all group overflow-hidden">
                      <p className="text-[10px] font-black text-zinc-500 mb-1">{s.label}</p>
                      <h3 className={`text-5xl font-black italic tracking-tighter ${s.color}`}>{s.val}</h3>
                      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform"><s.icon size={100} /></div>
                   </div>
                 ))}
               </div>

               <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 p-10 bg-zinc-900/20 border border-white/5 rounded-[3.5rem] glass">
                     <h4 className="text-lg font-black italic mb-10 text-indigo-400 tracking-widest">REAL-TIME TRAFFIC</h4>
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
                            <XAxis dataKey="name" stroke="#4b5563" fontSize={10} axisLine={false} />
                            <YAxis stroke="#4b5563" fontSize={10} axisLine={false} />
                            <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #1e2937', borderRadius: '12px' }} />
                            <Area type="monotone" dataKey="val" stroke="#6366f1" fill="url(#colorVal)" strokeWidth={4} />
                          </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                  <div className="p-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3.5rem] shadow-2xl flex flex-col justify-between">
                     <div>
                        <Shield size={48} className="text-white mb-6" />
                        <h4 className="text-4xl font-black italic tracking-tighter mb-4 text-white">PROTECTION ACTIVE</h4>
                        <p className="text-xs font-bold text-indigo-100/70 mb-8 uppercase leading-relaxed tracking-wider italic">Agregator cerdas mengelompokkan paket per nomor untuk menghindari blokir WA dan mengefisiensikan pengiriman.</p>
                     </div>
                     <div className="p-6 bg-white/10 rounded-3xl border border-white/20">
                        <p className="text-[10px] font-black text-white mb-2 italic">ANTI-SPAM SYSTEM</p>
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                           <span className="text-[9px] font-bold text-white tracking-widest uppercase">ENCRYPTED & ROTATED</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'supabase' && (
            <div className="grid lg:grid-cols-2 gap-8 animate-in slide-in-from-right duration-500">
               <div className="p-10 bg-zinc-900/20 border border-white/5 rounded-[3.5rem] glass space-y-8">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-emerald-600/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                        <Database size={32} />
                     </div>
                     <div>
                        <h4 className="text-2xl font-black italic tracking-tighter">SUPABASE BRIDGE</h4>
                        <p className="text-[10px] text-zinc-500 font-bold tracking-widest italic uppercase">Sync data otomatis dari database pusat</p>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase ml-2">Supabase URL</label>
                        <input 
                           type="text" 
                           value={data.supabaseSettings.url}
                           onChange={(e) => updateSupabase({ url: e.target.value })}
                           className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-xs text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                           placeholder="https://xxx.supabase.co"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase ml-2">Supabase API Key (Service Role)</label>
                        <input 
                           type="password" 
                           value={data.supabaseSettings.key}
                           onChange={(e) => updateSupabase({ key: e.target.value })}
                           className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-xs text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                           placeholder="eyJhbG..."
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase ml-2">Table Name</label>
                           <input 
                              type="text" 
                              value={data.supabaseSettings.tableName}
                              onChange={(e) => updateSupabase({ tableName: e.target.value })}
                              className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-xs text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                              placeholder="deliveries"
                           />
                        </div>
                        <div className="flex items-center gap-4 px-6 bg-white/5 rounded-2xl border border-white/5 mt-6">
                           <span className="text-[10px] font-black text-zinc-500 uppercase">ENABLE SYNC</span>
                           <button 
                              onClick={() => updateSupabase({ isEnabled: !data.supabaseSettings.isEnabled })}
                              className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${data.supabaseSettings.isEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                           >
                              <div className={`w-4 h-4 bg-white rounded-full transition-all ${data.supabaseSettings.isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="p-10 bg-zinc-900/20 border border-white/5 rounded-[3.5rem] glass space-y-8">
                  <div className="p-8 bg-black/40 rounded-3xl border border-white/5">
                     <h5 className="text-sm font-black italic mb-4 text-emerald-400 uppercase tracking-widest">DOKUMENTASI STRUKTUR TABEL</h5>
                     <div className="space-y-4 text-[11px] font-medium text-zinc-400 italic leading-relaxed">
                        <p>Pastikan tabel Supabase Anda memiliki kolom berikut:</p>
                        <ul className="space-y-2 list-disc ml-4">
                           <li><code className="text-emerald-400">resi</code> (TEXT) - Nomor Resi Paket</li>
                           <li><code className="text-emerald-400">customer_phone</code> (TEXT) - Nomor HP (Awalan 62)</li>
                           <li><code className="text-emerald-400">customer_name</code> (TEXT) - Nama Pelanggan</li>
                           <li><code className="text-emerald-400">price</code> (INTEGER) - Harga Ongkir/Paket</li>
                           <li><code className="text-emerald-400">status</code> (TEXT) - Nilai: 'RECEIVED'</li>
                           <li><code className="text-emerald-400">wa_sent</code> (BOOLEAN) - Default: FALSE</li>
                           <li><code className="text-emerald-400">branch_name</code> (TEXT) - Nama Cabang</li>
                        </ul>
                        <p className="mt-4 text-zinc-500">Sistem akan otomatis mengirim pesan ketika <code className="text-zinc-400">status='RECEIVED'</code> AND <code className="text-zinc-400">wa_sent=FALSE</code>.</p>
                     </div>
                  </div>
                  <div className="p-8 bg-emerald-600/10 border border-emerald-500/20 rounded-3xl flex items-center gap-6">
                     <Activity size={32} className="text-emerald-400" />
                     <p className="text-[10px] font-black italic text-zinc-300 uppercase leading-relaxed tracking-widest">Sistem melakukan polling setiap 60 detik untuk mendeteksi update status terbaru dari admin cabang.</p>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom duration-500">
               {data.accounts.map((acc: any) => (
                 <div key={acc.id} className="p-10 bg-zinc-900/20 border border-white/5 rounded-[3.5rem] glass flex flex-col items-center justify-between min-h-[500px] relative overflow-hidden group">
                    <div className="w-full flex justify-between items-center z-10">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest ${acc.status === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-orange-500/20 text-orange-500'}`}>
                         {acc.status}
                       </span>
                       <button onClick={async () => { await fetch(`/api/account/${acc.id}`, {method: 'DELETE'}); fetchData(); }} className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 transition-all hover:text-white">
                          <Trash2 size={18} />
                       </button>
                    </div>

                    {acc.qr ? (
                      <div className="bg-white p-6 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300">
                        <img src={acc.qr} alt="QR" className="w-56 h-56 mix-blend-multiply" />
                        <p className="text-[10px] text-zinc-900 font-black mt-4 text-center tracking-widest">SCAN TO ACTIVATE</p>
                      </div>
                    ) : (
                      <div className="text-center z-10">
                         <div className="w-28 h-28 bg-indigo-600/10 rounded-full flex items-center justify-center border border-indigo-500/20 mb-6 mx-auto group-hover:scale-110 transition-transform">
                           <Smartphone size={48} className="text-indigo-400" />
                         </div>
                         <h4 className="text-2xl font-black italic">{acc.number || "LINKED ACCOUNT"}</h4>
                         <p className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] mt-2">ID: {acc.id.toUpperCase()}</p>
                      </div>
                    )}

                    <div className="w-full z-10">
                       <div className="flex justify-between mb-2">
                          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Node Traffic</span>
                          <span className="text-[9px] font-black text-indigo-400 italic">LOAD BALANCED</span>
                       </div>
                       <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full bg-indigo-500 transition-all duration-1000 ${acc.status === 'CONNECTED' ? 'w-full' : 'w-0'}`} />
                       </div>
                    </div>
                 </div>
               ))}
               <button onClick={async () => { await fetch('/api/add-account', {method: 'POST'}); fetchData(); }} className="p-10 border-4 border-dashed border-zinc-800 rounded-[3.5rem] flex flex-col items-center justify-center gap-6 text-zinc-600 hover:text-indigo-500 hover:border-indigo-500/50 transition-all group">
                  <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                     <Plus size={40} />
                  </div>
                  <span className="text-sm font-black italic tracking-widest">ADD NEW NODE</span>
               </button>
            </div>
          )}

          {activeTab === 'dispatch' && (
            <div className="grid lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom duration-500">
               <div className="lg:col-span-2 p-12 bg-zinc-900/20 border border-white/5 rounded-[4rem] glass">
                  <div className="flex items-center gap-6 mb-10">
                    <div className="w-16 h-16 bg-indigo-600/10 rounded-3xl flex items-center justify-center border border-indigo-500/20 text-indigo-400 shadow-inner">
                       <SendHorizontal size={32} />
                    </div>
                    <h4 className="text-3xl font-black italic tracking-tighter">MANUAL DISPATCHER</h4>
                  </div>
                  
                  <textarea 
                    value={massInput}
                    onChange={(e) => setMassInput(e.target.value)}
                    className="w-full h-[400px] bg-black/50 border border-white/5 rounded-[3rem] p-10 text-base text-indigo-300 font-mono focus:ring-8 focus:ring-indigo-600/5 transition-all outline-none custom-scroll placeholder:text-zinc-800"
                    placeholder="62812345678|Andri|AL-001|Sedang Dikirim"
                  />

                  <button 
                    onClick={handleMassSend}
                    disabled={isSending || activeCount === 0}
                    className={`w-full mt-10 py-8 rounded-[2.5rem] font-black italic uppercase text-sm tracking-[0.4em] transition-all flex items-center justify-center gap-6 shadow-2xl ${
                      isSending || activeCount === 0 ? 'bg-zinc-800 text-zinc-600' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30'
                    }`}
                  >
                    {isSending ? <Loader2 size={24} className="animate-spin" /> : <Zap size={24} />}
                    {isSending ? 'SPOOLING...' : `ACTIVATE ENGINE`}
                  </button>
               </div>

               <div className="space-y-8">
                  <div className="p-10 bg-indigo-600 rounded-[3.5rem] shadow-2xl flex flex-col items-center justify-center text-center">
                     <Zap size={60} className="text-white mb-6" />
                     <h5 className="text-sm font-black italic mb-2 tracking-widest uppercase text-white">SMART AGGREGATOR</h5>
                     <p className="text-xs font-bold text-indigo-100/80 leading-relaxed uppercase tracking-widest italic">Jika ada nomor yang sama di textarea, sistem akan menggabungkannya menjadi satu pesan rapi secara otomatis.</p>
                  </div>
                  <div className="p-10 bg-zinc-900/20 border border-white/5 rounded-[3.5rem] glass">
                     <h5 className="text-sm font-black italic mb-6 tracking-widest text-indigo-400 uppercase">HINTS</h5>
                     <p className="text-[10px] font-bold text-zinc-500 uppercase leading-relaxed tracking-widest italic">Format: NOMOR|NAMA|RESI|STATUS. Gunakan baris baru untuk tiap paket.</p>
                  </div>
               </div>
            </div>
          )}

          {/* ... Tabs BOT dan LOGS dipertahankan dari versi sebelumnya ... */}
          {activeTab === 'bot' && (
             <div className="p-10 bg-zinc-900/20 border border-white/5 rounded-[3.5rem] glass animate-in fade-in duration-500">
                <div className="flex items-center gap-6 mb-10">
                    <Bot size={48} className="text-blue-400" />
                    <h4 className="text-2xl font-black italic">AI SUPPORT AGENT CONFIG</h4>
                </div>
                <div className="grid lg:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                        <span className="text-sm font-black italic">AUTO-REPLY ENGINE</span>
                        <button onClick={() => updateBotSettings({ isEnabled: !data.botSettings.isEnabled })} className={`w-12 h-6 rounded-full transition-all ${data.botSettings.isEnabled ? 'bg-blue-500' : 'bg-zinc-700'}`}>
                           <div className={`w-4 h-4 bg-white rounded-full transition-all ${data.botSettings.isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      <textarea 
                        value={data.botSettings.context}
                        onChange={(e) => updateBotSettings({ context: e.target.value })}
                        className="w-full h-80 bg-black/40 border border-white/5 rounded-[2rem] p-8 text-sm text-blue-300 outline-none"
                        placeholder="Info Andri Logistik..."
                      />
                   </div>
                   <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[2rem]">
                      <h5 className="text-[10px] font-black italic mb-4 uppercase tracking-widest text-blue-400">RECENT AI LOGS</h5>
                      <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scroll pr-4">
                         {data.logs.filter(l => l.type === 'BOT').map(l => (
                           <div key={l.id} className="p-4 bg-white/5 rounded-xl border border-white/5 text-[11px]">
                              <p className="text-blue-400 font-black mb-1">@{l.to}</p>
                              <p className="text-zinc-400 italic mb-1">"{l.msg}"</p>
                              <p className="text-white font-bold">{l.reply}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-zinc-900/20 border border-white/5 rounded-[4rem] glass overflow-hidden">
               <div className="p-10 border-b border-white/5 bg-white/5"><h4 className="text-lg font-black italic tracking-widest">SYSTEM AUDIT LOGS</h4></div>
               <div className="p-10 space-y-4 max-h-[800px] overflow-y-auto custom-scroll">
                  {data.logs.map((log: any) => (
                    <div key={log.id} className="p-6 bg-black/30 rounded-3xl border border-white/5 flex justify-between items-center">
                       <div className="flex gap-6 items-center">
                          <div className={`w-3 h-3 rounded-full ${log.type === 'BOT' ? 'bg-blue-500' : 'bg-indigo-500'}`} />
                          <div><p className="text-[11px] font-black text-white tracking-widest">@{log.to} <span className="text-zinc-600">[{log.type}]</span></p><p className="text-xs text-zinc-500 italic mt-1">{log.msg}</p></div>
                       </div>
                       <p className="text-[9px] font-black text-indigo-400 uppercase">SUCCESS</p>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
