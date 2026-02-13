
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, MessageSquare, Truck, SendHorizontal, 
  Shield, Rocket, Send, Database, ClipboardCheck,
  CheckCircle2, Loader2
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [massInput, setMassInput] = useState('');
  const [isSending, setIsSending] = useState(false);
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
        } else {
          setData(prev => ({ ...prev, isConnected: false }));
        }
      } catch (e) {
        setData(prev => ({ ...prev, isConnected: false }));
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMassSend = async () => {
    if (!massInput.trim() || !data.isConnected) return;
    setIsSending(true);

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
        alert(`Berhasil menjadwalkan ${messages.length} pesan!`);
        setMassInput('');
      } else {
        alert("Gagal mengirim, pastikan WA sudah konek.");
      }
    } catch (e) {
      alert("Error parsing data.");
    } finally {
      setIsSending(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', label: 'Inbox Customer', icon: MessageSquare },
    { id: 'logistics', label: 'Logistik Pro', icon: Truck },
    { id: 'supabase', label: 'Supabase Webhook', icon: Database },
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 relative custom-scroll">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="flex justify-between items-center mb-12 relative z-10">
          <div>
            <h3 className="text-4xl font-black italic tracking-tighter text-white">{String(currentLabel)}</h3>
            <p className="text-zinc-500 text-[10px] font-bold mt-2 tracking-[0.3em] uppercase italic">Automation Powered by Andri Logistik Engine</p>
          </div>
          <div className="flex gap-4">
             <div className="px-6 py-3 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl text-center glass">
                <p className="text-[8px] text-zinc-500 font-bold tracking-widest uppercase">CPU LOAD</p>
                <p className="text-lg font-black text-orange-500 italic">{data.system.cpu}</p>
             </div>
             <div className="px-6 py-3 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl text-center glass">
                <p className="text-[8px] text-zinc-500 font-bold tracking-widest uppercase">RAM USAGE</p>
                <p className="text-lg font-black text-purple-500 italic">{data.system.ram}</p>
             </div>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <div className="p-8 bg-zinc-900/20 border border-zinc-800/40 rounded-[3rem] relative overflow-hidden group glass">
                  <div className="absolute -right-6 -bottom-6 opacity-[0.03] transition-all duration-700"><Send size={160} /></div>
                  <p className="text-[10px] font-bold text-zinc-500 mb-2 tracking-[0.2em]">WH SENT SUCCESS</p>
                  <h4 className="text-6xl font-black text-emerald-500 italic tracking-tighter">{data.stats.sent}</h4>
               </div>
               <div className="p-8 bg-zinc-900/20 border border-zinc-800/40 rounded-[3rem] relative overflow-hidden group glass">
                  <div className="absolute -right-6 -bottom-6 opacity-[0.03] transition-all duration-700"><Database size={160} /></div>
                  <p className="text-[10px] font-bold text-zinc-500 mb-2 tracking-[0.2em]">SUPABASE HITS</p>
                  <h4 className="text-6xl font-black text-indigo-500 italic tracking-tighter">{data.stats.hits}</h4>
               </div>
               <div className="p-8 bg-zinc-900/20 border border-zinc-800/40 rounded-[3rem] relative overflow-hidden group glass">
                  <div className="absolute -right-6 -bottom-6 opacity-[0.03] transition-all duration-700"><MessageSquare size={160} /></div>
                  <p className="text-[10px] font-bold text-zinc-500 mb-2 tracking-[0.2em]">INCOMING MESSAGES</p>
                  <h4 className="text-6xl font-black text-blue-500 italic tracking-tighter">{data.stats.received}</h4>
               </div>
            </div>

            {!data.isConnected && data.qr && (
              <div className="p-16 bg-white rounded-[4rem] text-center shadow-2xl glass border-8 border-indigo-600/20 relative z-20">
                <p className="text-zinc-900 font-black text-xl mb-8 tracking-widest italic uppercase">
                  ⚠️ Scan Barcode Sekarang untuk Aktivasi Enterprise
                </p>
                <div className="relative inline-block p-4 bg-zinc-100 rounded-3xl shadow-inner">
                   <img src={data.qr} alt="QR Code" className="w-80 h-80 rounded-2xl" />
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-10">
               <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-[3.5rem] overflow-hidden glass h-[500px] flex flex-col">
                  <div className="p-8 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-800/10">
                    <h4 className="text-[12px] font-black italic text-indigo-400 uppercase tracking-[0.2em]">🔗 Live Webhook Log</h4>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-full border border-emerald-500/20 uppercase tracking-tighter">Running</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scroll">
                    {data.logs.map((log: any) => (
                      <div key={log.id} className="bg-white/5 p-5 rounded-[2rem] border border-white/5 flex justify-between items-center group transition-all duration-300">
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <p className="text-[11px] font-black text-indigo-300 tracking-wider">{log.resi}</p>
                               <span className="text-[8px] px-2 py-0.5 bg-zinc-800 rounded-full font-bold text-zinc-500 uppercase">{log.phone}</span>
                            </div>
                            <p className="text-xs font-bold text-zinc-100 italic uppercase">{log.status}</p>
                         </div>
                         <div className="text-right">
                            <span className="text-[9px] font-mono text-zinc-600 tracking-tighter block">{log.time}</span>
                            <CheckCircle2 size={14} className="text-emerald-500 mt-1 inline-block" />
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
               <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-[3.5rem] overflow-hidden glass h-[500px] flex flex-col">
                  <div className="p-8 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-800/10">
                    <h4 className="text-[12px] font-black italic text-blue-400 uppercase tracking-[0.2em]">📩 Customer Inbox</h4>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[9px] font-black rounded-full border border-blue-500/20 uppercase tracking-tighter">Agent Ready</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scroll">
                    {data.inbox.map((msg: any) => (
                      <div key={msg.id} className="bg-white/5 p-5 rounded-[2rem] border border-white/5">
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] font-black text-blue-400 italic uppercase tracking-wider">{msg.name}</span>
                            <span className="text-[9px] font-mono text-zinc-600">{msg.time}</span>
                         </div>
                         <p className="text-xs text-zinc-300 font-medium italic leading-relaxed">"{msg.msg}"</p>
                      </div>
                    ))}
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
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">V14.0 Enterprise</p>
                  </div>
                </div>
                
                <p className="text-[10px] text-indigo-400/60 font-black mb-4 uppercase tracking-[0.2em] italic underline underline-offset-4">Format: NoHP|Nama|Resi|Status</p>
                <textarea 
                  value={massInput}
                  onChange={(e) => setMassInput(e.target.value)}
                  className="w-full h-96 bg-black/40 border border-zinc-800 rounded-[2.5rem] p-8 text-sm text-indigo-300 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all custom-scroll font-mono placeholder:text-zinc-800 uppercase"
                  placeholder="62812345678|Andri|AL-2026-001|Tiba di Gudang"
                />
                
                <button 
                  onClick={handleMassSend}
                  disabled={isSending || !data.isConnected}
                  className={`w-full mt-8 py-6 rounded-[2rem] font-black italic uppercase text-xs transition-all shadow-2xl flex items-center justify-center gap-4 tracking-[0.2em] ${
                    isSending || !data.isConnected ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
                >
                  {isSending ? <Loader2 className="animate-spin" size={22} /> : <SendHorizontal size={22} />}
                  {isSending ? 'Sedang Memproses...' : 'Kirim Notifikasi Massal Sekarang'}
                </button>
              </div>

              <div className="space-y-8">
                 <div className="p-10 bg-zinc-900/20 border border-zinc-800/40 rounded-[3.5rem] text-center glass relative overflow-hidden group">
                    <Shield size={48} className="mx-auto text-emerald-500 mb-6" />
                    <h5 className="text-[11px] font-black uppercase mb-3 tracking-[0.2em] text-white">Anti-Ban Status</h5>
                    <div className="mb-4 inline-block px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-500 uppercase">ACTIVE SHIELD</div>
                    <p className="text-[10px] text-zinc-500 italic leading-relaxed">Jeda otomatis 3-7 detik diterapkan untuk keamanan akun Anda.</p>
                 </div>
                 
                 <div className="p-10 bg-zinc-900/20 border border-zinc-800/40 rounded-[3.5rem] text-center glass relative overflow-hidden group">
                    <ClipboardCheck size={48} className="mx-auto text-blue-500 mb-6" />
                    <h5 className="text-[11px] font-black uppercase mb-3 tracking-[0.2em] text-white">Smart Notes</h5>
                    <p className="text-[10px] text-zinc-500 italic leading-relaxed">Catatan uang pas & batas pengambilan otomatis ditambahkan ke setiap pesan.</p>
                 </div>
              </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
