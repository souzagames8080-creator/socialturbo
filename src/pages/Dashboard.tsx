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
    <div className="max-w-[1400px] mx-auto space-y-10 pb-20 p-4">
      {/* Header com Extension Status */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-6">
        <div className="space-y-4 text-center md:text-left">
          <h1 className="text-5xl font-black text-slate-800 italic uppercase tracking-tighter leading-none">
            FALA, <span className="text-blue-600 underline decoration-8 decoration-blue-100 underline-offset-4">{profile?.displayName?.split(' ')[0]}!</span>
          </h1>
          <div className="flex items-center gap-3 justify-center md:justify-start">
             <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                <ShieldCheck size={12} /> Extensão SocialTurbo Detectada
             </div>
             <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] italic">Ativa no navegador</p>
          </div>
        </div>
        
        <div className="relative group">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-200 group-hover:rotate-6 transition-transform">
             <Zap className="text-white fill-white" size={40} />
          </div>
          <div className="absolute -right-2 -top-2 px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg shadow-lg uppercase tracking-widest italic border border-white/10 animate-bounce">
            PRO VIP
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Subscription Info */}
        <div className="bg-[#101828] rounded-[2rem] p-10 text-white relative flex flex-col justify-between h-72 shadow-2xl">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sua Assinatura</p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <Calendar className="text-blue-400" size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Renovação:</h3>
                <p className="text-blue-400 font-black text-xl italic">{formatDate(profile?.expiresAt)}</p>
              </div>
            </div>
          </div>
          <button className="w-full py-4 bg-white/5 hover:bg-white text-white hover:text-slate-900 rounded-2xl font-black text-xs uppercase italic tracking-widest transition-all border border-white/10">
            Gerenciar Plano
          </button>
        </div>

        {/* Stats Cards */}
        <div className="bg-white rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-xl shadow-slate-100 border border-slate-50 group hover:border-blue-200 transition-all">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users size={32} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grupos no Perfil</p>
          <h3 className="text-4xl font-black text-slate-800 italic tracking-tighter">1.240</h3>
        </div>

        <div className="bg-white rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-xl shadow-slate-100 border border-slate-50 group hover:border-emerald-200 transition-all">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ArrowUpRight size={32} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Envios Totais</p>
          <h3 className="text-4xl font-black text-slate-800 italic tracking-tighter">15.420</h3>
        </div>

        <div className="bg-white rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-xl shadow-slate-100 border border-slate-50 group hover:border-amber-200 transition-all">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BarChart3 size={32} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sucesso App</p>
          <h3 className="text-4xl font-black text-slate-800 italic tracking-tighter">98.5%</h3>
        </div>
      </div>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <Link to="/facebook-groups" className="p-10 bg-[#101828] text-white rounded-[3rem] group transition-all relative overflow-hidden flex flex-col justify-end h-80 shadow-2xl hover:-translate-y-2">
            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-lg border border-white/10 group-hover:bg-blue-600 transition-colors">
                <MessageSquare size={28} />
              </div>
              <div>
                <p className="text-3xl font-black italic uppercase tracking-tighter leading-tight">Postar em<br/>Grupos</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 group-hover:text-blue-300 transition-colors">Suporte a Fotos e Vídeos</p>
              </div>
            </div>
            <Facebook className="absolute -right-8 -bottom-8 w-48 h-48 opacity-5 -rotate-12 group-hover:opacity-10 transition-opacity" />
         </Link>

         <Link to="/facebook-join" className="p-10 bg-blue-600 text-white rounded-[3rem] group transition-all relative overflow-hidden flex flex-col justify-end h-80 shadow-2xl shadow-blue-200 hover:-translate-y-2">
            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-lg border border-white/20 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                <Plus size={28} />
              </div>
              <div>
                <p className="text-3xl font-black italic uppercase tracking-tighter leading-tight">Entrar em<br/>Grupos</p>
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mt-2">Adesão via UID em Massa</p>
              </div>
            </div>
            <Users className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12 group-hover:opacity-20 transition-opacity" />
         </Link>

         <Link to="/history" className="p-10 bg-white border border-slate-100 rounded-[3rem] group transition-all relative overflow-hidden flex flex-col justify-end h-80 shadow-xl shadow-slate-100 hover:border-blue-600 hover:-translate-y-2">
            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <History size={28} />
              </div>
              <div>
                <p className="text-3xl font-black italic uppercase tracking-tighter leading-tight text-slate-800">Relatórios<br/>Detalhados</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 group-hover:text-blue-600 transition-colors">Histórico de Campanhas</p>
              </div>
            </div>
            <ArrowUpRight className="absolute -right-8 -bottom-8 w-48 h-48 opacity-5 text-blue-600 group-hover:opacity-10 transition-opacity" />
         </Link>

         <Link to="/pro" className="p-10 bg-emerald-600 text-white rounded-[3rem] group transition-all relative overflow-hidden flex flex-col justify-end h-80 shadow-2xl shadow-emerald-200 hover:-translate-y-2">
            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-lg border border-white/20 group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                <PlayCircle size={28} />
              </div>
              <div>
                <p className="text-3xl font-black italic uppercase tracking-tighter leading-tight">Vender<br/>Licenças</p>
                <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mt-2">Gere Tokens de Acesso</p>
              </div>
            </div>
            <Zap className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:opacity-20 transition-opacity" />
         </Link>
      </div>
    </div>
  );
}
