
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, MessageSquare, Truck, Rocket, Send, Database, 
  Loader2, Bot, Activity, Terminal, Zap, Plus, Trash2, Smartphone, 
  Settings, RefreshCw, Lock, Save, CheckCircle2, AlertTriangle, RefreshCcw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSaving, setIsSaving] = useState(false);
  
  const [data, setData] = useState({
    accounts: [] as any[],
    stats: { sent: 0, received: 0, botReplies: 0, aggregated: 0 },
    logs: [] as any[],
    botSettings: { isEnabled: true, context: "" },
    supabaseSettings: { url: '', key: '', tableName: 'packages', isEnabled: false, lastSync: '' },
    system: { ram: '0GB', cpu: '0', uptime: '0h' },
    chartData: [
      { name: '08:00', val: 5 }, { name: '10:00', val: 20 }, 
      { name: '12:00', val: 15 }, { name: '14:00', val: 40 },
      { name: '16:00', val: 35 }, { name: '18:00', val: 50 }
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
    if (accessCode === 'ANDRI123') setIsAuthenticated(true);
    else alert("Kode Salah!");
  };

  const saveSupabase = async () => {
    setIsSaving(true);
    try {
      const r = await fetch('/api/supabase-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.supabaseSettings)
      });
      if (r.ok) alert("Supabase Bridge Configured!");
    } catch (e) {
      alert("Gagal menghubungi server backend.");
    }
    setIsSaving(false);
    fetchData();
  };

  const saveBotSettings = async () => {
    setIsSaving(true);
    try {
      const r = await fetch('/api/bot-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.botSettings)
      });
      if (r.ok) alert("AI Settings Updated!");
    } catch (e) {
      alert("Gagal menghubungi server backend.");
    }
    setIsSaving(false);
    fetchData();
  };

  const activeCount = data.accounts.filter(a => a.status === 'CONNECTED').length;

  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-[#020203] flex items-center justify-center p-6 uppercase tracking-widest">
         <div className="max-w-md w-full p-12 bg-zinc-900/40 border border-white/5 rounded-[4rem] glass text-center space-y-10 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-600/40">
               <Lock size={44} className="text-white" />
            </div>
            <div>
               <h1 className="text-2xl font-black text-white">ANDRI GATEWAY <span className="text-indigo-500">v20.1</span></h1>
               <p className="text-[10px] text-zinc-500 font-black mt-2">Enter Credentials to Unlock System</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
               <input 
                  type="password" 
                  placeholder="AUTHORIZATION KEY"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-6 text-center text-sm font-black text-indigo-400 outline-none focus:border-indigo-500 transition-all"
               />
               <button className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs shadow-xl shadow-indigo-600/20">
                  ACTIVATE SYSTEM
               </button>
            </form>
         </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#020203] text-zinc-100 uppercase tracking-tighter overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 lg:w-80 bg-zinc-950/80 border-r border-white/5 flex flex-col glass z-50 transition-all">
        <div className="p-10 mb-6 flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/20">
            <Rocket size={24} className="text-white" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-black italic">ANDRI <span className="text-indigo-500">GATEWAY</span></h1>
            <p className="text-[9px] text-zinc-600 font-black">ENTERPRISE EDITION V20.1</p>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'accounts', label: 'WhatsApp Nodes', icon: Smartphone },
            { id: 'supabase', label: 'Database Sync', icon: Database },
            { id: 'bot', label: 'AI Support', icon: Bot },
            { id: 'logs', label: 'System Logs', icon: Terminal },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-5 p-5 rounded-[2rem] transition-all group ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20 scale-[1.02]' 
                : 'text-zinc-500 hover:bg-white/5'
              }`}
            >
              <item.icon size={22} />
              <span className="hidden lg:block text-[11px] font-black italic">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8">
           <div className={`p-6 rounded-[2rem] border transition-all ${activeCount > 0 ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
              <div className="flex items-center gap-3 mb-2">
                 <div className={`w-2 h-2 rounded-full ${activeCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                 <span className={`text-[9px] font-black ${activeCount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {activeCount > 0 ? 'ENGINE ONLINE' : 'ENGINE OFFLINE'}
                 </span>
              </div>
              <p className="text-[9px] font-black text-zinc-600">RAM: {data.system.ram}</p>
           </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto custom-scroll">
        <header className="sticky top-0 z-40 p-10 flex justify-between items-center glass border-b border-white/5 bg-[#020203]/90 backdrop-blur-xl">
          <div>
            <h2 className="text-5xl font-black italic text-white tracking-tighter">{activeTab.toUpperCase()}</h2>
            <div className="flex items-center gap-3 mt-2">
               <Activity size={12} className="text-indigo-500" />
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Real-time Node Control</p>
            </div>
          </div>
          <button onClick={fetchData} className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all border border-white/5">
             <RefreshCw size={24} className="text-zinc-400" />
          </button>
        </header>

        <div className="p-10 max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-700">
           {activeTab === 'dashboard' && (
             <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: 'WA SENT', val: data.stats.sent, icon: Send, color: 'text-emerald-400' },
                    { label: 'DB AGGREGATED', val: data.stats.aggregated, icon: Zap, color: 'text-yellow-400' },
                    { label: 'AI REPLIES', val: data.stats.botReplies, icon: Bot, color: 'text-blue-400' },
                    { label: 'INBOUND MSG', val: data.stats.received, icon: MessageSquare, color: 'text-indigo-400' },
                  ].map((s, i) => (
                    <div key={i} className="p-12 border border-white/5 rounded-[4rem] glass hover:border-white/10 transition-all relative overflow-hidden group">
                       <p className="text-[10px] font-black text-zinc-500 mb-2">{s.label}</p>
                       <h3 className={`text-6xl font-black italic ${s.color}`}>{s.val}</h3>
                       <div className="absolute -right-8 -bottom-8 opacity-[0.02] group-hover:scale-125 transition-transform duration-700">
                          <s.icon size={160} />
                       </div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                   <div className="lg:col-span-2 p-12 bg-zinc-900/10 border border-white/5 rounded-[5rem] glass">
                      <div className="flex justify-between items-center mb-12 px-4">
                         <h4 className="text-lg font-black italic text-zinc-400 tracking-widest italic">TRAFFIC FLOW MONITOR</h4>
                         <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-5 py-2 rounded-full font-black">24H CYCLE</span>
                      </div>
                      <div className="h-80 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={data.chartData}>
                             <defs>
                               <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                                 <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                               </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#111" />
                             <XAxis dataKey="name" stroke="#333" fontSize={10} axisLine={false} tickLine={false} />
                             <YAxis stroke="#333" fontSize={10} axisLine={false} tickLine={false} />
                             <Tooltip contentStyle={{ background: '#000', border: '1px solid #222', borderRadius: '15px' }} />
                             <Area type="monotone" dataKey="val" stroke="#6366f1" fill="url(#c)" strokeWidth={5} />
                           </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>

                   <div className="p-12 bg-indigo-600 rounded-[5rem] shadow-2xl shadow-indigo-600/20 flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                         <RefreshCcw size={200} />
                      </div>
                      <div className="space-y-10 relative z-10">
                         <h4 className="text-5xl font-black italic text-white leading-tight">ACTIVE<br/>METRICS</h4>
                         <div className="space-y-6">
                            {[
                               { l: 'Supabase Sync', v: data.supabaseSettings.isEnabled ? 'LIVE' : 'IDLE' },
                               { l: 'Node Health', v: activeCount > 0 ? 'EXCELLENT' : 'CRITICAL' },
                               { l: 'VPS Load', v: data.system.cpu + '%' },
                               { l: 'Uptime', v: data.system.uptime },
                            ].map((r, i) => (
                               <div key={i} className="flex justify-between items-center pb-5 border-b border-white/20">
                                  <span className="text-[11px] font-black text-indigo-100">{r.l}</span>
                                  <span className="text-[11px] font-black text-white">{r.v}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'accounts' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {data.accounts.map((acc: any) => (
                  <div key={acc.id} className="p-12 bg-zinc-900/20 border border-white/5 rounded-[4rem] glass flex flex-col items-center gap-10 relative overflow-hidden group animate-in zoom-in duration-500">
                     <div className="w-full flex justify-between items-center relative z-10">
                        <div className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest ${acc.status === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                           {acc.status}
                        </div>
                        <button onClick={async () => { if(confirm('Hapus Node ini?')) await fetch(`/api/account/${acc.id}`, {method: 'DELETE'}); fetchData(); }} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                           <Trash2 size={20} />
                        </button>
                     </div>

                     {acc.qr ? (
                       <div className="bg-white p-8 rounded-[3rem] shadow-2xl animate-in zoom-in duration-700 border-8 border-indigo-500/20 group-hover:scale-105 transition-transform">
                          <img src={acc.qr} alt="QR" className="w-60 h-60 mix-blend-multiply" />
                          <p className="text-[11px] text-zinc-900 font-black mt-5 text-center tracking-widest">SCAN IN WA MOBILE</p>
                       </div>
                     ) : (
                       <div className="text-center relative z-10 py-10">
                          <div className={`w-32 h-32 ${acc.status === 'CONNECTED' ? 'bg-indigo-600 shadow-indigo-600/50 shadow-2xl' : 'bg-zinc-800'} rounded-full flex items-center justify-center mb-8 mx-auto transition-all`}>
                             <Smartphone size={56} className="text-white" />
                          </div>
                          <h5 className="text-2xl font-black italic">{acc.number || "NODE DISCONNECTED"}</h5>
                          <p className="text-[10px] text-zinc-600 font-black mt-2 tracking-widest">ID: {acc.id.split('-')[1]}</p>
                       </div>
                     )}
                  </div>
                ))}
                
                <button 
                  onClick={async () => { await fetch('/api/add-account', {method: 'POST'}); fetchData(); }}
                  className="p-12 border-4 border-dashed border-zinc-900 rounded-[4rem] flex flex-col items-center justify-center gap-6 text-zinc-700 hover:text-indigo-500 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group"
                >
                   <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus size={44} />
                   </div>
                   <span className="text-xs font-black tracking-widest italic">CREATE NEW WA NODE</span>
                </button>
             </div>
           )}

           {activeTab === 'supabase' && (
             <div className="p-16 bg-zinc-900/10 border border-white/5 rounded-[5rem] glass space-y-12 animate-in slide-in-from-right duration-500">
                <div className="flex justify-between items-center">
                   <div>
                      <h4 className="text-4xl font-black italic text-white uppercase tracking-tighter">DATABASE BRIDGE</h4>
                      <p className="text-xs text-zinc-600 font-bold italic mt-2 tracking-widest uppercase">Supabase Real-time Synchronization Center</p>
                   </div>
                   <button 
                      onClick={saveSupabase}
                      disabled={isSaving}
                      className="px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl flex items-center gap-5 font-black italic text-xs transition-all shadow-2xl shadow-emerald-500/30"
                   >
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      APPLY & ACTIVATE
                   </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="space-y-3">
                         <label className="text-[11px] font-black text-zinc-600 ml-6 tracking-widest uppercase">Supabase API URL</label>
                         <input 
                           type="text" 
                           value={data.supabaseSettings.url}
                           onChange={(e) => setData({...data, supabaseSettings: {...data.supabaseSettings, url: e.target.value}})}
                           className="w-full bg-black/50 border border-white/10 rounded-3xl p-8 text-sm text-emerald-400 focus:border-emerald-500/50 outline-none transition-all"
                           placeholder="https://xyz.supabase.co"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[11px] font-black text-zinc-600 ml-6 tracking-widest uppercase">Service Role / Master Key</label>
                         <input 
                           type="password" 
                           value={data.supabaseSettings.key}
                           onChange={(e) => setData({...data, supabaseSettings: {...data.supabaseSettings, key: e.target.value}})}
                           className="w-full bg-black/50 border border-white/10 rounded-3xl p-8 text-sm text-emerald-400 focus:border-emerald-500/50 outline-none transition-all"
                         />
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="space-y-3">
                         <label className="text-[11px] font-black text-zinc-600 ml-6 tracking-widest uppercase">Supabase Table Name</label>
                         <input 
                           type="text" 
                           value={data.supabaseSettings.tableName}
                           onChange={(e) => setData({...data, supabaseSettings: {...data.supabaseSettings, tableName: e.target.value}})}
                           className="w-full bg-black/50 border border-white/10 rounded-3xl p-8 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                           placeholder="packages"
                         />
                      </div>
                      <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between mt-10">
                         <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${data.supabaseSettings.isEnabled ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500'} transition-all`}>
                               <RefreshCcw size={28} className={data.supabaseSettings.isEnabled ? 'animate-spin-slow' : ''} />
                            </div>
                            <div>
                               <p className="text-[11px] font-black text-white italic tracking-widest">LIVE POLLING</p>
                               <p className="text-[9px] font-bold text-zinc-600 uppercase italic">Every 45 Seconds</p>
                            </div>
                         </div>
                         <button 
                            onClick={() => setData({...data, supabaseSettings: {...data.supabaseSettings, isEnabled: !data.supabaseSettings.isEnabled}})}
                            className={`w-16 h-8 rounded-full flex items-center px-1.5 transition-all ${data.supabaseSettings.isEnabled ? 'bg-emerald-500 shadow-xl shadow-emerald-500/30' : 'bg-zinc-700'}`}
                         >
                            <div className={`w-5 h-5 bg-white rounded-full transition-all ${data.supabaseSettings.isEnabled ? 'translate-x-8' : 'translate-x-0'}`} />
                         </button>
                      </div>
                   </div>
                </div>

                <div className="p-10 bg-indigo-600/5 border border-indigo-500/20 rounded-[3rem] flex items-start gap-8">
                   <AlertTriangle className="text-indigo-500 mt-1 shrink-0" size={28} />
                   <p className="text-[13px] font-medium text-zinc-400 leading-relaxed italic">
                      Data yang ditarik otomatis adalah baris dengan <span className="text-indigo-400 font-black">status: 'RECEIVED'</span> dan <span className="text-indigo-400 font-black">wa_sent: false</span>. Sistem akan membaca kolom <span className="text-white font-black underline">receipt_number</span>, <span className="text-white font-black underline">owner_phone</span>, <span className="text-white font-black underline">owner_name</span>, dan <span className="text-white font-black underline">shipping_cost</span>. 
                   </p>
                </div>
             </div>
           )}

           {activeTab === 'bot' && (
             <div className="p-16 bg-zinc-900/20 border border-white/5 rounded-[5rem] glass space-y-12 animate-in slide-in-from-right">
                <div className="flex justify-between items-center">
                   <div>
                      <h4 className="text-4xl font-black italic uppercase tracking-tighter">AI LOGISTICS BRAIN</h4>
                      <p className="text-xs text-zinc-500 font-bold italic mt-2 uppercase tracking-widest">Configure Automated Reply Knowledge</p>
                   </div>
                   <button 
                      onClick={saveBotSettings} 
                      disabled={isSaving} 
                      className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl flex items-center gap-5 font-black italic text-xs shadow-2xl shadow-blue-500/20 transition-all"
                   >
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                      TRAIN AI ENGINE
                   </button>
                </div>
                <div className="relative group">
                   <textarea 
                     value={data.botSettings.context}
                     onChange={(e) => setData({...data, botSettings: {...data.botSettings, context: e.target.value}})}
                     className="w-full h-80 bg-black/40 border border-white/5 rounded-[4rem] p-12 text-sm text-blue-300 outline-none focus:ring-8 focus:ring-blue-500/10 transition-all custom-scroll leading-loose"
                     placeholder="Tuliskan pengetahuan tentang Andri Logistik di sini (alamat, tarif, aturan gudang, dll)..."
                   />
                   <div className="absolute top-8 right-12 opacity-10 group-hover:opacity-30 transition-opacity">
                      <Bot size={100} className="text-blue-500" />
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'logs' && (
             <div className="bg-zinc-900/10 border border-white/5 rounded-[5rem] glass overflow-hidden animate-in slide-in-from-bottom duration-700">
                <div className="p-12 border-b border-white/5 flex justify-between items-center bg-white/5">
                   <h4 className="text-2xl font-black italic text-white tracking-widest uppercase">AUDIT LOG ENGINE</h4>
                   <span className="text-[10px] px-6 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded-full font-black">STREAMING LIVE</span>
                </div>
                <div className="p-12 space-y-6 max-h-[800px] overflow-y-auto custom-scroll">
                   {data.logs.map((log: any) => (
                     <div key={log.id} className="p-8 bg-black/40 rounded-[3rem] border border-white/5 flex justify-between items-center group hover:border-indigo-500/40 transition-all animate-in slide-in-from-left duration-500">
                        <div className="flex gap-8 items-center">
                           <div className={`w-4 h-4 rounded-full ${log.type === 'BOT' ? 'bg-blue-500 shadow-blue-500/50' : 'bg-emerald-500 shadow-emerald-500/50'} shadow-lg`} />
                           <div>
                              <p className="text-sm font-black text-white italic tracking-wider">@{log.to} <span className="text-zinc-700 text-[10px] ml-4 uppercase">[{log.type}]</span></p>
                              <p className="text-sm text-zinc-500 italic mt-2 font-medium">{log.msg}</p>
                              {log.reply && (
                                 <p className="text-[11px] text-indigo-400 italic mt-4 bg-indigo-500/5 p-5 rounded-[1.5rem] border border-indigo-500/10">↳ {log.reply}</p>
                              )}
                           </div>
                        </div>
                        <p className="text-[10px] font-black text-zinc-800 uppercase italic">TRX_{log.id.toString().slice(-6)}</p>
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
