
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, MessageSquare, Truck, Rocket, Send, Database, 
  Loader2, Bot, Activity, Terminal, Zap, Plus, Trash2, Smartphone, 
  Settings, RefreshCw, Lock, Save, CheckCircle2, AlertTriangle
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
    } catch (e) {
      console.error("Fetch Error:", e);
    }
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
    if (accessCode === 'ANDRI123') {
        setIsAuthenticated(true);
    } else {
        alert("Akses Ditolak. Gunakan Kode Resmi.");
    }
  };

  const saveSupabaseSettings = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/supabase-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.supabaseSettings)
      });
      alert("Database Bridge Updated!");
    } catch(e) {
      alert("Gagal menyimpan setting.");
    }
    setIsSaving(false);
    fetchData();
  };

  const saveBotSettings = async () => {
    setIsSaving(true);
    await fetch('/api/bot-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data.botSettings)
    });
    setIsSaving(false);
    alert("Bot Trained Successfully!");
  };

  const activeCount = data.accounts.filter(a => a.status === 'CONNECTED').length;

  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-[#020203] flex items-center justify-center p-6">
         <div className="max-w-md w-full p-12 bg-zinc-900/50 border border-white/5 rounded-[4rem] glass text-center space-y-8 animate-in fade-in zoom-in">
            <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl shadow-indigo-600/30">
               <Lock size={40} className="text-white" />
            </div>
            <div>
               <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">ANDRI <span className="text-indigo-500">SYSTEM</span></h1>
               <p className="text-[10px] font-black text-zinc-500 tracking-[0.4em] uppercase mt-2">Enterprise Access v19</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
               <input 
                  type="password" 
                  placeholder="AUTHORIZATION KEY"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="w-full bg-black/50 border border-white/10 rounded-3xl p-6 text-center text-sm font-black text-indigo-400 outline-none focus:border-indigo-500 transition-all"
               />
               <button className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black italic tracking-widest text-xs uppercase shadow-xl shadow-indigo-600/20">
                  ACTIVATE GATEWAY
               </button>
            </form>
         </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#020203] text-zinc-100 uppercase tracking-tighter selection:bg-indigo-500/30">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-72 bg-zinc-950/50 border-r border-white/5 flex flex-col glass z-50 transition-all">
        <div className="p-10 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
            <Rocket size={24} className="text-white" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-black italic">ANDRI <span className="text-indigo-500">LOGISTIK</span></h1>
            <p className="text-[9px] text-zinc-500 font-bold tracking-[0.4em]">ELITE v19.0</p>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-3">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'accounts', label: 'WA Nodes', icon: Smartphone },
            { id: 'supabase', label: 'DB Bridge', icon: Database },
            { id: 'bot', label: 'AI Brain', icon: Bot },
            { id: 'logs', label: 'Live Audit', icon: Terminal },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-5 p-5 rounded-3xl transition-all group ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20 scale-[1.03]' 
                : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
              }`}
            >
              <item.icon size={22} />
              <span className="hidden lg:block text-[11px] font-black italic tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8">
           <div className={`p-5 rounded-3xl border transition-all ${activeCount > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
              <div className="flex items-center gap-3 mb-2">
                 <div className={`w-2 h-2 rounded-full ${activeCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                 <span className={`text-[9px] font-black ${activeCount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {activeCount > 0 ? 'ACTIVE ENGINE' : 'ENGINE OFFLINE'}
                 </span>
              </div>
              <p className="text-[9px] font-bold text-zinc-500">UPTIME: {data.system.uptime}</p>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scroll relative">
        <header className="sticky top-0 z-40 p-10 flex justify-between items-center glass border-b border-white/5 bg-[#020203]/80 backdrop-blur-xl">
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter text-white">{activeTab.toUpperCase()}</h2>
            <p className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] mt-1 uppercase italic">System Management Center</p>
          </div>
          <div className="flex gap-6 items-center">
             <div className="text-right border-r border-white/5 pr-6 hidden sm:block">
                <p className="text-[8px] text-zinc-600 font-black italic uppercase">VPS RAM</p>
                <p className="text-xs font-black text-indigo-400">{data.system.ram}</p>
             </div>
             <button onClick={fetchData} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all">
                <RefreshCw size={20} />
             </button>
          </div>
        </header>

        <div className="p-10 max-w-[1500px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom duration-700">
           {activeTab === 'dashboard' && (
             <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: 'DISPATCHED', val: data.stats.sent, icon: Send, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                    { label: 'AGGREGATED', val: data.stats.aggregated, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/5' },
                    { label: 'AI REPLIES', val: data.stats.botReplies, icon: Bot, color: 'text-blue-500', bg: 'bg-blue-500/5' },
                    { label: 'INBOUND', val: data.stats.received, icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
                  ].map((s, i) => (
                    <div key={i} className={`p-12 border border-white/5 rounded-[3.5rem] glass hover:scale-[1.02] transition-transform relative overflow-hidden group`}>
                       <p className="text-[10px] font-black text-zinc-500 mb-1">{s.label}</p>
                       <h3 className={`text-6xl font-black italic tracking-tighter ${s.color}`}>{s.val}</h3>
                       <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-125 transition-transform">
                          <s.icon size={120} />
                       </div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                   <div className="lg:col-span-2 p-12 bg-zinc-900/10 border border-white/5 rounded-[4rem] glass">
                      <div className="flex justify-between items-center mb-12">
                         <h4 className="text-xl font-black italic text-white tracking-widest uppercase italic">TRAFFIC ANALYTICS</h4>
                         <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-4 py-1 rounded-full font-black italic">LIVE 24H</span>
                      </div>
                      <div className="h-80 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={data.chartData}>
                             <defs>
                               <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                 <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                               </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                             <XAxis dataKey="name" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                             <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                             <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #1e2937', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' }} />
                             <Area type="monotone" dataKey="val" stroke="#6366f1" fill="url(#colorVal)" strokeWidth={4} />
                           </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>

                   <div className="p-12 bg-indigo-600 rounded-[4rem] shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform"><Activity size={200} /></div>
                      <div className="relative z-10 space-y-8">
                         <h4 className="text-4xl font-black italic text-white leading-none uppercase">SYSTEM<br/>STATUS</h4>
                         <div className="space-y-4">
                            {[
                               { l: 'Node Status', v: activeCount > 0 ? 'READY' : 'WAIT' },
                               { l: 'Supabase Sync', v: data.supabaseSettings.isEnabled ? 'ACTIVE' : 'OFF' },
                               { l: 'Bot Brain', v: data.botSettings.isEnabled ? 'ONLINE' : 'OFF' },
                               { l: 'VPS Load', v: data.system.cpu + '%' },
                            ].map((row, i) => (
                               <div key={i} className="flex justify-between items-center py-4 border-b border-white/20">
                                  <span className="text-[11px] font-black text-indigo-100 italic uppercase tracking-wider">{row.l}</span>
                                  <span className="text-[11px] font-black text-white">{row.v}</span>
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
                  <div key={acc.id} className="p-12 bg-zinc-900/20 border border-white/5 rounded-[4rem] glass flex flex-col items-center gap-8 relative overflow-hidden group animate-in zoom-in">
                     <div className="w-full flex justify-between items-center z-10">
                        <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase ${acc.status === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                           {acc.status}
                        </span>
                        <button onClick={async () => { if(confirm('Hapus Node ini?')) await fetch(`/api/account/${acc.id}`, {method: 'DELETE'}); fetchData(); }} className="p-4 bg-rose-500/10 text-rose-500 rounded-[1.5rem] hover:bg-rose-500 hover:text-white transition-all">
                           <Trash2 size={20} />
                        </button>
                     </div>

                     {acc.qr ? (
                       <div className="bg-white p-8 rounded-[3.5rem] shadow-2xl animate-in zoom-in duration-500 border-8 border-indigo-500/10">
                          <img src={acc.qr} alt="QR" className="w-56 h-56 mix-blend-multiply" />
                          <p className="text-[10px] text-zinc-900 font-black mt-4 text-center tracking-[0.3em] uppercase">SCAN VIA WA</p>
                       </div>
                     ) : (
                       <div className="text-center z-10">
                          <div className="w-32 h-32 bg-indigo-600/10 rounded-full flex items-center justify-center border border-indigo-500/20 text-indigo-400 mb-6 mx-auto group-hover:scale-110 transition-transform">
                             <Smartphone size={56} />
                          </div>
                          <h5 className="text-2xl font-black italic">{acc.number || "UNLINKED NODE"}</h5>
                          <p className="text-[10px] text-zinc-500 font-bold mt-2 uppercase italic tracking-widest">ID: {acc.id.substring(5,15)}</p>
                       </div>
                     )}

                     <div className="w-full z-10 pt-6">
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                           <div className={`h-full bg-indigo-500 transition-all duration-1000 ${acc.status === 'CONNECTED' ? 'w-full' : 'w-0'}`} />
                        </div>
                     </div>
                  </div>
                ))}
                
                <button 
                  onClick={async () => { await fetch('/api/add-account', {method: 'POST'}); fetchData(); }}
                  className="p-12 border-4 border-dashed border-zinc-800 rounded-[4rem] flex flex-col items-center justify-center gap-6 text-zinc-600 hover:text-indigo-500 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                >
                   <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus size={44} />
                   </div>
                   <span className="text-sm font-black italic tracking-[0.2em] uppercase italic">ADD NEW NODE</span>
                </button>
             </div>
           )}

           {activeTab === 'supabase' && (
             <div className="p-16 bg-zinc-900/20 border border-white/5 rounded-[5rem] glass space-y-12 animate-in slide-in-from-right relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10">
                   <div>
                      <h4 className="text-4xl font-black italic text-white uppercase tracking-tighter">DATABASE BRIDGE</h4>
                      <p className="text-xs text-zinc-500 font-bold italic mt-2 uppercase tracking-widest">Connect Supabase to WA Gateway Engine</p>
                   </div>
                   <button 
                      onClick={saveSupabaseSettings}
                      disabled={isSaving}
                      className="px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl flex items-center gap-5 font-black italic text-xs transition-all shadow-2xl shadow-emerald-500/20"
                   >
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      APPLY CONFIGURATION
                   </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 relative z-10">
                   <div className="space-y-6">
                      <div className="space-y-3">
                         <label className="text-[11px] font-black text-zinc-500 ml-6 uppercase tracking-widest">Supabase Endpoint URL</label>
                         <input 
                           type="text" 
                           value={data.supabaseSettings.url}
                           onChange={(e) => setData({...data, supabaseSettings: {...data.supabaseSettings, url: e.target.value}})}
                           className="w-full bg-black/40 border border-white/10 rounded-[2.5rem] p-8 text-sm text-emerald-400 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                           placeholder="https://xxx.supabase.co"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[11px] font-black text-zinc-500 ml-6 uppercase tracking-widest">Service Role / API Key</label>
                         <input 
                           type="password" 
                           value={data.supabaseSettings.key}
                           onChange={(e) => setData({...data, supabaseSettings: {...data.supabaseSettings, key: e.target.value}})}
                           className="w-full bg-black/40 border border-white/10 rounded-[2.5rem] p-8 text-sm text-emerald-400 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                           placeholder="eyJ..."
                         />
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-3">
                         <label className="text-[11px] font-black text-zinc-500 ml-6 uppercase tracking-widest">Target Table Name</label>
                         <input 
                           type="text" 
                           value={data.supabaseSettings.tableName}
                           onChange={(e) => setData({...data, supabaseSettings: {...data.supabaseSettings, tableName: e.target.value}})}
                           className="w-full bg-black/40 border border-white/10 rounded-[2.5rem] p-8 text-sm text-white outline-none focus:border-indigo-500 transition-all"
                           placeholder="packages"
                         />
                      </div>
                      <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 flex items-center justify-between mt-10">
                         <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${data.supabaseSettings.isEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-500'}`}>
                               <RefreshCw size={24} className={data.supabaseSettings.isEnabled ? 'animate-spin-slow' : ''} />
                            </div>
                            <div>
                               <p className="text-[11px] font-black text-white italic uppercase tracking-widest">SYNC STATUS</p>
                               <p className="text-[10px] font-bold text-zinc-500 uppercase italic">POLLING EVERY 60S</p>
                            </div>
                         </div>
                         <button 
                            onClick={() => setData({...data, supabaseSettings: {...data.supabaseSettings, isEnabled: !data.supabaseSettings.isEnabled}})}
                            className={`w-16 h-8 rounded-full flex items-center px-1.5 transition-all ${data.supabaseSettings.isEnabled ? 'bg-emerald-500 shadow-xl shadow-emerald-500/20' : 'bg-zinc-700'}`}
                         >
                            <div className={`w-5 h-5 bg-white rounded-full transition-all ${data.supabaseSettings.isEnabled ? 'translate-x-8' : 'translate-x-0'}`} />
                         </button>
                      </div>
                   </div>
                </div>

                <div className="p-10 bg-emerald-600/5 border border-emerald-500/20 rounded-[3rem] flex items-start gap-6 relative z-10">
                   <AlertTriangle className="text-emerald-500 mt-1 shrink-0" size={24} />
                   <p className="text-[12px] font-medium text-zinc-400 leading-relaxed italic">
                      Sistem akan membaca data paket dengan <span className="text-emerald-400 font-black">status: 'RECEIVED'</span> dan <span className="text-emerald-400 font-black">wa_sent: false</span>. Pastikan kolom <span className="text-white font-bold underline">owner_phone</span>, <span className="text-white font-bold underline">owner_name</span>, <span className="text-white font-bold underline">receipt_number</span>, dan <span className="text-white font-bold underline">shipping_cost</span> tersedia di tabel Supabase Anda.
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
             <div className="bg-zinc-900/10 border border-white/5 rounded-[5rem] glass overflow-hidden animate-in slide-in-from-bottom">
                <div className="p-12 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
                   <div>
                      <h4 className="text-2xl font-black italic uppercase tracking-widest text-white">SYSTEM AUDIT TRAIL</h4>
                      <p className="text-[10px] text-zinc-600 font-black italic uppercase tracking-widest mt-1">Real-time Activity Monitoring</p>
                   </div>
                   <div className="flex gap-4">
                      <span className="text-[10px] px-5 py-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded-2xl font-black italic uppercase">LIVE FEED</span>
                   </div>
                </div>
                <div className="p-12 space-y-5 max-h-[800px] overflow-y-auto custom-scroll">
                   {data.logs.length === 0 ? (
                     <div className="text-center p-20 text-zinc-700 italic font-black uppercase tracking-widest">No activity recorded yet</div>
                   ) : (
                     data.logs.map((log: any) => (
                       <div key={log.id} className="p-8 bg-black/30 rounded-[3rem] border border-white/5 flex justify-between items-center group hover:border-indigo-500/40 hover:bg-white/5 transition-all animate-in slide-in-from-left duration-500">
                          <div className="flex gap-8 items-center">
                             <div className={`w-4 h-4 rounded-full ${log.type === 'BOT' ? 'bg-blue-500 shadow-lg shadow-blue-500/50' : 'bg-emerald-500 shadow-lg shadow-emerald-500/50'}`} />
                             <div>
                                <p className="text-[13px] font-black text-white tracking-widest uppercase italic">
                                   @{log.to} <span className="text-zinc-700 text-[10px] ml-4">[{log.type}]</span>
                                </p>
                                <p className="text-[13px] text-zinc-500 italic mt-1 font-medium leading-relaxed">{log.msg}</p>
                                {log.reply && (
                                   <p className="text-[11px] text-indigo-400 italic mt-3 bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">↳ {log.reply}</p>
                                )}
                             </div>
                          </div>
                          <p className="text-[10px] font-black text-zinc-800 italic group-hover:text-zinc-600 transition-colors">TRX_{log.id}</p>
                       </div>
                     ))
                   )}
                </div>
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default App;
