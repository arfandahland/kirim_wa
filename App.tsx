
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, MessageSquare, Truck, SendHorizontal, 
  Shield, Rocket, Send, Database, ClipboardCheck,
  CheckCircle2, Loader2, BarChart3, Bot, Activity,
  Bell, Terminal, Search, MoreHorizontal, Zap, Plus, Trash2, Smartphone, Settings, Cpu, Link as LinkIcon, RefreshCw, Lock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [massInput, setMassInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [data, setData] = useState({
    accounts: [] as any[],
    stats: { sent: 0, received: 0, botReplies: 0, aggregated: 0 },
    logs: [] as any[],
    botSettings: { isEnabled: true, context: "" },
    supabaseSettings: { url: '', key: '', tableName: 'deliveries', isEnabled: false, lastSync: '' },
    system: { ram: '0GB', cpu: '0', uptime: '0h' },
    chartData: [
      { name: '08:00', val: 10 }, { name: '10:00', val: 45 }, 
      { name: '12:00', val: 30 }, { name: '14:00', val: 85 },
      { name: '16:00', val: 120 }, { name: '18:00', val: 90 }
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
    if (isAuthenticated) {
      fetchData();
      const interval = setInterval(fetchData, 4000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === 'ANDRI123') { // Simple multi-user access code
        setIsAuthenticated(true);
    } else {
        alert("Akses Ditolak. Hubungi Admin Pusat.");
    }
  };

  const updateSupabase = async (settings: any) => {
    await fetch('/api/supabase-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    fetchData();
  };

  const activeCount = data.accounts.filter(a => a.status === 'CONNECTED').length;

  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-[#020203] flex items-center justify-center p-6">
         <div className="max-w-md w-full p-10 bg-zinc-900/50 border border-white/5 rounded-[3rem] glass text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-600/20">
               <Lock size={32} className="text-white" />
            </div>
            <div>
               <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">ANDRI <span className="text-indigo-500">ACCESS</span></h1>
               <p className="text-[10px] font-black text-zinc-500 tracking-[0.5em] mt-2 uppercase italic">Enterprise Gateway v17.0</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
               <input 
                  type="password" 
                  placeholder="ENTER ACCESS CODE"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-center text-sm font-black tracking-widest text-indigo-400 outline-none focus:border-indigo-500 transition-all"
               />
               <button className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black italic text-xs tracking-widest transition-all">
                  AUTHORIZE SYSTEM
               </button>
            </form>
            <p className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">© 2025 ANDRI LOGISTIK GROUP INDONESIA</p>
         </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#020203] text-zinc-100 uppercase tracking-tighter selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-20 lg:w-72 bg-zinc-950/50 border-r border-white/5 flex flex-col glass z-50 transition-all">
        <div className="p-8 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40">
            <Rocket size={24} className="text-white" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-black italic tracking-tighter">ANDRI <span className="text-indigo-500">ULTRA</span></h1>
            <p className="text-[9px] text-zinc-500 font-bold tracking-[0.4em]">v17.0 VPS-READY</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'accounts', label: 'WA Nodes', icon: Smartphone },
            { id: 'supabase', label: 'DB Sync', icon: Database },
            { id: 'bot', label: 'AI Gemini', icon: Bot },
            { id: 'logs', label: 'System Logs', icon: Terminal },
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
                 <span className="text-[8px] font-black text-emerald-400 italic">SYSTEM ONLINE</span>
              </div>
              <p className="text-[9px] font-bold text-zinc-400">NODES: {activeCount} | UP: {data.system.uptime}</p>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scroll">
        <header className="sticky top-0 z-40 p-8 flex justify-between items-center glass border-b border-white/5 bg-[#020203]/80">
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter text-white">{activeTab.toUpperCase()}</h2>
            <div className="flex gap-4 mt-2">
               <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-black">● AGGREGATOR V2</span>
               <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-black uppercase">● VPS SYNC ACTIVE</span>
            </div>
          </div>
          <div className="flex gap-8">
             <div className="text-right hidden sm:block border-r border-white/5 pr-8">
                <p className="text-[8px] text-zinc-500 font-bold italic">RAM USAGE</p>
                <p className="text-sm font-black text-indigo-400">{data.system.ram}</p>
             </div>
             <div className="text-right hidden sm:block">
                <p className="text-[8px] text-zinc-500 font-bold italic">LOAD AVG</p>
                <p className="text-sm font-black text-orange-400">{data.system.cpu}</p>
             </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: 'WA DISPATCHED', val: data.stats.sent, icon: Send, color: 'text-emerald-500' },
                   { label: 'SAVED (AGG)', val: data.stats.aggregated, icon: Zap, color: 'text-yellow-500' },
                   { label: 'AI REPLIES', val: data.stats.botReplies, icon: Bot, color: 'text-blue-500' },
                   { label: 'INBOUND', val: data.stats.received, icon: MessageSquare, color: 'text-indigo-500' },
                 ].map((s, i) => (
                   <div key={i} className="p-10 bg-zinc-900/20 border border-white/5 rounded-[3rem] glass group relative overflow-hidden">
                      <p className="text-[10px] font-black text-zinc-500 mb-1">{s.label}</p>
                      <h3 className={`text-5xl font-black italic tracking-tighter ${s.color}`}>{s.val}</h3>
                      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform"><s.icon size={100} /></div>
                   </div>
                 ))}
               </div>

               <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 p-10 bg-zinc-900/20 border border-white/5 rounded-[3.5rem] glass">
                     <h4 className="text-lg font-black italic mb-10 text-indigo-400 tracking-widest uppercase">DISPATCH ANALYTICS</h4>
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
                  <div className="p-10 bg-zinc-900/20 border border-white/5 rounded-[3.5rem] glass space-y-6">
                     <h4 className="text-sm font-black italic text-zinc-500 uppercase tracking-widest">DEPLOYMENT STATUS</h4>
                     <div className="space-y-4">
                        {[
                          { label: 'GitHub Sync', status: 'LATEST' },
                          { label: 'VPS Node', status: 'DOCKER_V3' },
                          { label: 'Supabase Engine', status: 'ACTIVE' },
                          { label: 'WA Socket 7.0', status: 'READY' },
                        ].map((item, i) => (
                           <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                              <span className="text-[10px] font-bold text-zinc-400 italic">{item.label}</span>
                              <span className="text-[10px] font-black text-emerald-500">{item.status}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {data.accounts.map((acc: any) => (
                 <div key={acc.id} className="p-10 bg-zinc-900/20 border border-white/5 rounded-[3.5rem] glass flex flex-col items-center justify-between min-h-[500px] relative overflow-hidden group">
                    <div className="w-full flex justify-between items-center z-10">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest ${acc.status === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-orange-500/20 text-orange-500'}`}>
                         {acc.status}
                       </span>
                       <button onClick={async () => { await fetch(`/api/account/${acc.id}`, {method: 'DELETE'}); fetchData(); }} className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 transition-all">
                          <Trash2 size={18} />
                       </button>
                    </div>

                    {acc.qr ? (
                      <div className="bg-white p-6 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300">
                        <img src={acc.qr} alt="QR" className="w-56 h-56 mix-blend-multiply" />
                        <p className="text-[10px] text-zinc-900 font-black mt-4 text-center tracking-widest uppercase">SCAN VIA APP</p>
                      </div>
                    ) : (
                      <div className="text-center z-10">
                         <div className="w-28 h-28 bg-indigo-600/10 rounded-full flex items-center justify-center border border-indigo-500/20 mb-6 mx-auto group-hover:scale-110 transition-transform">
                           <Smartphone size={48} className="text-indigo-400" />
                         </div>
                         <h4 className="text-2xl font-black italic">{acc.number || "UNLINKED NODE"}</h4>
                         <p className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] mt-2 uppercase italic">NODE_ID: {acc.id.substring(5,15)}</p>
                      </div>
                    )}

                    <div className="w-full z-10">
                       <div className="flex justify-between mb-2">
                          <span className="text-[9px] font-black text-zinc-500 uppercase italic">CONNECTION STRENGTH</span>
                          <span className="text-[9px] font-black text-indigo-400 italic uppercase">ENCRYPTED</span>
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
                  <span className="text-sm font-black italic tracking-widest uppercase italic">INITIALIZE NEW NODE</span>
               </button>
            </div>
          )}

          {activeTab === 'supabase' && (
            <div className="grid lg:grid-cols-2 gap-8">
               <div className="p-12 bg-zinc-900/20 border border-white/5 rounded-[4rem] glass space-y-10">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-emerald-600/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 text-emerald-400 shadow-2xl">
                        <Database size={32} />
                     </div>
                     <div>
                        <h4 className="text-3xl font-black italic tracking-tighter">SUPABASE SYNC HUB</h4>
                        <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase italic">Automatic Multi-Branch Sync</p>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase ml-4">Supabase API URL</label>
                        <input 
                           type="text" 
                           value={data.supabaseSettings.url}
                           onChange={(e) => updateSupabase({ url: e.target.value })}
                           className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-xs text-emerald-400 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                           placeholder="https://xxx.supabase.co"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase ml-4">Service Role Key</label>
                        <input 
                           type="password" 
                           value={data.supabaseSettings.key}
                           onChange={(e) => updateSupabase({ key: e.target.value })}
                           className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-xs text-emerald-400 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                           placeholder="SECRET_TOKEN_HERE"
                        />
                     </div>
                     <div className="flex items-center justify-between p-8 bg-white/5 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-6">
                           <RefreshCw size={24} className="text-emerald-500 animate-spin-slow" />
                           <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] italic">REAL-TIME POLLING</span>
                        </div>
                        <button 
                           onClick={() => updateSupabase({ isEnabled: !data.supabaseSettings.isEnabled })}
                           className={`w-14 h-7 rounded-full transition-all flex items-center px-1 ${data.supabaseSettings.isEnabled ? 'bg-emerald-500 shadow-xl shadow-emerald-500/20' : 'bg-zinc-700'}`}
                        >
                           <div className={`w-5 h-5 bg-white rounded-full transition-all ${data.supabaseSettings.isEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                     </div>
                  </div>
               </div>

               <div className="p-12 bg-emerald-600 rounded-[4rem] shadow-2xl shadow-emerald-600/20 relative overflow-hidden group flex flex-col justify-between">
                   <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform"><Database size={200} /></div>
                   <div className="relative z-10">
                      <h4 className="text-5xl font-black italic tracking-tighter text-white leading-none mb-6 uppercase">SMART HUB CONNECTED</h4>
                      <p className="text-xs font-bold text-emerald-50/70 uppercase tracking-widest italic leading-loose">Data dari setiap admin cabang (Lelilef, Weda, dll) akan ditarik secara otomatis. Sistem akan menggabungkan resi jika ada nomor HP yang sama dalam antrian pengiriman.</p>
                   </div>
                   <div className="p-6 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-sm">
                       <p className="text-[10px] font-black text-white italic mb-2 tracking-widest uppercase">AGGREGATION RULES</p>
                       <ul className="text-[9px] font-bold text-emerald-100 uppercase space-y-1 italic">
                          <li>• Max 20 Resis per WA message</li>
                          <li>• Automatic Price Calculation</li>
                          <li>• Branch Identity Detection</li>
                       </ul>
                   </div>
               </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-zinc-900/20 border border-white/5 rounded-[4rem] glass overflow-hidden">
               <div className="p-10 border-b border-white/5 bg-white/5 flex justify-between items-center">
                  <h4 className="text-lg font-black italic tracking-widest text-white uppercase italic">SYSTEM ACTIVITY LOGS</h4>
                  <div className="flex gap-4">
                     <span className="text-[10px] px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl font-black italic uppercase">LIVE AUDIT</span>
                  </div>
               </div>
               <div className="p-10 space-y-4 max-h-[700px] overflow-y-auto custom-scroll">
                  {data.logs.map((log: any) => (
                    <div key={log.id} className="p-6 bg-black/30 rounded-3xl border border-white/5 flex justify-between items-center group hover:border-indigo-500/50 transition-all animate-in slide-in-from-left">
                       <div className="flex gap-6 items-center">
                          <div className={`w-3 h-3 rounded-full ${log.type === 'BOT' ? 'bg-blue-500' : 'bg-emerald-500 animate-pulse'}`} />
                          <div>
                             <p className="text-[11px] font-black text-white tracking-widest uppercase italic">@{log.to} <span className="text-zinc-600">[{log.type}]</span></p>
                             <p className="text-xs text-zinc-500 italic mt-1 font-medium">{log.msg}</p>
                          </div>
                       </div>
                       <p className="text-[9px] font-black text-zinc-700 uppercase italic tracking-widest font-mono">TS_{log.id}</p>
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
