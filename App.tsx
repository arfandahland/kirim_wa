
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, MessageSquare, Truck, SendHorizontal, 
  Settings, Shield, Zap, Rocket, Send, Database, ClipboardCheck,
  AlertCircle, CheckCircle2, Globe, Server, Activity, Smartphone
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({
    isConnected: false,
    stats: { sent: 0, received: 0, hits: 0 },
    inbox: [] as any[],
    logs: [] as any[],
    qr: null as string | null,
    system: { ram: '0 GB', cpu: '0%' }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const r = await fetch('/api/status');
        if (r.ok) {
          const d = await r.json();
          setData(d);
        }
      } catch (e) {
        console.warn("Backend connection standby...");
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', label: 'Inbox Customer', icon: MessageSquare },
    { id: 'logistics', label: 'Logistik Pro', icon: Truck },
    { id: 'supabase', label: 'Supabase Webhook', icon: Database },
    { id: 'settings', label: 'Sistem & Anti-Ban', icon: Shield },
  ];

  const currentLabel = menuItems.find(m => m.id === activeTab)?.label || 'Module';

  return (
    <div className="flex h-screen bg-[#020203] text-zinc-100 overflow-hidden font-sans uppercase">
      {/* Sidebar */}
      <aside className="w-72 bg-zinc-900/20 border-r border-zinc-800/40 flex flex-col p-6 glass z-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 ring-4 ring-indigo-500/10">
            <Rocket size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tighter italic text-white">Andri <span className="text-indigo-500">Logistik</span></h2>
            <p className="text-[9px] text-zinc-500 font-bold tracking-[0.3em]">v14.0 Enterprise</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                  activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 scale-[1.02]' 
                  : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                <Icon size={18} className={activeTab === item.id ? 'text-white' : 'group-hover:text-indigo-400'} />
                <span className="text-[10px] font-black italic tracking-wider">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-5 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] glass">
          <div className="flex items-center justify-between mb-3 text-[9px] font-bold text-zinc-500">
            <span className="tracking-widest">STATUS MESIN</span>
            <div className={`w-2 h-2 rounded-full ${data.isConnected ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} />
          </div>
          <p className="text-xs font-black italic tracking-widest text-zinc-200">
            {data.isConnected ? 'WA CONNECTED' : 'OFFLINE / WAITING SCAN'}
          </p>
          {data.isConnected && (
             <div className="mt-3 pt-3 border-t border-zinc-800/50 flex gap-4">
                <div className="flex-1">
                  <p className="text-[8px] text-zinc-500 font-bold">LATENCY</p>
                  <p className="text-[10px] font-black text-emerald-400">GOOD</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-[8px] text-zinc-500 font-bold">MODE</p>
                  <p className="text-[10px] font-black text-indigo-400">STEALTH</p>
                </div>
             </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 relative custom-scroll">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="flex justify-between items-center mb-12 relative z-10">
          <div>
            <h3 className="text-4xl font-black italic tracking-tighter text-white">{String(currentLabel)}</h3>
            <p className="text-zinc-500 text-[10px] font-bold mt-2 tracking-[0.3em] uppercase italic underline decoration-indigo-500/50 decoration-2 underline-offset-4">Automation Powered by Andri Logistik Engine</p>
          </div>
          <div className="flex gap-4">
             <div className="px-6 py-3 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl text-center glass">
                <p className="text-[8px] text-zinc-500 font-bold tracking-widest uppercase">CPU LOAD</p>
                <p className="text-lg font-black text-orange-500 italic">{String(data.system.cpu)}</p>
             </div>
             <div className="px-6 py-3 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl text-center glass">
                <p className="text-[8px] text-zinc-500 font-bold tracking-widest uppercase">RAM USAGE</p>
                <p className="text-lg font-black text-purple-500 italic">{String(data.system.ram)}</p>
             </div>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <div className="p-8 bg-zinc-900/20 border border-zinc-800/40 rounded-[3rem] relative overflow-hidden group glass">
                  <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all duration-700"><Send size={160} /></div>
                  <p className="text-[10px] font-bold text-zinc-500 mb-2 tracking-[0.2em]">WH SENT SUCCESS</p>
                  <h4 className="text-6xl font-black text-emerald-500 italic tracking-tighter">{Number(data.stats.sent)}</h4>
               </div>
               <div className="p-8 bg-zinc-900/20 border border-zinc-800/40 rounded-[3rem] relative overflow-hidden group glass">
                  <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all duration-700"><Database size={160} /></div>
                  <p className="text-[10px] font-bold text-zinc-500 mb-2 tracking-[0.2em]">SUPABASE HITS</p>
                  <h4 className="text-6xl font-black text-indigo-500 italic tracking-tighter">{Number(data.stats.hits)}</h4>
               </div>
               <div className="p-8 bg-zinc-900/20 border border-zinc-800/40 rounded-[3rem] relative overflow-hidden group glass">
                  <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all duration-700"><MessageSquare size={160} /></div>
                  <p className="text-[10px] font-bold text-zinc-500 mb-2 tracking-[0.2em]">INCOMING MESSAGES</p>
                  <h4 className="text-6xl font-black text-blue-500 italic tracking-tighter">{Number(data.stats.received)}</h4>
               </div>
            </div>

            {!data.isConnected && data.qr && (
              <div className="p-16 bg-white rounded-[4rem] text-center shadow-2xl animate-in zoom-in-95 duration-500 glass border-8 border-indigo-600/20 relative z-20">
                <p className="text-zinc-900 font-black text-xl mb-8 tracking-widest italic uppercase underline decoration-rose-500 decoration-4 underline-offset-8">
                  ⚠️ Scan Barcode Sekarang untuk Aktivasi Enterprise
                </p>
                <div className="relative inline-block p-4 bg-zinc-100 rounded-3xl shadow-inner">
                   <img src={data.qr} alt="QR Code" className="w-80 h-80 rounded-2xl" />
                </div>
                <p className="mt-8 text-zinc-400 text-xs font-bold uppercase tracking-[0.4em]">Waiting for terminal session...</p>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-10">
               <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-[3.5rem] overflow-hidden glass">
                  <div className="p-8 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-800/10">
                    <h4 className="text-[12px] font-black italic text-indigo-400 uppercase tracking-[0.2em]">🔗 Live Supabase Webhook Log</h4>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-full border border-emerald-500/20">LIVE DATA</span>
                  </div>
                  <div className="h-[450px] overflow-y-auto p-8 space-y-4 custom-scroll">
                    {data.logs.length > 0 ? data.logs.map((log: any) => (
                      <div key={String(log.id)} className="bg-white/5 p-5 rounded-[2rem] border border-white/5 flex justify-between items-center group hover:bg-indigo-600/10 hover:border-indigo-500/20 transition-all duration-300">
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <p className="text-[11px] font-black text-indigo-300 tracking-wider">{String(log.resi)}</p>
                               <span className="text-[8px] px-2 py-0.5 bg-zinc-800 rounded-full font-bold text-zinc-500 uppercase">{String(log.phone)}</span>
                            </div>
                            <p className="text-xs font-bold text-zinc-100 italic uppercase">{String(log.status)}</p>
                         </div>
                         <div className="text-right">
                            <span className="text-[9px] font-mono text-zinc-600 tracking-tighter block">{String(log.time)}</span>
                            <CheckCircle2 size={14} className="text-emerald-500 mt-1 inline-block opacity-50 group-hover:opacity-100" />
                         </div>
                      </div>
                    )) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
                         <Database size={48} className="mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest">No logs detected</p>
                      </div>
                    )}
                  </div>
               </div>
               <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-[3.5rem] overflow-hidden glass">
                  <div className="p-8 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-800/10">
                    <h4 className="text-[12px] font-black italic text-blue-400 uppercase tracking-[0.2em]">📩 Customer Inbox Monitoring</h4>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[9px] font-black rounded-full border border-blue-500/20">AGENT READY</span>
                  </div>
                  <div className="h-[450px] overflow-y-auto p-8 space-y-4 custom-scroll">
                    {data.inbox.length > 0 ? data.inbox.map((msg: any) => (
                      <div key={String(msg.id)} className="bg-white/5 p-5 rounded-[2rem] border border-white/5 group hover:bg-blue-600/10 hover:border-blue-500/20 transition-all duration-300">
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] font-black text-blue-400 italic uppercase tracking-wider">{String(msg.name)}</span>
                            <span className="text-[9px] font-mono text-zinc-600">{String(msg.time)}</span>
                         </div>
                         <p className="text-xs text-zinc-300 font-medium italic leading-relaxed">"{String(msg.msg)}"</p>
                      </div>
                    )) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
                         <MessageSquare size={48} className="mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Empty inbox</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'logistics' && (
           <div className="grid lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-right-4 duration-700">
              <div className="lg:col-span-2 p-12 bg-zinc-900/20 border border-zinc-800/40 rounded-[4rem] glass">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-600/20">
                     <Truck size={24} className="text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black italic uppercase text-white">Input Resi Massal</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">Gateway SENDER V14.0 Enterprise</p>
                  </div>
                </div>
                
                <p className="text-[10px] text-indigo-400/60 font-black mb-4 uppercase tracking-[0.2em] italic underline decoration-indigo-500/20 underline-offset-4">Format: NoHP|Nama|Resi|Status</p>
                <textarea 
                  className="w-full h-96 bg-black/40 border border-zinc-800 rounded-[2.5rem] p-8 text-sm text-indigo-300 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all custom-scroll font-mono placeholder:text-zinc-800"
                  placeholder="62812345678|Andri|AL-2026-001|Tiba di Gudang"
                />
                
                <button className="w-full mt-8 py-6 bg-indigo-600 text-white rounded-[2rem] font-black italic uppercase text-xs hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-4 tracking-[0.2em]">
                  <SendHorizontal size={22} />
                  Kirim Notifikasi Massal Sekarang
                </button>
              </div>

              <div className="space-y-8">
                 <div className="p-10 bg-zinc-900/20 border border-zinc-800/40 rounded-[3.5rem] text-center glass relative overflow-hidden group">
                    <Shield size={48} className="mx-auto text-emerald-500 mb-6" />
                    <h5 className="text-[11px] font-black uppercase mb-3 tracking-[0.2em] text-white">Anti-Ban Status</h5>
                    <div className="mb-4 inline-block px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-500 uppercase">ACTIVE SHIELD</div>
                    <p className="text-[10px] text-zinc-500 italic leading-relaxed">Sistem ini menggunakan jeda acak 5-15 detik untuk keamanan nomor WhatsApp Anda.</p>
                 </div>
                 
                 <div className="p-10 bg-zinc-900/20 border border-zinc-800/40 rounded-[3.5rem] text-center glass relative overflow-hidden group">
                    <ClipboardCheck size={48} className="mx-auto text-blue-500 mb-6" />
                    <h5 className="text-[11px] font-black uppercase mb-3 tracking-[0.2em] text-white">Mandatory Notes</h5>
                    <p className="text-[10px] text-zinc-500 italic leading-relaxed">Pesan otomatis akan menyertakan catatan wajib: <br/> <span className="text-blue-400 font-bold">"Bawa Uang Pas" & "Batas Ambil 3 Hari"</span>.</p>
                 </div>
              </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
