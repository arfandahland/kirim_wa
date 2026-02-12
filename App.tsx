
import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Settings, Shield, Zap, QrCode, History, Bot, Truck, 
  Bell, User, ChevronRight, RefreshCw, Search, Filter, Download, 
  AlertCircle, CheckCircle2, Clock, MapPin, Globe, Database, 
  Cpu, LayoutDashboard, MessageSquare, Share2, Terminal,
  LogOut, Image as ImageIcon, Plus, ShieldCheck, HelpCircle, Eye,
  Info, Smartphone, Send, Calendar, Server, Sparkles, SendHorizontal,
  ClipboardCheck, Code2, Rocket, FolderCode, Package
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { WAStatus, MessageLog, SystemHealth, Branch, SupabaseConfig, AntiBanConfig } from './types';
import { getLogisticsBrainResponse, analyzeAntiBanSettings } from './services/geminiService';

const DEFAULT_ANTIBAN: AntiBanConfig = {
  minDelay: 5,
  maxDelay: 15,
  dailyLimit: 500,
  rotateTemplates: true,
  humanTypingSimulation: true
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('deployment'); 
  const [branches, setBranches] = useState<Branch[]>([
    { id: 'B1', name: 'Andri Logistik Pusat', phone: '62812345678', status: WAStatus.CONNECTED, lastActive: new Date(), location: 'Jakarta', antiBan: DEFAULT_ANTIBAN },
    { id: 'B2', name: 'Cabang Bandung', phone: '62819876543', status: WAStatus.DISCONNECTED, lastActive: new Date(), location: 'Bandung', antiBan: DEFAULT_ANTIBAN },
  ]);
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [health, setHealth] = useState<SystemHealth>({ cpu: 12, ram: 30, uptime: '15d 2h', latency: 18 });
  const [sbConfig, setSbConfig] = useState<SupabaseConfig>({ 
    url: 'https://andri.supabase.co', 
    key: 'eyJhbGciOiJIUzI1NiI...', 
    table: 'shipping_status', 
    isEnabled: true 
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#020203] text-zinc-100 font-['Plus_Jakarta_Sans']">
      <aside className="w-20 lg:w-72 border-r border-zinc-800/50 flex flex-col glass z-50">
        <div className="p-8 flex items-center gap-4 border-b border-zinc-800/30">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-4 ring-indigo-500/10 shrink-0">
            <Truck className="text-white" size={28} />
          </div>
          <div className="hidden lg:block overflow-hidden">
            <h1 className="font-black text-xl tracking-tighter leading-none uppercase truncate">Andri <span className="text-indigo-500">Logistik</span></h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-1">AI Enterprise v14</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8 overflow-y-auto no-scrollbar">
          <NavBtn icon={<Rocket size={22} />} label="Deployment Guide" active={activeTab === 'deployment'} onClick={() => setActiveTab('deployment')} highlight />
          <NavBtn icon={<LayoutDashboard size={22} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavBtn icon={<Bot size={22} />} label="AI Logistics Brain" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
          <NavBtn icon={<ShieldCheck size={22} />} label="Anti-Ban Shield" active={activeTab === 'antiban'} onClick={() => setActiveTab('antiban')} />
          <NavBtn icon={<Smartphone size={22} />} label="Branch Sessions" active={activeTab === 'branches'} onClick={() => setActiveTab('branches')} />
          <NavBtn icon={<Database size={22} />} label="Supabase Sync" active={activeTab === 'supabase'} onClick={() => setActiveTab('supabase')} />
          <NavBtn icon={<History size={22} />} label="Report & Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
          <NavBtn icon={<Globe size={22} />} label="Domain Control" active={activeTab === 'domain'} onClick={() => setActiveTab('domain')} />
          <NavBtn icon={<User size={22} />} label="Custom Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>

        <div className="p-6">
          <button className="w-full py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-rose-500/20">
             <LogOut size={14} /> LOGOUT
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-grid relative custom-scrollbar flex flex-col">
        <header className="h-20 border-b border-zinc-800/50 flex items-center justify-between px-10 glass sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <h2 className="font-black text-2xl uppercase tracking-tighter">{activeTab.replace('_', ' ')}</h2>
             <div className="hidden md:flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                <Sparkles size={12} className="text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Setup Mode Active</span>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 bg-zinc-900/50 p-1.5 pr-4 rounded-2xl border border-zinc-800/50">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black shadow-lg shadow-indigo-600/20">A</div>
                <div className="hidden lg:block text-left">
                   <p className="text-[10px] font-black leading-none uppercase">Andri Logistik</p>
                   <p className="text-[9px] text-zinc-500 mt-0.5">Enterprise Admin</p>
                </div>
             </div>
          </div>
        </header>

        <div className="p-10 flex-1">
          {activeTab === 'deployment' && <DeploymentCenter />}
          {activeTab === 'dashboard' && <DashboardModule branches={branches} />}
          {activeTab === 'ai' && <AILogisticsBrain />}
          {activeTab === 'antiban' && <AntiBanModule />}
          {activeTab === 'branches' && <BranchModule branches={branches} />}
          {activeTab === 'supabase' && <SupabaseModule config={sbConfig} />}
          {activeTab === 'logs' && <LogsModule />}
          {activeTab === 'profile' && <ProfileModule />}
          {activeTab === 'domain' && <DomainModule />}
        </div>
      </main>
    </div>
  );
};

const NavBtn = ({ icon, label, active, onClick, highlight }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group
    ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 scale-[1.02]' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}
    ${highlight && !active ? 'border border-indigo-500/30 bg-indigo-500/5 animate-pulse' : ''}
  `}>
    <span className={`${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform shrink-0`}>{icon}</span>
    <span className="hidden lg:block text-[11px] font-black uppercase tracking-[0.1em]">{label}</span>
  </button>
);

const DeploymentCenter = () => {
  const [currentStep, setCurrentStep] = useState(2); // Start at Step 2 as Step 1 is done
  const totalSteps = 6;

  const steps = [
    { title: "Server Preparation", desc: "Instalasi OS, Node.js & PM2" },
    { title: "Source Deployment", desc: "Upload & Build Code" },
    { title: "Environment Config", desc: "API Keys & DB Secrets" },
    { title: "Process Control", desc: "Aktivasi Baileys Gateway" },
    { title: "Nginx & SSL", desc: "Binding Domain andrilogistik.co" },
    { title: "Supabase Webhook", desc: "Final Data Synchronization" }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="glass p-8 rounded-[3rem] border border-zinc-800/50 relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-xl uppercase tracking-tight">Deployment Progress</h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Step {currentStep} of {totalSteps}</span>
        </div>
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-500 ${i + 1 <= currentStep ? 'bg-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-zinc-800'}`} />
          ))}
        </div>
        <div className="grid grid-cols-6 mt-4">
          {steps.map((s, i) => (
            <div key={i} className={`text-[8px] font-black uppercase tracking-tighter text-center px-1 ${i + 1 === currentStep ? 'text-indigo-400' : 'text-zinc-600'}`}>
              {s.title}
            </div>
          ))}
        </div>
      </div>

      {currentStep === 1 && <SessionOne onComplete={() => setCurrentStep(2)} />}
      {currentStep === 2 && <SessionTwo onComplete={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />}
      
      {currentStep > 2 && (
        <div className="glass p-12 rounded-[4rem] border border-zinc-800/50 text-center space-y-6">
           <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 size={40} className="text-emerald-400" />
           </div>
           <h3 className="text-2xl font-black uppercase tracking-tight">Sesi Selesai</h3>
           <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">Menunggu konfirmasi manual di chat untuk melanjutkan ke langkah berikutnya.</p>
           <button onClick={() => setCurrentStep(2)} className="px-10 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all">Review Sesi 2</button>
        </div>
      )}
    </div>
  );
};

const SessionOne = ({ onComplete }: any) => {
  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-10 duration-700">
      <div className="glass p-12 rounded-[4rem] border border-zinc-800/50 bg-gradient-to-br from-indigo-600/5 to-transparent">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center border border-indigo-500/20 shadow-2xl">
            <Server size={32} className="text-white" />
          </div>
          <div>
            <h3 className="text-3xl font-black uppercase tracking-tight">Sesi 1: Server Preparation</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Status: Selesai (Confirmed)</p>
          </div>
        </div>
        <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] flex items-center gap-4">
          <CheckCircle2 className="text-emerald-500" />
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Infrastruktur Server Sudah Siap.</p>
        </div>
        <div className="mt-10 flex justify-center">
          <button onClick={onComplete} className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest">Lanjut ke Sesi 2</button>
        </div>
      </div>
    </div>
  );
};

const SessionTwo = ({ onComplete, onBack }: any) => {
  return (
    <div className="space-y-10 animate-in slide-in-from-right-10 duration-700">
      <div className="glass p-12 rounded-[4rem] border border-zinc-800/50 bg-gradient-to-br from-purple-600/5 to-transparent">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-16 h-16 bg-purple-600 rounded-3xl flex items-center justify-center border border-purple-500/20 shadow-2xl">
            <FolderCode size={32} className="text-white" />
          </div>
          <div>
            <h3 className="text-3xl font-black uppercase tracking-tight">Sesi 2: Source Deployment</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Memasukkan Nyawa Aplikasi ke Dalam Server</p>
          </div>
        </div>

        <div className="space-y-8">
          <InstructionCard 
            title="1. Buat Direktori Kerja"
            desc="Siapkan folder khusus agar file tersusun rapi di dalam VPS."
            command="mkdir -p ~/andri-gateway && cd ~/andri-gateway"
          />
          <InstructionCard 
            title="2. Upload / Clone Code"
            desc="Gunakan Git untuk menarik kode atau upload via SCP/FTP ke folder tadi."
            command="git clone <URL_REPO_ANDA> ."
          />
          <InstructionCard 
            title="3. Install Dependensi"
            desc="Instal semua modul Node.js yang diperlukan oleh sistem Andri Logistik."
            command="npm install"
          />
          <InstructionCard 
            title="4. Build Production"
            desc="Kompilasi kode React agar berjalan optimal di lingkungan server."
            command="npm run build"
          />
        </div>

        <div className="mt-12 p-8 bg-purple-500/5 border border-purple-500/20 rounded-[2.5rem] flex items-start gap-5">
           <Package size={24} className="text-purple-500 shrink-0 mt-1" />
           <div>
              <p className="text-sm font-bold text-purple-500 uppercase tracking-tighter">Penting: Verifikasi Build</p>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium mt-1">Pastikan proses <code>npm run build</code> berakhir dengan pesan 'Success'. Jika ada folder bernama <code>dist</code> atau <code>build</code> muncul, artinya tahap ini sudah berhasil.</p>
           </div>
        </div>

        <div className="mt-10 flex flex-col md:flex-row justify-center gap-4">
          <button onClick={onBack} className="px-10 py-5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:text-white transition-all">Kembali</button>
          <button 
            onClick={onComplete}
            className="group px-12 py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-purple-600/40 transition-all flex items-center gap-3"
          >
             Selesai, Kode Berhasil Di-build <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

const InstructionCard = ({ title, desc, command }: any) => (
  <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] space-y-4">
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xs">
        {title.split('.')[0]}
      </div>
      <h4 className="text-sm font-black uppercase tracking-tight text-zinc-200">{title}</h4>
    </div>
    <p className="text-xs text-zinc-500 font-medium leading-relaxed ml-12">{desc}</p>
    <div className="ml-12 flex gap-3">
      <div className="flex-1 bg-black border border-zinc-800 rounded-xl px-5 py-3 font-mono text-[11px] text-indigo-400 flex items-center justify-between group">
        <span>$ {command}</span>
        <button onClick={() => navigator.clipboard.writeText(command)} className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-zinc-800 rounded">
          <ClipboardCheck size={14} className="text-zinc-500" />
        </button>
      </div>
    </div>
  </div>
);

const AILogisticsBrain = () => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Halo Admin Andri Logistik! Saya AI Brain Anda. Ada yang bisa saya bantu terkait operasional WA Gateway hari ini?' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    
    const aiRes = await getLogisticsBrainResponse(userMsg);
    setChat(prev => [...prev, { role: 'ai', text: aiRes || '' }]);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[75vh] flex flex-col glass rounded-[3.5rem] border border-zinc-800/50 overflow-hidden animate-in zoom-in-95 duration-700 shadow-2xl">
      <div className="p-8 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
               <Bot className="text-white" size={24} />
            </div>
            <div>
               <h3 className="font-black text-lg uppercase tracking-tight">AI Logistics Brain</h3>
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Powered by Gemini 3 Pro</p>
            </div>
         </div>
         <div className="flex gap-2">
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase">Online</div>
         </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[#050507]">
         {chat.map((msg, i) => (
           <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-5 rounded-[2rem] text-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-xl shadow-indigo-600/20' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none'
              }`}>
                 {msg.text}
              </div>
           </div>
         ))}
         {loading && (
           <div className="flex justify-start animate-pulse">
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-[2rem] rounded-tl-none">
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce delay-75" />
                    <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce delay-150" />
                 </div>
              </div>
           </div>
         )}
         <div ref={scrollRef} />
      </div>
      <div className="p-8 bg-zinc-900/30 border-t border-zinc-800">
         <div className="flex gap-4">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tanya apapun tentang logistik atau strategi anti-ban..." 
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:border-indigo-600 transition-all text-sm"
            />
            <button 
              onClick={handleSend}
              className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all group"
            >
               <SendHorizontal size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
         </div>
      </div>
    </div>
  );
};

const DashboardModule = ({ branches }: any) => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Success Sent" value="4.2K" icon={<Zap className="text-amber-400" />} change="+18%" />
        <StatCard label="API Latency" value="12ms" icon={<Activity className="text-emerald-400" />} change="Fast" />
        <StatCard label="Blocked Risk" value="Low" icon={<Shield className="text-blue-400" />} change="Safe" />
        <StatCard label="Active Sessions" value={branches.length} icon={<Smartphone className="text-purple-400" />} change="Live" />
     </div>
     <div className="glass p-10 rounded-[3rem] border border-zinc-800/50 bg-gradient-to-br from-indigo-600/5 to-transparent">
        <div className="flex items-center gap-4 mb-6">
           <Sparkles className="text-indigo-400" />
           <h3 className="font-black text-xl uppercase tracking-tight">AI Insights Today</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <InsightBox title="Anti-Ban Strategy" text="Gunakan variasi template pesan untuk pengiriman massal pagi ini. Meta sedang memperketat filter spam." />
           <InsightBox title="Optimal Delivery" text="Waktu pengiriman paling efektif terdeteksi antara jam 09:00 - 11:00 WIB." />
           <InsightBox title="System Health" text="Semua sesi cabang berjalan stabil. Tidak ada anomali terdeteksi di Supabase listener." />
        </div>
     </div>
  </div>
);

const InsightBox = ({ title, text }: any) => (
  <div className="p-6 bg-zinc-900/50 rounded-[2rem] border border-zinc-800/50">
     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">{title}</p>
     <p className="text-xs text-zinc-400 font-medium leading-relaxed">{text}</p>
  </div>
);

const StatCard = ({ label, value, icon, change }: any) => (
  <div className="glass p-8 rounded-[2.5rem] border border-zinc-800/50 group hover:border-indigo-500/30 transition-all">
     <div className="flex justify-between items-start mb-4">
        <div className="p-4 bg-zinc-900/80 rounded-2xl group-hover:scale-110 transition-transform border border-zinc-800 shadow-xl">{icon}</div>
        <span className="text-[9px] font-black px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">{change}</span>
     </div>
     <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.1em] mb-1">{label}</p>
     <h4 className="text-2xl font-black tracking-tighter text-white">{value}</h4>
  </div>
);

const AntiBanModule = () => (
  <div className="max-w-4xl mx-auto space-y-10 animate-in zoom-in-95 duration-700 py-6">
     <div className="text-center space-y-4">
        <div className="w-24 h-24 bg-purple-600/10 rounded-[2.5rem] flex items-center justify-center mx-auto border border-purple-500/30 shadow-2xl shadow-purple-600/20">
           <ShieldCheck size={48} className="text-purple-400" />
        </div>
        <h2 className="text-4xl font-black tracking-tight uppercase">Anti-Ban Enterprise Shield</h2>
        <p className="text-zinc-500 font-medium leading-relaxed max-w-xl mx-auto italic text-sm">Integrasi sistem pelindung Meta tercanggih.</p>
     </div>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-10 rounded-[3rem] border border-zinc-800/50 space-y-6">
           <h3 className="font-black text-lg uppercase tracking-widest border-b border-zinc-800 pb-4">Smart Throttling</h3>
           <ToggleItem label="AI Human Typing" desc="Simulasi pengetikan cerdas." active />
           <ToggleItem label="Variable Delays" desc="Jeda acak 10-30 detik." active />
           <ToggleItem label="Session Rotation" desc="Gunakan multi-nomor otomatis." active />
        </div>
        <div className="glass p-10 rounded-[3rem] border border-zinc-800/50 space-y-6 bg-indigo-600/5">
           <h3 className="font-black text-lg uppercase tracking-widest border-b border-zinc-800 pb-4 text-indigo-400">Security Score: 98/100</h3>
           <ul className="space-y-4">
              <li className="flex gap-3 text-xs text-zinc-400 font-medium items-center"><CheckCircle2 size={16} className="text-emerald-500" /> Semua nomor cabang terverifikasi</li>
              <li className="flex gap-3 text-xs text-zinc-400 font-medium items-center"><CheckCircle2 size={16} className="text-emerald-500" /> Spintax template aktif</li>
              <li className="flex gap-3 text-xs text-zinc-400 font-medium items-center"><HelpCircle size={16} className="text-amber-500" /> Saran: Variasikan gambar paket</li>
           </ul>
        </div>
     </div>
  </div>
);

const BranchModule = ({ branches }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-6 duration-700">
    {branches.map((b: any) => (
       <div key={b.id} className="glass p-10 rounded-[3.5rem] border border-zinc-800/50 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-8">
             <div className="w-16 h-16 bg-white p-3 rounded-2xl shadow-2xl relative">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${b.id}`} alt="QR" className="w-full h-full opacity-90" />
             </div>
             <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${b.status === WAStatus.CONNECTED ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>{b.status}</div>
          </div>
          <h4 className="text-xl font-black tracking-tight uppercase group-hover:text-indigo-400 transition-colors">{b.name}</h4>
          <p className="text-zinc-500 text-[11px] font-mono tracking-widest mt-1">ID: {b.id} • {b.location}</p>
          <div className="mt-8 grid grid-cols-2 gap-4">
             <button className="py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"><QrCode size={14} /> SCAN QR</button>
             <button className="py-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"><LogOut size={14} /> LOGOUT</button>
          </div>
       </div>
    ))}
  </div>
);

const SupabaseModule = ({ config }: any) => (
  <div className="max-w-4xl mx-auto space-y-10 py-6 animate-in zoom-in-95 duration-700">
     <div className="glass p-12 rounded-[4rem] border border-zinc-800/50 relative overflow-hidden bg-gradient-to-br from-[#3ecf8e]/5 to-transparent">
        <div className="flex items-center gap-6 mb-10">
           <div className="w-16 h-16 bg-[#3ecf8e]/20 rounded-3xl flex items-center justify-center border border-[#3ecf8e]/30 shadow-2xl">
              <Database size={32} className="text-[#3ecf8e]" />
           </div>
           <div><h3 className="text-2xl font-black uppercase tracking-tight">Supabase Smart Sync</h3><p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Auto-Bridge Listener Active</p></div>
        </div>
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-[2rem] text-xs space-y-4">
           <p className="font-bold text-zinc-300">Bagaimana Cara Menghubungkan?</p>
           <ol className="list-decimal list-inside text-zinc-500 space-y-2">
              <li>Masuk ke Dashboard Supabase Anda</li>
              <li>Pilih Database -> Webhooks</li>
              <li>Arahkan URL ke: <code>http://{window.location.hostname}/webhook</code></li>
              <li>Aktifkan event: <code>UPDATE</code> pada tabel <code>pengiriman</code></li>
           </ol>
        </div>
        <button className="mt-10 px-10 py-4 bg-[#3ecf8e] text-zinc-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#3ecf8e]/30 hover:scale-105 transition-all">Test Bridge Connection</button>
     </div>
  </div>
);

const LogsModule = () => (
  <div className="glass rounded-[3rem] border border-zinc-800/50 overflow-hidden shadow-2xl animate-in fade-in duration-700">
     <div className="p-8 border-b border-zinc-800 flex justify-between items-center"><h3 className="font-black text-xl uppercase tracking-tight">Global Reports</h3><button className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest">Export Excel</button></div>
     <div className="p-20 text-center space-y-4"><History size={48} className="mx-auto text-zinc-800" /><p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Semua data pengiriman terpusat di sini</p></div>
  </div>
);

const ProfileModule = () => (
  <div className="max-w-3xl mx-auto glass p-12 rounded-[4rem] border border-zinc-800/50 text-center space-y-8 animate-in slide-in-from-bottom-6 duration-700">
     <div className="w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto text-4xl font-black shadow-2xl shadow-indigo-600/30">A</div>
     <div><h3 className="text-3xl font-black uppercase tracking-tighter">Andri Logistik</h3><p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-2">Enterprise Edition - Super Admin</p></div>
     <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800">
           <p className="text-[10px] font-black text-zinc-600 uppercase mb-1">Total Branches</p>
           <p className="text-2xl font-black">12</p>
        </div>
        <div className="p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800">
           <p className="text-[10px] font-black text-zinc-600 uppercase mb-1">Messages Sent</p>
           <p className="text-2xl font-black">2.1M</p>
        </div>
     </div>
  </div>
);

const DomainModule = () => (
  <div className="max-w-4xl mx-auto glass p-12 rounded-[4rem] border border-zinc-800/50 space-y-10 animate-in fade-in duration-700">
     <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-indigo-600/10 rounded-3xl flex items-center justify-center border border-indigo-500/20">
           <Globe size={32} className="text-indigo-400" />
        </div>
        <div>
           <h3 className="text-2xl font-black uppercase tracking-tight">Domain Binding</h3>
           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Bind andrilogistik.co to VPS IP</p>
        </div>
     </div>
     <div className="p-8 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] flex items-center justify-between">
        <div>
           <p className="text-lg font-black uppercase">api.andrilogistik.co</p>
           <p className="text-[10px] font-mono text-zinc-500">Status: SECURE • SSL Verified</p>
        </div>
        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
     </div>
  </div>
);

const ToggleItem = ({ label, desc, active }: any) => (
  <div className="flex items-center justify-between group">
    <div>
      <p className="text-sm font-bold text-zinc-200 group-hover:text-indigo-400 transition-colors uppercase">{label}</p>
      <p className="text-[10px] text-zinc-600 font-medium">{desc}</p>
    </div>
    <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-all duration-300 ${active ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${active ? 'left-6' : 'left-1'}`} />
    </div>
  </div>
);

export default App;
