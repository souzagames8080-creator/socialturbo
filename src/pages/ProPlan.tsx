import { Zap, Check, ShieldCheck, CreditCard, Star, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProPlan() {
  const accountInfo = JSON.parse(localStorage.getItem('socialturbo_fb_account') || 'null');
  
  const features = [
    "Postagem em grupos ilimitada",
    "Upload de Fotos e Vídeos ilimitados",
    "Delay inteligente (Anti-Ban)",
    "Filtros avançados de grupos",
    "Relatórios detalhados em tempo real",
    "Suporte VIP prioritário 24/7"
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black text-slate-800 italic uppercase tracking-tighter">
          Seu <span className="text-blue-600">Plano Pro</span>
        </h1>
        <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em] italic">
          Gestão de Assinatura e Benefícios VIP
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Account Status */}
        <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-xl shadow-slate-100 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
              <Star className="text-blue-600" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Status Atual</h2>
              <p className="text-slate-500 font-medium">Informações da sua licença</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-sm font-black text-emerald-700 uppercase italic">Plano Ativo</span>
                <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">PRO VIP</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="text-sm font-black text-slate-400 uppercase italic tracking-widest">Expiração</span>
                <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">29/04/2027</span>
              </div>
            </div>
          </div>
          <button className="mt-8 w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase italic tracking-widest transition-all">
            Gerenciar Licença
          </button>
        </div>

        {/* Benefits */}
        <div className="lg:col-span-2 bg-blue-600 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                <Zap className="text-white fill-white" size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Benefícios VIP</h2>
                <p className="text-blue-100 font-bold uppercase text-[10px] tracking-widest mt-1">Recursos liberados na sua conta</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/50 flex items-center justify-center shrink-0">
                    <Check size={14} className="text-white" />
                  </div>
                  <span className="font-black text-sm uppercase italic tracking-tight">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <Zap className="absolute -right-20 -bottom-20 w-80 h-80 text-white/10 rotate-12" />
        </div>
      </div>

      {/* Security Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-start gap-4">
          <ShieldCheck className="text-blue-600 shrink-0" size={24} />
          <div className="space-y-1">
            <h4 className="font-black text-slate-800 uppercase italic tracking-tighter text-sm">Anti-Block 3.0</h4>
            <p className="text-xs text-slate-500 font-medium font-bold leading-relaxed">Algoritmos de delay humano que reduzem em 95% o risco de bloqueios.</p>
          </div>
        </div>
        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-start gap-4">
          <Clock className="text-blue-600 shrink-0" size={24} />
          <div className="space-y-1">
            <h4 className="font-black text-slate-800 uppercase italic tracking-tighter text-sm">Agendamento</h4>
            <p className="text-xs text-slate-500 font-medium font-bold leading-relaxed">Em breve: Programe seus posts por dia e hora específicos para máximo alcance.</p>
          </div>
        </div>
        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-start gap-4">
          <CreditCard className="text-blue-600 shrink-0" size={24} />
          <div className="space-y-1">
            <h4 className="font-black text-slate-800 uppercase italic tracking-tighter text-sm">Pagamento Seguro</h4>
            <p className="text-xs text-slate-500 font-medium font-bold leading-relaxed">Renovação simplificada via PIX ou Cartão diretamente no painel.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
