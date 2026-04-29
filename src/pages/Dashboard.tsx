import { 
  Users, 
  Send, 
  Smartphone,
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Calendar,
  Zap,
  MessageSquare
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { useOutletContext, Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { profile } = useOutletContext<{ profile: UserProfile }>();

  const stats = [
    { label: 'Envios Hoje', value: '154', icon: Send, iconColor: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Total do Mês', value: '4.280', icon: MessageSquare, iconColor: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Contatos Salvos', value: '1.450', icon: Users, iconColor: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Taxa de Entrega', value: '99.5%', icon: CheckCircle, iconColor: 'text-emerald-500', bg: 'bg-emerald-50' },
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
            <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Olá, <span className="text-emerald-600 underline decoration-emerald-100">{profile?.displayName?.split(' ')[0]}</span>!</h1>
            <p className="text-slate-500 mt-2 font-medium">Seu WhatsApp Turbo Pro está pronto para disparar.</p>
          </div>
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-200 relative z-10"
          >
            <Smartphone className="text-white w-10 h-10 fill-white" />
          </motion.div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:bg-emerald-100 transition-colors"></div>
        </div>

        <div id="subscription-status-card" className="w-full lg:w-80 bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200">
           <div className="flex items-center justify-between mb-4">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sua Assinatura</p>
             <span className="px-2 py-1 bg-emerald-600 rounded-lg text-[10px] font-black uppercase">{profile?.plan || 'Free'}</span>
           </div>
           <div className="flex items-center gap-3 mb-6">
             <Calendar className="w-6 h-6 text-emerald-400" />
             <div>
               <p className="text-lg font-black italic uppercase leading-none">Vence em:</p>
               <p className="text-emerald-400 font-bold text-sm">{formatDate(profile?.expiresAt)}</p>
             </div>
           </div>
           <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all border border-white/10 italic tracking-tight">
             RENOVAR AGORA
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
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.iconColor || stat.color)} />
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1 italic tracking-tighter uppercase">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 italic uppercase">Envios da Semana</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <TrendingUp className="w-3 h-3 text-emerald-500" /> +12% aumento
              </span>
            </div>
          </div>
          <div className="h-64 flex items-end gap-3 px-2">
            {[45, 62, 55, 80, 70, 90, 85].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group text-center">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${val}%` }}
                  className="w-full bg-slate-100 rounded-xl group-hover:bg-emerald-600 transition-all shadow-sm relative overflow-hidden"
                >
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/5 to-transparent"></div>
                </motion.div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6 italic uppercase">Ações Rápidas</h3>
          <div className="space-y-4">
             <Link to="/whatsapp-turbo" className="block w-full p-6 bg-slate-50 hover:bg-emerald-600 rounded-3xl group transition-all text-left border border-slate-100 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-100">
               <Send className="text-slate-400 w-8 h-8 mb-4 group-hover:text-white" />
               <p className="text-slate-800 font-black italic group-hover:text-white uppercase tracking-tight">Envio em Massa</p>
               <p className="text-slate-500 text-xs mt-1 group-hover:text-emerald-100 uppercase font-bold">Abrir Automação</p>
             </Link>
             <Link to="/settings" className="block w-full p-6 bg-slate-50 hover:bg-indigo-600 rounded-3xl group transition-all text-left border border-slate-100 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100">
               <Zap className="text-slate-400 w-8 h-8 mb-4 group-hover:text-white" />
               <p className="text-slate-800 font-black italic group-hover:text-white uppercase tracking-tight">Conectar WhatsApp</p>
               <p className="text-slate-500 text-xs mt-1 group-hover:text-indigo-100 uppercase font-bold">Gerenciar Conexão</p>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
