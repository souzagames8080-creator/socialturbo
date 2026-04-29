import { Download, Chrome, ShieldCheck, Zap, StepForward, Facebook } from 'lucide-react';
import { motion } from 'motion/react';

export default function ExtensionInfo() {
  const steps = [
    {
      title: "Baixe os Arquivos",
      desc: "Os arquivos da extensão estão na pasta '/extension' do seu projeto no AI Studio.",
      icon: Download
    },
    {
      title: "Modo Desenvolvedor",
      desc: "Abra o Chrome e vá em chrome://extensions. Ative a chave 'Modo do desenvolvedor' no canto superior direito.",
      icon: Chrome
    },
    {
      title: "Carregar Extensão",
      desc: "Clique em 'Carregar sem compactação' e selecione a pasta 'extension' que você baixou.",
      icon: StepForward
    },
    {
      title: "Pronto para Usar",
      desc: "Abra seu Facebook. A extensão capturará seu Token EAAAA e enviará automaticamente para o painel.",
      icon: Zap
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-600/20 mb-4">
          <ShieldCheck size={14} /> Sistema de Captura Oficial
        </div>
        <h1 className="text-5xl font-black text-slate-800 italic uppercase tracking-tighter">
          Instalar <span className="text-blue-600">Extensão Master</span>
        </h1>
        <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em] italic">
          Conecte seu Facebook de forma instantânea e segura
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden group hover:border-blue-600 transition-all">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <step.icon size={24} />
            </div>
            <h3 className="font-black text-slate-800 uppercase italic tracking-tighter text-lg mb-2">{step.title}</h3>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">{step.desc}</p>
            <div className="absolute -right-2 -bottom-2 text-slate-50 font-black text-6xl italic group-hover:text-blue-50 transition-colors">
              {i + 1}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#101828] rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Por que usar a extensão?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-1">
                  <Zap size={14} className="text-white fill-white" />
                </div>
                <p className="text-slate-300 text-sm font-bold leading-relaxed">
                  <span className="text-white">Sem Erros de Token:</span> A extensão pega o token oficial direto da sua sessão ativa, evitando expiração rápida.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-1">
                  <Zap size={14} className="text-white fill-white" />
                </div>
                <p className="text-slate-300 text-sm font-bold leading-relaxed">
                  <span className="text-white">Segurança Total:</span> Seus dados não passam por nossos servidores de banco, são enviados direto do seu navegador para o painel.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-1">
                  <Zap size={14} className="text-white fill-white" />
                </div>
                <p className="text-slate-300 text-sm font-bold leading-relaxed">
                  <span className="text-white">Múltiplas Contas:</span> Capture quantos perfis quiser trocando de conta no Facebook; a extensão detecta a mudança na hora.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
             <div className="relative">
                <div className="w-64 h-64 bg-blue-600 rounded-[3rem] rotate-12 flex items-center justify-center shadow-2xl shadow-blue-500/20">
                  <Facebook size={120} className="text-white -rotate-12" fill="currentColor" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl -rotate-12 border-8 border-[#101828]">
                  <Zap size={48} className="text-blue-600 fill-blue-600" />
                </div>
             </div>
          </div>
        </div>
        <Zap className="absolute -right-20 -bottom-20 w-[40rem] h-[40rem] text-white/[0.03] rotate-12" />
      </div>
    </div>
  );
}
