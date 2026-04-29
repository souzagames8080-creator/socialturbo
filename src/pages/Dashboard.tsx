import { 
  Users, 
  Send, 
  Smartphone,
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Calendar,
  Zap,
  MessageSquare,
  Facebook
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { useOutletContext, Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { profile } = useOutletContext<{ profile: UserProfile }>();

  const stats = [
    { label: 'Envios Hoje', value: '382', icon: Send, iconColor: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Grupos Ativos', value: '1.240', icon: Users, iconColor: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Conversão', value: '18.5%', icon: TrendingUp, iconColor: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Sucesso', value: '98.2%', icon: CheckCircle, iconColor: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  const formatDate = (date: any) => {
    if (!date) return '---';
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('pt-BR').format(d);
  };

  return (
    <div id="dashboard-root" className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome & Plan Banner */}
      <div id="dashboard-header-banner" className="flex flex-col lg:flex-row gap-6">
        <div id="welcome-message-card" className="flex-1 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 flex items-center justify-between overflow-hidden relative group">
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Fala, <span className="text-blue-600 underline decoration-blue-100">{profile?.displayName?.split(' ')[0]}</span>!</h1>
            <p className="text-slate-500 mt-2 font-medium uppercase text-xs tracking-widest italic font-black">Sua Central de Automação está ligada.</p>
          </div>
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-200 relative z-10"
          >
            <Zap className="text-white w-10 h-10 fill-white" />
          </motion.div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors"></div>
        </div>

        <div id="subscription-status-card" className="w-full lg:w-80 bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200">
           <div className="flex items-center justify-between mb-4">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">STATUS DA CONTA</p>
             <span className="px-2 py-1 bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">{profile?.plan || 'Free'} Plan</span>
           </div>
           <div className="flex items-center gap-3 mb-6">
             <Calendar className="w-6 h-6 text-blue-400" />
             <div>
               <p className="text-lg font-black italic uppercase leading-none">RENOVAÇÃO:</p>
               <p className="text-blue-400 font-bold text-sm uppercase tracking-tighter">{formatDate(profile?.expiresAt)}</p>
             </div>
           </div>
           <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all border border-white/10 italic tracking-tight uppercase tracking-widest">
             UPGRADE SISTEMA
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 relative z-10", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.iconColor)} />
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest relative z-10">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1 italic tracking-tighter uppercase relative z-10">{stat.value}</h3>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon size={80} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 italic uppercase">TRÁFEGO EM GRUPOS</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 uppercase italic tracking-tighter">
                <TrendingUp className="w-3 h-3 text-blue-500" /> +24% performance
              </span>
            </div>
          </div>
          <div className="h-64 flex items-end gap-3 px-2">
            {[65, 82, 75, 90, 80, 95, 88].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group text-center">
                <motion.div 
                   initial={{ height: 0 }}
                   animate={{ height: `${val}%` }}
                   className="w-full bg-slate-100 rounded-xl group-hover:bg-blue-600 transition-all shadow-sm relative overflow-hidden"
                >
                   <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/5 to-transparent"></div>
                </motion.div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic">
                   {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6 italic uppercase underline decoration-blue-500 decoration-4">ACESSOS VIPS</h3>
          <div className="space-y-4">
             <Link to="/facebook-groups" className="block w-full p-6 bg-slate-50 hover:bg-blue-600 rounded-3xl group transition-all text-left border border-slate-100 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 relative overflow-hidden">
                <Facebook className="text-slate-400 w-8 h-8 mb-4 group-hover:text-white transition-colors" />
                <p className="text-slate-800 font-black italic group-hover:text-white uppercase tracking-tight text-lg">Facebook Grupos</p>
                <p className="text-slate-500 text-[10px] mt-1 group-hover:text-blue-100 uppercase font-black tracking-widest italic">Disparo Automático</p>
                <div className="absolute -right-4 -bottom-4 text-slate-200/20 group-hover:text-white/10 transition-colors">
                  <Facebook size={100} />
                </div>
             </Link>
             <Link to="/whatsapp-turbo" className="block w-full p-6 bg-slate-50 hover:bg-emerald-600 rounded-3xl group transition-all text-left border border-slate-100 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-100 relative overflow-hidden">
                <Smartphone className="text-slate-400 w-8 h-8 mb-4 group-hover:text-white transition-colors" />
                <p className="text-slate-800 font-black italic group-hover:text-white uppercase tracking-tight text-lg">WhatsApp Turbo</p>
                <p className="text-slate-500 text-[10px] mt-1 group-hover:text-emerald-100 uppercase font-black tracking-widest italic">Conexão via QR</p>
                <div className="absolute -right-4 -bottom-4 text-slate-200/20 group-hover:text-white/10 transition-colors">
                  <Smartphone size={100} />
                </div>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
