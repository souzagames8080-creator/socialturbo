import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Instagram, 
  Send, 
  Image as ImageIcon, 
  Video, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Camera,
  Hash
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function InstaPost() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'done'>('idle');

  const handlePost = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatus('done');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Instagram className="text-white w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Postar no Instagram</h2>
            <p className="text-slate-500 text-sm">Postagem automática em massa para perfis e hashtags</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Legenda do Post</label>
                <textarea 
                  placeholder="Escreva sua legenda aqui... use #hashtags"
                  className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-600 font-bold transition-all">
                  <ImageIcon className="w-5 h-5" />
                  Imagem
                </button>
                <button className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-600 font-bold transition-all">
                  <Video className="w-5 h-5" />
                  Reels
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-3 h-48 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
                <Camera className="w-10 h-10 opacity-20" />
                <span className="text-sm font-medium">Clique para selecionar mídia</span>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Tags de Alvo (Hashtags ou Contas)</label>
                <input 
                  type="text" 
                  placeholder="@usuario, #vendas, #marketing"
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Delay (Seg)</label>
                  <input type="number" defaultValue={60} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Qtd. Posts</label>
                  <input type="number" defaultValue={10} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handlePost}
            disabled={loading}
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-lg shadow-xl shadow-purple-100 flex items-center justify-center gap-3 transition-all",
              loading ? "bg-slate-400" : "bg-gradient-to-r from-purple-600 to-red-500 text-white hover:opacity-90"
            )}
          >
            <Send className="w-6 h-6" />
            {loading ? 'Processando...' : 'Iniciar Automação Instagram'}
          </button>

          <AnimatePresence>
            {status === 'done' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700"
              >
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-bold text-sm">Campanha de Instagram iniciada com sucesso!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
