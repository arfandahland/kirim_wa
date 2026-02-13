
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
      if (r.ok) {
        const updateData = await r.json();
        setData(prev => ({ ...prev, ...updateData }));
      }
    } catch (e) {
      console.error("Refresh failed", e);
    }
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
    if (accessCode === 'ADMIN123') {
      setIsLocked(false);
    } else {
      alert("KODE OTORISASI SALAH! GUNAKAN: ADMIN123");
    }
  };

  const handleCreateNode = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      const response = await fetch('/api/node', { method: 'POST' });
      if (response.ok) {
        await refresh();
      } else {
        alert("Gagal membuat node baru. Cek koneksi server.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsBusy(false);
    }
  };

  const updateSetting = async (type: string, body: any) => {
    setIsBusy(true);
    try {
      await fetch(`/api/settings/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      await refresh();
    } catch (e) {
      alert("Gagal menyimpan pengaturan.");
    } finally {
      setIsBusy(false);
    }
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
      {/* Side Navigation */}
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
             </div>
           )}

           {activeTab === 'nodes' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {data.nodes.map((n: any) => (
                  <div key={n.id} className="p-14 bg-zinc-950/20 border border-white/5 rounded-[5rem] glass flex flex-col items-center gap-12 relative overflow-hidden group">
                     <div className="w-full flex justify-between items-center relative z-10">
                        <div className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase ${n.status === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                           {n.status}
                        </div>
                        <button 
                          disabled={isBusy}
                          onClick={async () => { if(confirm('Eject Node?')) { await fetch(`/api/node/${n.id}`, {method: 'DELETE'}); refresh(); } }} 
                          className="p-5 bg-rose-500/10 text-rose-500 rounded-3xl hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                        >
                           <Trash2 size={24} />
                        </button>
                     </div>
                     {n.qr ? (
                       <div className="bg-white p-10 rounded-[4rem] border-[10px] border-indigo-500/20 animate-pulse">
                          <img src={n.qr} alt="QR" className="w-64 h-64 mix-blend-multiply" />
                          <p className="text-[10px] text-zinc-900 font-black mt-4 text-center">SCAN QR SEKARANG</p>
                       </div>
                     ) : (
                       <div className="text-center py-10">
                          <div className={`w-36 h-36 ${n.status === 'CONNECTED' ? 'bg-indigo-600 shadow-2xl shadow-indigo-600/30' : 'bg-zinc-900'} rounded-[3rem] flex items-center justify-center mb-10 mx-auto transition-all`}>
                             <Smartphone size={64} className="text-white fill-white" />
                          </div>
                          <h5 className="text-3xl font-black italic text-white">+{n.number || "NODE"}</h5>
                          <p className="text-[10px] text-zinc-500 mt-2">{n.id}</p>
                       </div>
                     )}
                  </div>
                ))}
                <button 
                  onClick={handleCreateNode}
                  disabled={isBusy}
                  className={`p-14 border-4 border-dashed rounded-[5rem] flex flex-col items-center justify-center gap-8 transition-all ${isBusy ? 'border-indigo-500 bg-indigo-500/5 text-indigo-500 cursor-not-allowed' : 'border-zinc-900 text-zinc-800 hover:text-indigo-500 hover:border-indigo-500/30'}`}
                >
                   {isBusy ? (
                     <Loader2 size={48} className="animate-spin text-indigo-500" />
                   ) : (
                     <Plus size={48} />
                   )}
                   <span className="text-sm font-black italic uppercase">
                     {isBusy ? 'INITIALIZING ENGINE...' : 'INITIALIZE NEW NODE'}
                   </span>
                </button>
             </div>
           )}

           {!['overview', 'nodes'].includes(activeTab) && (
             <div className="h-[600px] flex flex-col items-center justify-center glass rounded-[6rem] border-white/5 text-center space-y-10">
                <div className="w-32 h-32 bg-indigo-600/10 rounded-full flex items-center justify-center text-indigo-500 animate-pulse">
                   <Layers size={80} />
                </div>
                <h4 className="text-4xl font-black italic text-white uppercase tracking-tighter">TAB: {activeTab.toUpperCase()}</h4>
                <p className="text-sm text-zinc-600 font-bold italic tracking-widest max-w-2xl mx-auto uppercase">
                   Modul ini sedang memuat data real-time dari singularity engine...
                </p>
             </div>
           )}

        </div>
      </main>
    </div>
  );
};

export default App;
