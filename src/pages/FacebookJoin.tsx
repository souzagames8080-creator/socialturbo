import { useState } from 'react';
import { 
  Plus, 
  Settings, 
  Users,
  Play,
  HelpCircle,
  X,
  MessageSquare,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function FacebookJoin() {
  const [uids, setUids] = useState('');
  const [settings, setSettings] = useState({
    thread: 1,
    minDelay: 60,
    maxDelay: 120,
    limit: 0
  });
  const [questions, setQuestions] = useState([
    { id: '1', text: 'love it' },
    { id: '2', text: 'Please accept me' }
  ]);
  const [newQuestion, setNewQuestion] = useState('');

  const addQuestion = () => {
    if (!newQuestion.trim()) return;
    setQuestions([...questions, { id: Date.now().toString(), text: newQuestion }]);
    setNewQuestion('');
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleStart = () => {
    if (!uids.trim()) {
      alert('Insira pelo menos um UID de grupo');
      return;
    }
    alert('Simulação de entrada em grupos iniciada!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter decoration-blue-500 decoration-8 underline-offset-8 underline">
          Entrar em <span className="text-blue-600">Grupos</span>
        </h1>
        <p className="text-slate-500 font-bold mt-2 uppercase text-xs tracking-widest italic font-black">
          Automação de adesão em massa via UID
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Input UIDs */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Lista de UIDs (Um por linha)</label>
                <div className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                  {uids.split('\n').filter(u => u.trim()).length} UIDs
                </div>
              </div>
              <textarea 
                value={uids}
                onChange={(e) => setUids(e.target.value)}
                placeholder="100023456789&#10;100098765432&#10;..."
                className="w-full h-64 bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-slate-700 font-mono font-bold focus:border-blue-200 focus:bg-white transition-all outline-none resize-none placeholder:text-slate-200"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="space-y-2 text-center">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Thread</label>
                <input 
                  type="number" 
                  value={settings.thread}
                  onChange={(e) => setSettings({...settings, thread: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-center font-black text-slate-600 outline-none focus:border-blue-200"
                />
              </div>
              <div className="space-y-2 text-center">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold italic">Delay Min (s)</label>
                <input 
                  type="number" 
                  value={settings.minDelay}
                  onChange={(e) => setSettings({...settings, minDelay: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-center font-black text-slate-600 outline-none focus:border-blue-200"
                />
              </div>
              <div className="space-y-2 text-center">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold italic">Delay Max (s)</label>
                <input 
                  type="number" 
                  value={settings.maxDelay}
                  onChange={(e) => setSettings({...settings, maxDelay: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-center font-black text-slate-600 outline-none focus:border-blue-200"
                />
              </div>
            </div>

            <button 
              onClick={handleStart}
              className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-sm uppercase italic tracking-widest shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 mt-8"
            >
              <Play size={20} fill="currentColor" />
              Iniciar Automação
            </button>
          </div>
        </div>

        {/* Right: Questions Answer */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <HelpCircle size={20} />
              </div>
              <h3 className="font-black text-xs text-slate-800 uppercase tracking-widest">Respostas Automáticas</h3>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Nova resposta..."
                  className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-200 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
                />
                <button 
                  onClick={addQuestion}
                  className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-md active:scale-90"
                >
                  <Plus size={24} />
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                <AnimatePresence mode="popLayout">
                  {questions.map((q) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={q.id}
                      className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare size={16} className="text-slate-300" />
                        <span className="text-xs font-bold text-slate-600 uppercase italic tracking-tighter">{q.text}</span>
                      </div>
                      <button 
                        onClick={() => removeQuestion(q.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {questions.length === 0 && (
                  <p className="text-center py-6 text-slate-300 font-bold uppercase text-[10px] tracking-widest italic">Nenhuma resposta definida</p>
                )}
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <div className="flex items-start gap-3">
                <Hash className="text-blue-400 mt-1 shrink-0" size={16} />
                <p className="text-[10px] text-blue-700 font-bold uppercase italic leading-relaxed">
                  O sistema usará essas respostas aleatoriamente caso o grupo exija perguntas de entrada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
