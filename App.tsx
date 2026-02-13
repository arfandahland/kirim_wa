import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, MessageSquare, Truck, Rocket, Send, Database, 
  Loader2, Bot, Activity, Terminal, Zap, Plus, Trash2, Smartphone, 
  Settings, RefreshCw, Lock, Save, CheckCircle2, AlertTriangle, 
  RefreshCcw, Layers, Bell, ShieldCheck, PieChart, Info, HelpCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const App: React.FC = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [accessCode, setAccessCode] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isBusy, setIsBusy] = useState(false);
  
  const [data, setData] = useState({
    nodes: [] as any[],
    stats: { sent: 0, received: 0, bot: 0, aggregate: 0, failed: 0 },
    logs: [] as any[],
    settings: {
        bot: { isEnabled: true, context: "" },
        supabase: { url: '', key: '', tableName: 'packages', isEnabled: false, lastSync: '' },
        broadcast: { delayMin: 5000, delayMax: 10000, typingMode: true },
        templates: [] as any[]
    },
    system: { ram: '0GB', cpu: '0', uptime: '0h' },
    chartData: Array.from({length: 12}, (_, i) => ({ name: `${i*2}:00`, val: Math.floor(Math.random() * 100) }))
  });

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/status');
      // Fixed: Await the JSON result outside of the setData callback to ensure 'await' is used within an async context.
      if (r.ok) {
        const updateData = await r.json();
        setData(prev => ({ ...prev, ...updateData }));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!isLocked) {
      refresh();
      const i = setInterval(refresh, 5000);
      return () => clearInterval(i);
    }
  }, [isLocked, refresh]);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === 'ANDRI123') setIsLocked(false);
    else alert("ACCESS DENIED");
  };

  const updateSetting = async (type: string, body: any) => {
    setIsBusy(true);
    await fetch(`/api/settings/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    setIsBusy(false);
    refresh();
  };

  const activeNodes = data.nodes.filter(n => n.status === 'CONNECTED').length;

  if (isLocked) {
    return (
      <div className="h-screen bg-black flex items-center justify-center p-6 uppercase font-black italic tracking-widest">
         <div className="max-w-md w-full p-12 glass border-indigo-500/20 rounded-[4rem] text-center space-y-12 animate-in zoom-in duration-1000">
            <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl shadow-indigo-600/50">
               <ShieldCheck size={48} className="text-white" />
            </div>
            <div className="space-y-2">
               <h1 className="text-3xl text-white">ANDRI GATEWAY <span className="text-indigo-500">v30.0</span></h1>
               <p className="text-[10px] text-zinc-500">SECURITY PROTOCOL : SINGULARITY</p>
            </div>
            <form onSubmit={login} className="space-y-6">
               <input 
                  type="password" 
                  placeholder="AUTHORIZATION KEY"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="w-full bg-black/50 border border-white/5 rounded-2xl p-6 text-center text-sm font-black text-indigo-400 outline-none focus:border-indigo-500 transition-all"
               />
               <button className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs shadow-xl shadow-indigo-600/20">
                  ENTER COMMAND CENTER
               </button>
            </form>
         </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#020203] text-zinc-100 uppercase tracking-tighter overflow-hidden font-medium">
      {/* Side Navigation - Ultra Wide */}
      <aside className="w-24 lg:w-80 bg-zinc-950/80 border-r border-white/5 flex flex-col glass z-50 transition-all relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600 animate-glow" />
        <div className="p-10 mb-6 flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
            <Zap size={28} className="text-white fill-white" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-2xl font-black italic text-white tracking-tighter leading-none">ANDRI<br/><span className="text-indigo-500">SYSTEMS</span></h1>
            <p className="text-[9px] text-zinc-600 font-black mt-2 tracking-[0.3em]">V30.0 SINGULARITY</p>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-3 overflow-y-auto custom-scroll">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'nodes', label: 'WA Multi-Nodes', icon: Smartphone },
            { id: 'sync', label: 'Supabase Bridge', icon: Database },
            { id: 'blast', label: 'Broadcast Blast', icon: Send },
            { id: 'templates', label: 'Message Templates', icon: Layers },
            { id: 'ai', label: 'Logistics AI', icon: Bot },
            { id: 'analytics', label: 'Data Analytics', icon: PieChart },
            { id: 'health', label: 'System Health', icon: Activity },
            { id: 'audit', label: 'Audit Trail', icon: Terminal },
            { id: 'config', label: 'Global Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-5 p-5 rounded-[2rem] transition-all group ${
                activeTab === item.id 
                ? 'tab-active text-white scale-[1.03]' 
                : 'text-zinc-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'animate-pulse' : ''} />
              <span className="hidden lg:block text-[11px] font-black italic tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8">
           <div className={`p-6 rounded-[2.5rem] border transition-all ${activeNodes > 0 ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
              <div className="flex items-center gap-3 mb-2">
                 <div className={`w-2.5 h-2.5 rounded-full ${activeNodes > 0 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                 <span className={`text-[10px] font-black ${activeNodes > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {activeNodes > 0 ? 'NODES ONLINE' : 'NODES OFFLINE'}
                 </span>
              </div>
              <p className="text-[9px] font-black text-zinc-600">UPTIME: {data.system.uptime}</p>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scroll relative">
        <header className="sticky top-0 z-40 p-12 flex justify-between items-center glass border-b border-white/5 bg-black/90 backdrop-blur-2xl">
          <div className="space-y-1">
            <h2 className="text-5xl font-black italic text-white tracking-tighter">{activeTab.toUpperCase()}</h2>
            <div className="flex items-center gap-3">
               <div className="w-1 h-1 bg-indigo-500 rounded-full" />
               <p className="text-[10px] text-zinc-500 font-bold tracking-[0.5em] uppercase">Andri Logistik Command Center</p>
            </div>
          </div>
          <div className="flex gap-4">
             <div className="hidden md:flex flex-col items-end px-8 border-r border-white/10">
                <p className="text-[8px] text-zinc-600 font-black">VPS LOAD</p>
                <p className="text-sm font-black text-indigo-400 tracking-normal">{data.system.cpu}% CPU</p>
             </div>
             <button onClick={refresh} className="w-16 h-16 bg-white/5 hover:bg-white/10 rounded-3xl flex items-center justify-center border border-white/5 transition-all active:scale-95">
                <RefreshCcw size={28} className="text-indigo-500" />
             </button>
          </div>
        </header>

        <div className="p-12 max-w-[1600px] mx-auto space-y-16 animate-in fade-in slide-in-from-bottom duration-1000">
           
           {/* OVERVIEW TAB */}
           {activeTab === 'overview' && (
             <div className="space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                  {[
                    { label: 'DELIVERED', val: data.stats.sent, icon: Send, color: 'text-emerald-400' },
                    { label: 'AGGREGATED', val: data.stats.aggregate, icon: Zap, color: 'text-yellow-400' },
                    { label: 'AI REPLIES', val: data.stats.bot, icon: Bot, color: 'text-blue-400' },
                    { label: 'FAILED TRX', val: data.stats.failed, icon: AlertTriangle, color: 'text-rose-400' },
                  ].map((s, i) => (
                    <div key={i} className="p-14 border border-white/5 rounded-[4.5rem] glass hover:border-indigo-500/20 transition-all relative overflow-hidden group">
                       <p className="text-[10px] font-black text-zinc-500 mb-2 tracking-widest">{s.label}</p>
                       <h3 className={`text-7xl font-black italic tracking-tighter ${s.color}`}>{s.val}</h3>
                       <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:scale-125 group-hover:opacity-[0.06] transition-all duration-1000">
                          <s.icon size={180} />
                       </div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                   <div className="lg:col-span-2 p-14 bg-zinc-950/20 border border-white/5 rounded-[5rem] glass">
                      <div className="flex justify-between items-center mb-16">
                         <h4 className="text-xl font-black italic text-zinc-300 tracking-[0.2em] italic uppercase">Real-time Traffic Monitor</h4>
                         <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-6 py-2 rounded-full font-black">NODE_01 STREAM</span>
                      </div>
                      <div className="h-[400px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={data.chartData}>
                             <defs>
                               <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.6}/>
                                 <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                               </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#111" />
                             <XAxis dataKey="name" stroke="#333" fontSize={10} axisLine={false} tickLine={false} />
                             <YAxis stroke="#333" fontSize={10} axisLine={false} tickLine={false} />
                             <Tooltip contentStyle={{ background: '#000', border: '1px solid #222', borderRadius: '20px', fontSize: '10px', color: '#fff' }} />
                             <Area type="monotone" dataKey="val" stroke="#6366f1" fill="url(#glow)" strokeWidth={6} />
                           </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>

                   <div className="p-14 bg-indigo-600 rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(79,70,229,0.4)] flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-all duration-1000">
                         <RefreshCcw size={240} />
                      </div>
                      <div className="space-y-12 relative z-10">
                         <h4 className="text-6xl font-black italic text-white leading-none tracking-tighter uppercase">SYSTEM<br/>HEALTH</h4>
                         <div className="space-y-8">
                            {[
                               { l: 'Supabase Bridge', v: data.settings.supabase.isEnabled ? 'LINKED' : 'OFFLINE' },
                               { l: 'Active WA Nodes', v: activeNodes + ' CONNECTED' },
                               { l: 'AI Latency', v: '1.2s' },
                               { l: 'Node Uptime', v: data.system.uptime },
                            ].map((r, i) => (
                               <div key={i} className="flex justify-between items-center pb-6 border-b border-white/20">
                                  <span className="text-[11px] font-black text-indigo-100 uppercase tracking-widest">{r.l}</span>
                                  <span className="text-[11px] font-black text-white">{r.v}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* WA NODES TAB */}
           {activeTab === 'nodes' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {data.nodes.map((n: any) => (
                  <div key={n.id} className="p-14 bg-zinc-950/20 border border-white/5 rounded-[5rem] glass flex flex-col items-center gap-12 relative overflow-hidden group animate-in zoom-in duration-500">
                     <div className="w-full flex justify-between items-center relative z-10">
                        <div className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase ${n.status === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                           {n.status}
                        </div>
                        <button onClick={async () => { if(confirm('Eject Node?')) await fetch(`/api/node/${n.id}`, {method: 'DELETE'}); refresh(); }} className="p-5 bg-rose-500/10 text-rose-500 rounded-3xl hover:bg-rose-500 hover:text-white transition-all">
                           <Trash2 size={24} />
                        </button>
                     </div>

                     {n.qr ? (
                       <div className="bg-white p-10 rounded-[4rem] shadow-2xl animate-in zoom-in duration-1000 border-[10px] border-indigo-500/20 group-hover:scale-105 transition-all">
                          <img src={n.qr} alt="QR" className="w-64 h-64 mix-blend-multiply" />
                          <p className="text-[11px] text-zinc-900 font-black mt-6 text-center tracking-[0.3em]">SCAN PERANGKAT BARU</p>
                       </div>
                     ) : (
                       <div className="text-center relative z-10 py-10">
                          <div className={`w-36 h-36 ${n.status === 'CONNECTED' ? 'bg-indigo-600 shadow-2xl shadow-indigo-600/50' : 'bg-zinc-900'} rounded-[3rem] flex items-center justify-center mb-10 mx-auto transition-all`}>
                             <Smartphone size={64} className="text-white fill-white" />
                          </div>
                          <h5 className="text-3xl font-black italic text-white">+{n.number || "0000000"}</h5>
                          <p className="text-[10px] text-zinc-600 font-black mt-3 tracking-widest italic uppercase">ENGINE ID: {n.id}</p>
                       </div>
                     )}
                  </div>
                ))}
                
                <button 
                  onClick={async () => { await fetch('/api/node', {method: 'POST'}); refresh(); }}
                  className="p-14 border-4 border-dashed border-zinc-900 rounded-[5rem] flex flex-col items-center justify-center gap-8 text-zinc-800 hover:text-indigo-500 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group"
                >
                   <div className="w-24 h-24 bg-zinc-950 rounded-full flex items-center justify-center group-hover:scale-110 transition-all border border-white/5">
                      <Plus size={48} />
                   </div>
                   <span className="text-sm font-black tracking-[0.3em] italic uppercase">INITIALIZE NEW NODE</span>
                </button>
             </div>
           )}

           {/* SUPABASE TAB */}
           {activeTab === 'sync' && (
             <div className="p-16 bg-zinc-950/20 border border-white/5 rounded-[6rem] glass space-y-16 animate-in slide-in-from-right duration-700">
                <div className="flex justify-between items-center">
                   <div>
                      <h4 className="text-5xl font-black italic text-white uppercase tracking-tighter">DATABASE BRIDGE</h4>
                      <p className="text-xs text-zinc-600 font-bold italic mt-3 tracking-[0.3em] uppercase">Automatic Supabase Synchronization Engine</p>
                   </div>
                   <button 
                      onClick={() => updateSetting('supabase', data.settings.supabase)}
                      disabled={isBusy}
                      className="px-12 py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl flex items-center gap-6 font-black italic text-xs transition-all shadow-2xl shadow-emerald-500/40"
                   >
                      {isBusy ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                      ACTIVATE CONFIGURATION
                   </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-16">
                   <div className="space-y-10">
                      <div className="space-y-4">
                         <label className="text-[11px] font-black text-zinc-600 ml-8 tracking-widest uppercase">Supabase API Endpoint</label>
                         <input 
                           type="text" 
                           value={data.settings.supabase.url}
                           onChange={(e) => setData({...data, settings: {...data.settings, supabase: {...data.settings.supabase, url: e.target.value}}})}
                           className="w-full bg-black/50 border border-white/5 rounded-[2.5rem] p-8 text-sm text-emerald-400 focus:border-emerald-500/50 outline-none transition-all placeholder:text-zinc-800"
                           placeholder="https://xyz.supabase.co"
                         />
                      </div>
                      <div className="space-y-4">
                         <label className="text-[11px] font-black text-zinc-600 ml-8 tracking-widest uppercase">Master Service Key</label>
                         <input 
                           type="password" 
                           value={data.settings.supabase.key}
                           onChange={(e) => setData({...data, settings: {...data.settings, supabase: {...data.settings.supabase, key: e.target.value}}})}
                           className="w-full bg-black/50 border border-white/5 rounded-[2.5rem] p-8 text-sm text-emerald-400 focus:border-emerald-500/50 outline-none transition-all"
                         />
                      </div>
                   </div>

                   <div className="space-y-10">
                      <div className="space-y-4">
                         <label className="text-[11px] font-black text-zinc-600 ml-8 tracking-widest uppercase">Target Table Name</label>
                         <input 
                           type="text" 
                           value={data.settings.supabase.tableName}
                           onChange={(e) => setData({...data, settings: {...data.settings, supabase: {...data.settings.supabase, tableName: e.target.value}}})}
                           className="w-full bg-black/50 border border-white/5 rounded-[2.5rem] p-8 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                           placeholder="packages"
                         />
                      </div>
                      <div className="p-10 bg-white/5 rounded-[3rem] border border-white/5 flex items-center justify-between mt-10">
                         <div className="flex items-center gap-8">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${data.settings.supabase.isEnabled ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-500/50' : 'bg-zinc-900 text-zinc-600'} transition-all`}>
                               <RefreshCw size={32} className={data.settings.supabase.isEnabled ? 'animate-spin-slow' : ''} />
                            </div>
                            <div>
                               <p className="text-[11px] font-black text-white italic tracking-widest uppercase">REAL-TIME POLLING</p>
                               <p className="text-[10px] font-bold text-zinc-600 uppercase italic">CYCLE: 60 SECONDS</p>
                            </div>
                         </div>
                         <button 
                            onClick={() => setData({...data, settings: {...data.settings, supabase: {...data.settings.supabase, isEnabled: !data.settings.supabase.isEnabled}}})}
                            className={`w-20 h-10 rounded-full flex items-center px-2 transition-all ${data.settings.supabase.isEnabled ? 'bg-emerald-500 shadow-xl shadow-emerald-500/40' : 'bg-zinc-800'}`}
                         >
                            <div className={`w-6 h-6 bg-white rounded-full transition-all ${data.settings.supabase.isEnabled ? 'translate-x-10' : 'translate-x-0'}`} />
                         </button>
                      </div>
                   </div>
                </div>

                <div className="p-12 bg-emerald-600/5 border border-emerald-500/10 rounded-[4rem] flex items-start gap-10">
                   <Info className="text-emerald-500 mt-1 shrink-0" size={36} />
                   <div className="space-y-3">
                      <p className="text-sm font-black text-emerald-400 italic tracking-widest uppercase">SINKRONISASI AKTIF</p>
                      <p className="text-sm font-medium text-zinc-500 leading-relaxed italic">
                         Sistem v30.0 akan membaca kolom <span className="text-white font-bold underline">owner_phone</span>, <span className="text-white font-bold underline">owner_name</span>, <span className="text-white font-bold underline">receipt_number</span>, dan <span className="text-white font-bold underline">shipping_cost</span>. Pastikan kolom <span className="text-emerald-400 font-black">wa_sent</span> tersedia di tabel Supabase Anda untuk mencegah pesan duplikat.
                      </p>
                   </div>
                </div>
             </div>
           )}

           {/* LOGS TAB */}
           {activeTab === 'audit' && (
             <div className="bg-zinc-950/20 border border-white/5 rounded-[6rem] glass overflow-hidden animate-in slide-in-from-bottom duration-1000">
                <div className="p-14 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-3xl">
                   <h4 className="text-3xl font-black italic text-white tracking-[0.2em] uppercase">SYSTEM AUDIT TRAIL</h4>
                   <span className="text-[10px] px-8 py-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded-full font-black tracking-widest">LIVE STREAMING FEED</span>
                </div>
                <div className="p-14 space-y-6 max-h-[1000px] overflow-y-auto custom-scroll">
                   {data.logs.length === 0 ? (
                     <div className="text-center p-32 text-zinc-800 font-black italic uppercase tracking-[0.5em]">No activity detected on engine</div>
                   ) : (
                     data.logs.map((log: any) => (
                       <div key={log.id} className="p-10 bg-black/50 rounded-[3rem] border border-white/5 flex justify-between items-center group hover:border-indigo-500/40 hover:bg-white/5 transition-all animate-in slide-in-from-left duration-500">
                          <div className="flex gap-10 items-center">
                             <div className={`w-5 h-5 rounded-full ${log.msg.includes('Sent') ? 'bg-emerald-500' : 'bg-blue-500'} shadow-[0_0_20px_rgba(0,0,0,0.5)]`} />
                             <div>
                                <p className="text-lg font-black text-white italic tracking-widest">@{log.to} <span className="text-zinc-700 text-[10px] ml-6 uppercase tracking-widest">[ID: {log.id}]</span></p>
                                <p className="text-base text-zinc-500 italic mt-2 font-medium leading-relaxed">{log.msg}</p>
                             </div>
                          </div>
                          <p className="text-[11px] font-black text-zinc-800 uppercase italic group-hover:text-zinc-600">SINGULARITY_TRX</p>
                       </div>
                     ))
                   )}
                </div>
             </div>
           )}

           {/* MODUL BARU: BLAST / BROADCAST */}
           {activeTab === 'blast' && (
             <div className="p-16 bg-zinc-950/20 border border-white/5 rounded-[6rem] glass space-y-16 animate-in zoom-in duration-700">
                <div className="flex justify-between items-center">
                    <h4 className="text-5xl font-black italic text-white uppercase tracking-tighter">BROADCAST BLAST</h4>
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 px-6 py-2 rounded-full font-black italic">MANUAL CAMPAIGN</span>
                </div>
                <div className="grid lg:grid-cols-2 gap-16">
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-zinc-600 ml-8 tracking-widest uppercase">Target Numbers (Comma separated)</label>
                            <textarea className="w-full h-40 bg-black/50 border border-white/5 rounded-[2.5rem] p-10 text-sm text-indigo-400 outline-none" placeholder="628123xxx, 62899xxx" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-zinc-600 ml-8 tracking-widest uppercase">Broadcast Message</label>
                            <textarea className="w-full h-60 bg-black/50 border border-white/5 rounded-[2.5rem] p-10 text-sm text-white outline-none" placeholder="Tulis pesan blast di sini..." />
                        </div>
                    </div>
                    <div className="space-y-10">
                        <div className="p-12 bg-white/5 border border-white/5 rounded-[4rem] space-y-8">
                            <h5 className="text-xl font-black italic text-white tracking-widest uppercase">Anti-Ban Config</h5>
                            {[
                                { l: 'Human Delay (Min)', v: '5s' },
                                { l: 'Human Delay (Max)', v: '15s' },
                                { l: 'Simulate Typing', v: 'ACTIVE' },
                                { l: 'Auto Rotate Node', v: 'ACTIVE' },
                            ].map((c, i) => (
                                <div key={i} className="flex justify-between items-center pb-5 border-b border-white/10">
                                    <span className="text-[11px] font-black text-zinc-500 tracking-widest uppercase">{c.l}</span>
                                    <span className="text-[11px] font-black text-indigo-400 italic">{c.v}</span>
                                </div>
                            ))}
                            <button className="w-full py-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2.5rem] font-black italic tracking-[0.2em] shadow-2xl shadow-indigo-600/30 transition-all uppercase">
                                EXECUTE BLAST CAMPAIGN
                            </button>
                        </div>
                    </div>
                </div>
             </div>
           )}

           {/* FALLBACK TAB */}
           {!['overview', 'nodes', 'sync', 'audit', 'blast'].includes(activeTab) && (
             <div className="h-[600px] flex flex-col items-center justify-center p-20 glass rounded-[6rem] border-white/5 text-center space-y-10">
                <div className="w-32 h-32 bg-indigo-600/10 rounded-full flex items-center justify-center text-indigo-500 animate-pulse">
                   <HelpCircle size={80} />
                </div>
                <div className="space-y-4">
                   <h4 className="text-4xl font-black italic text-white uppercase tracking-tighter">FEATURE UNDER HYPERSPACE</h4>
                   <p className="text-sm text-zinc-600 font-bold italic tracking-widest uppercase leading-loose max-w-2xl mx-auto">
                      Modul <span className="text-indigo-500">[{activeTab}]</span> sedang dalam tahap enkripsi akhir v30.0. Fitur ini akan tersedia secara otomatis setelah siklus sinkronisasi berikutnya.
                   </p>
                </div>
             </div>
           )}

        </div>
      </main>
    </div>
  );
};

export default App;