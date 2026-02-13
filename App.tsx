
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, MessageSquare, Truck, SendHorizontal, 
  Shield, Rocket, Send, Database, ClipboardCheck,
  CheckCircle2, Loader2, BarChart3, Bot, Activity,
  Bell, Terminal, Search, MoreHorizontal, Zap, Plus, Trash2, Smartphone, Settings, Cpu, Link as LinkIcon, RefreshCw, Lock, Save
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
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === 'ANDRI123') {
        setIsAuthenticated(true);
    } else {
        alert("Akses Ditolak.");
    }
  };

  const saveSupabaseSettings = async () => {
    setIsSaving(true);
    await fetch('/api/supabase-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data.supabaseSettings)
    });
    setIsSaving(false);
    alert("Supabase Bridge Updated & Persistent!");
  };

  const saveBotSettings = async () => {
    setIsSaving(true);
    await fetch('/api/bot-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data.botSettings)
    });
    setIsSaving(false);
    alert("AI Bot Brain Updated!");
  };

  const activeCount = data.accounts.filter(a => a.status === 'CONNECTED').length;

  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-[#020203] flex items-center justify-center p-6">
         <div className="max-w-md w-full p-10 bg-zinc-900/50 border border-white/5 rounded-[3rem] glass text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-600/20">
               <Lock size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">ANDRI <span className="text-indigo-500">GATEWAY</span></h1>
            <form onSubmit={handleLogin} className="space-y-4">
               <input 
                  type="password" 
                  placeholder="ENTER ACCESS CODE"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-center text-sm font-black text-indigo-400 outline-none"
               />
               <button className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black italic tracking-widest">
                  AUTHORIZE
               </button>
            </form>
         </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#020203] text-zinc-100 uppercase tracking-tighter">
      {/* Sidebar */}
      <aside className="w-20 lg:w-72 bg-zinc-950/50 border-r border-white/5 flex flex-col glass z-50">
        <div className="p-8 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40">
            <Rocket size={24} className="text-white" />
          </div>
          <div className="hidden lg:block font-black italic">ANDRI <span className="text-indigo-500">ULTRA V18</span></div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'accounts', label: 'WA Nodes', icon: Smartphone },
            { id: 'supabase', label: 'Supabase Bridge', icon: Database },
            { id: 'bot', label: 'AI Settings', icon: Bot },
            { id: 'logs', label: 'Live Logs', icon: Terminal },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:bg-white/5'}`}>
              <item.icon size={20} />
              <span className="hidden lg:block text-[10px] font-black italic">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto custom-scroll">
        <header className="sticky top-0 z-40 p-8 flex justify-between items-center glass bg-[#020203]/80 border-b border-white/5">
           <h2 className="text-4xl font-black italic text-white uppercase">{activeTab}</h2>
           <div className="flex gap-4">
              <div className="text-right">
                 <p className="text-[8px] text-zinc-500 font-bold">NODE STATUS</p>
                 <p className="text-xs font-black text-emerald-500 uppercase">{activeCount > 0 ? 'ONLINE' : 'OFFLINE'}</p>
              </div>
              <button onClick={fetchData} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10">
                 <RefreshCw size={18} />
              </button>
           </div>
        </header>

        <div className="p-8 max-w-[1400px] mx-auto space-y-8">
           {activeTab === 'dashboard' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'SENT', val: data.stats.sent, icon: Send, color: 'text-emerald-500' },
                  { label: 'AGGREGATED', val: data.stats.aggregated, icon: Zap, color: 'text-yellow-500' },
                  { label: 'AI REPLIES', val: data.stats.botReplies, icon: Bot, color: 'text-blue-500' },
                  { label: 'RECEIVED', val: data.stats.received, icon: MessageSquare, color: 'text-indigo-500' },
                ].map((s, i) => (
                  <div key={i} className="p-10 bg-zinc-900/20 border border-white/5 rounded-[3rem] glass">
                     <p className="text-[10px] font-black text-zinc-500">{s.label}</p>
                     <h3 className={`text-5xl font-black italic ${s.color}`}>{s.val}</h3>
                  </div>
                ))}
             </div>
           )}

           {activeTab === 'supabase' && (
             <div className="p-12 bg-zinc-900/20 border border-white/5 rounded-[4rem] glass space-y-8 animate-in slide-in-from-right">
                <div className="flex justify-between items-center">
                   <div>
                      <h4 className="text-3xl font-black italic">SUPABASE CONFIG</h4>
                      <p className="text-[10px] text-zinc-500 font-bold italic">HUBUNGKAN DATABASE PUSAT KE WA GATEWAY</p>
                   </div>
                   <button 
                      onClick={saveSupabaseSettings}
                      disabled={isSaving}
                      className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center gap-4 font-black italic text-xs transition-all shadow-xl shadow-emerald-500/20"
                   >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      APPLY & PERSIST
                   </button>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 ml-4">SUPABASE URL</label>
                        <input 
                           type="text" 
                           value={data.supabaseSettings.url}
                           onChange={(e) => setData({...data, supabaseSettings: {...data.supabaseSettings, url: e.target.value}})}
                           className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-xs text-emerald-400 outline-none focus:border-emerald-500"
                           placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 ml-4">SERVICE ROLE KEY</label>
                        <input 
                           type="password" 
                           value={data.supabaseSettings.key}
                           onChange={(e) => setData({...data, supabaseSettings: {...data.supabaseSettings, key: e.target.value}})}
                           className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-xs text-emerald-400 outline-none focus:border-emerald-500"
                        />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 ml-4">TABLE NAME</label>
                        <input 
                           type="text" 
                           value={data.supabaseSettings.tableName}
                           onChange={(e) => setData({...data, supabaseSettings: {...data.supabaseSettings, tableName: e.target.value}})}
                           className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-xs text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="flex items-center justify-between p-7 bg-white/5 rounded-3xl border border-white/5 mt-8">
                         <span className="text-[10px] font-black text-zinc-400">STATUS SYNC OTOMATIS</span>
                         <button 
                            onClick={() => setData({...data, supabaseSettings: {...data.supabaseSettings, isEnabled: !data.supabaseSettings.isEnabled}})}
                            className={`w-14 h-7 rounded-full flex items-center px-1 transition-all ${data.supabaseSettings.isEnabled ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-zinc-700'}`}
                         >
                            <div className={`w-5 h-5 bg-white rounded-full transition-all ${data.supabaseSettings.isEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                         </button>
                      </div>
                   </div>
                </div>
                <div className="p-8 bg-emerald-600/10 border border-emerald-500/20 rounded-3xl text-[11px] font-medium text-zinc-400 italic">
                   💡 Info: Pastikan tabel Supabase Anda memiliki kolom: <code className="text-emerald-400">resi, customer_phone, customer_name, price, status (Nilai: RECEIVED), wa_sent (Boolean)</code>.
                </div>
             </div>
           )}

           {activeTab === 'bot' && (
             <div className="p-12 bg-zinc-900/20 border border-white/5 rounded-[4rem] glass space-y-8">
                <div className="flex justify-between items-center">
                   <h4 className="text-3xl font-black italic">AI BOT BRAIN</h4>
                   <button onClick={saveBotSettings} disabled={isSaving} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center gap-4 font-black italic text-xs">
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      TRAIN AI
                   </button>
                </div>
                <textarea 
                  value={data.botSettings.context}
                  onChange={(e) => setData({...data, botSettings: {...data.botSettings, context: e.target.value}})}
                  className="w-full h-64 bg-black/40 border border-white/5 rounded-[3rem] p-10 text-sm text-blue-300 outline-none focus:ring-8 focus:ring-blue-500/5 transition-all"
                  placeholder="Masukkan pengetahuan logistik Anda di sini agar AI bisa membalas dengan cerdas..."
                />
             </div>
           )}

           {activeTab === 'accounts' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.accounts.map((acc: any) => (
                  <div key={acc.id} className="p-10 bg-zinc-900/20 border border-white/5 rounded-[3.5rem] glass flex flex-col items-center gap-6 relative group overflow-hidden">
                     <div className="w-full flex justify-between">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black ${acc.status === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-orange-500/20 text-orange-500'}`}>
                           {acc.status}
                        </span>
                        <button onClick={async () => { await fetch(`/api/account/${acc.id}`, {method: 'DELETE'}); fetchData(); }} className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                           <Trash2 size={18} />
                        </button>
                     </div>
                     {acc.qr ? (
                       <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl animate-in zoom-in">
                          <img src={acc.qr} alt="QR" className="w-48 h-48 mix-blend-multiply" />
                       </div>
                     ) : (
                       <div className="w-24 h-24 bg-indigo-600/10 rounded-full flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                          <Smartphone size={40} />
                       </div>
                     )}
                     <h5 className="text-xl font-black italic">{acc.number || "NODE_ACTIVE"}</h5>
                  </div>
                ))}
                <button onClick={async () => { await fetch('/api/add-account', {method: 'POST'}); fetchData(); }} className="p-10 border-4 border-dashed border-zinc-800 rounded-[3.5rem] flex flex-col items-center justify-center gap-4 text-zinc-600 hover:text-indigo-500 hover:border-indigo-500 transition-all">
                   <Plus size={40} />
                   <span className="text-xs font-black italic uppercase">ADD NEW NODE</span>
                </button>
             </div>
           )}

           {activeTab === 'logs' && (
              <div className="bg-zinc-900/20 border border-white/5 rounded-[4rem] glass overflow-hidden">
                 <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h4 className="text-lg font-black italic">AUDIT TRAIL</h4>
                 </div>
                 <div className="p-10 space-y-4 max-h-[600px] overflow-y-auto custom-scroll">
                    {data.logs.map((log: any) => (
                      <div key={log.id} className="p-6 bg-black/30 rounded-3xl border border-white/5 flex justify-between items-center group hover:border-indigo-500/40 transition-all">
                         <div className="flex gap-6 items-center">
                            <div className={`w-3 h-3 rounded-full ${log.type === 'BOT' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                            <div>
                               <p className="text-[11px] font-black text-white">@{log.to} <span className="text-zinc-600">[{log.type}]</span></p>
                               <p className="text-xs text-zinc-500 italic mt-1 font-medium">{log.msg}</p>
                            </div>
                         </div>
                         <p className="text-[9px] font-black text-zinc-700 italic">#{log.id}</p>
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
