import { 
  Users, 
  MessageSquare, 
  History, 
  Zap, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck,
  PlayCircle,
  LayoutDashboard,
  Facebook,
  Plus,
  BarChart3,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useOutletContext } from 'react-router-dom';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { profile } = useOutletContext<{ profile: UserProfile }>();

  const stats = [
    { label: 'Grupos no Perfil', value: '1.240', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Envios Totais', value: '15.420', icon: ArrowUpRight, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Sucesso App', value: '98.5%', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const formatDate = (date: any) => {
    if (!date) return '---';
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('pt-BR').format(d);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-6">
        <div className="space-y-4 text-center md:text-left">
          <h1 className="text-5xl font-black text-slate-800 italic uppercase tracking-tighter leading-none">
            FALA, <span className="text-blue-600 underline decoration-8 decoration-blue-100 underline-offset-4">{profile?.displayName?.split(' ')[0]}!</span>
          </h1>
          <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] italic">Sua central de automação Facebook Pro está ativa.</p>
        </div>
        
        <div className="relative group">
          <div className="w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-200 group-hover:rotate-6 transition-transform">
             <Zap className="text-white fill-white" size={48} />
          </div>
          <div className="absolute -right-2 -top-2 px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg shadow-lg uppercase tracking-widest italic animate-bounce">
            PRO VIP
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Status Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden h-full flex flex-col justify-between">
             <div className="relative z-10 space-y-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sua Assinatura</p>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <Calendar className="text-blue-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Renovação:</h3>
                    <p className="text-blue-400 font-black text-lg">{formatDate(profile?.expiresAt)}</p>
                  </div>
                </div>
                <button className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl font-black text-xs uppercase italic tracking-widest transition-all">
                  Gerenciar Plano
                </button>
             </div>
             <ShieldCheck className="absolute -right-6 -bottom-6 w-40 h-40 text-white/5 rotate-12" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 flex flex-col items-center justify-center text-center group hover:border-blue-300 transition-all border-2 border-transparent"
            >
              <div className={`${stat.bg} ${stat.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-800 italic tracking-tighter leading-none">{stat.value}</h3>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <Link to="/facebook-groups" className="p-8 bg-slate-900 border-2 border-slate-800 text-white rounded-[2.5rem] group transition-all relative overflow-hidden flex flex-col justify-between h-56 shadow-2xl shadow-slate-200">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-lg">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-xl font-black italic uppercase tracking-tighter">Postar em Grupos</p>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1 group-hover:text-blue-300">Suporte a Fotos e Vídeos</p>
            </div>
            <Facebook className="absolute -right-4 -bottom-4 w-32 h-32 opacity-5 -rotate-12" />
         </Link>

         <Link to="/facebook-join" className="p-8 bg-blue-600 border-2 border-blue-500 text-white rounded-[2.5rem] group transition-all relative overflow-hidden flex flex-col justify-between h-56 shadow-2xl shadow-blue-100">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-lg">
              <Plus size={24} />
            </div>
            <div>
              <p className="text-xl font-black italic uppercase tracking-tighter">Entrar em Grupos</p>
              <p className="text-blue-100 text-[9px] font-bold uppercase tracking-widest mt-1">Adesão via UID em Massa</p>
            </div>
            <Users className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
         </Link>

         <Link to="/history" className="p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] group transition-all relative overflow-hidden flex flex-col justify-between h-56 hover:border-blue-600 transition-colors shadow-xl shadow-slate-100">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <History size={24} />
            </div>
            <div>
              <p className="text-xl font-black italic uppercase tracking-tighter text-slate-800">Relatórios</p>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1 group-hover:text-blue-600">Histórico de Campanhas</p>
            </div>
            <ArrowUpRight className="absolute -right-4 -bottom-4 w-32 h-32 opacity-5 text-blue-600" />
         </Link>

         <Link to="/pro" className="p-8 bg-emerald-600 border-2 border-emerald-500 text-white rounded-[2.5rem] group transition-all relative overflow-hidden flex flex-col justify-between h-56 shadow-2xl shadow-emerald-100">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-lg">
              <PlayCircle size={24} />
            </div>
            <div>
              <p className="text-xl font-black italic uppercase tracking-tighter">Vender Licenças</p>
              <p className="text-emerald-100 text-[9px] font-bold uppercase tracking-widest mt-1">Gere Tokens de Acesso</p>
            </div>
            <Zap className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
         </Link>
      </div>
    </div>
  );
}
