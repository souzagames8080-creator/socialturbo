import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Search, 
  Image as ImageIcon, 
  Video, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  X,
  FileJson,
  Download,
  Link as LinkIcon,
  HelpCircle,
  Hash,
  Loader2,
  Save
} from 'lucide-react';
import { auth, db, collection, query, getDocs, addDoc, serverTimestamp } from '../lib/firebase';
import { FBGroup } from '../types';
import { cn } from '../lib/utils';

export default function AutoPost() {
  const [groups, setGroups] = useState<FBGroup[]>([]);
  const [search, setSearch] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [postText, setPostText] = useState('');
  const [delayMin, setDelayMin] = useState(900);
  const [delayMax, setDelayMax] = useState(900);
  const [threads, setThreads] = useState(3);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postingStatus, setPostingStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [executionLogs, setExecutionLogs] = useState<{ groupId: string; groupName: string; status: 'pending' | 'loading' | 'success' | 'failed'; postUrl?: string }[]>([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const toggleGroup = (id: string) => {
    const next = new Set(selectedGroupIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedGroupIds(next);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedGroupIds(new Set(filteredGroups.map(g => g.id)));
    } else {
      setSelectedGroupIds(new Set());
    }
  };

  const fetchGroups = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(collection(db, `users/${auth.currentUser.uid}/groups`));
      const snapshot = await getDocs(q);
      const fetchedGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FBGroup));
      
      // Mock data if empty for demo
      if (fetchedGroups.length === 0) {
        const mockGroups: FBGroup[] = [
          { id: '1', userId: auth.currentUser.uid, fbGroupId: '1899817323583414', name: 'GRUPO CENTRO FASHION FORTALEZA', memberCount: 250000 },
          { id: '2', userId: auth.currentUser.uid, fbGroupId: '4842206572558084', name: 'BAIRRO ALDEOTA - FORTALEZA', memberCount: 15000 },
          { id: '3', userId: auth.currentUser.uid, fbGroupId: '5814778131888499', name: 'Compra e vendas Antônio Bezerra - Fortaleza - Ce', memberCount: 8500 },
          { id: '4', userId: auth.currentUser.uid, fbGroupId: '3143167142652225', name: 'OLX HENRIQUE JORGE', memberCount: 22000 },
          { id: '5', userId: auth.currentUser.uid, fbGroupId: '2068952703329427', name: 'BAIRRO BELA VISTA FORTALEZA', memberCount: 190000 },
          { id: '6', userId: auth.currentUser.uid, fbGroupId: '2006763952771261', name: 'JOQUEI CLUBE BAIRRO', memberCount: 45000 },
        ];
        setGroups(mockGroups);
      } else {
        setGroups(fetchedGroups);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const handlePost = async () => {
    if (selectedGroupIds.size === 0) return alert('Selecione pelo menos um grupo');
    if (!postText.trim()) return alert('O texto da postagem é obrigatório');

    setLoading(true);
    setPostingStatus('running');
    
    // Initialize logs
    const initialLogs = Array.from(selectedGroupIds).map(id => {
      const g = groups.find(x => x.id === id);
      return { groupId: id, groupName: g?.name || 'Grupo', status: 'pending' as const };
    });
    setExecutionLogs(initialLogs);

    try {
      // Simulate sequential posting with delays
      for (let i = 0; i < initialLogs.length; i++) {
        const log = initialLogs[i];
        
        // Mark as loading
        setExecutionLogs(prev => prev.map((l, index) => index === i ? { ...l, status: 'loading' } : l));
        
        // Random delay simulation
        await new Promise(r => setTimeout(r, 2000));
        
        // Mock success/fail
        const isSuccess = Math.random() > 0.1;
        setExecutionLogs(prev => prev.map((l, index) => index === i ? { 
          ...l, 
          status: isSuccess ? 'success' : 'failed',
          postUrl: isSuccess ? `https://facebook.com/groups/${groups.find(x => x.id === log.groupId)?.fbGroupId}/posts/12345` : undefined
        } : l));
      }

      setPostingStatus('done');
      setLoading(false);
    } catch (err) {
      console.error('Post error:', err);
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.fbGroupId.includes(search)
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto pb-10">
      {/* Left: Configuration Form */}
      <div className="flex-1 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center gap-2 text-orange-600 mb-6 font-bold text-sm bg-orange-50 p-3 rounded-xl border border-orange-100">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            MAIS CUIDADO COM MENOS GASTO! Use tags de randomização para evitar bloqueios.
          </div>

          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="🚀 CUIDE DA SUA SAÚDE SEM COMPLICAR!&#10;&#10;Com o Cartão de Todos você tem acesso rápido a consultas e ainda economiza todo mês.&#10;&#10;👩‍💼 Eu sou **Rose Dias**, consultora pronta pra te ajudar"
                className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none font-medium text-sm"
              />
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                  <Hash className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-4">
                 <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500" 
                    />
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modo Anônimo</span>
                 </label>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors" title="Compartilhar Link">
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors" title="Adicionar Imagem">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors" title="Adicionar Vídeo">
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['RANDOM T', 'RANDOM D', 'RANDOM M', 'RANDOM SPIN'].map((tag) => (
                <button key={tag} className="py-2 bg-white border border-slate-200 text-[10px] font-bold text-slate-500 rounded-lg hover:border-orange-500 hover:text-orange-500 transition-all uppercase tracking-wider">
                  {tag}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Processos (Threads)</label>
                <input 
                  type="number" 
                  value={threads}
                  onChange={(e) => setThreads(parseInt(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Delay Mín (s)</label>
                <input 
                  type="number" 
                  value={delayMin}
                  onChange={(e) => setDelayMin(parseInt(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Delay Máx (s)</label>
                <input 
                  type="number" 
                  value={delayMax}
                  onChange={(e) => setDelayMax(parseInt(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <button 
              onClick={handlePost}
              disabled={loading}
              className={cn(
                "w-full py-5 rounded-2xl font-black text-xl shadow-lg flex items-center justify-center gap-3 transition-all uppercase tracking-tighter italic",
                loading 
                  ? "bg-[#ff5a5f] hover:bg-[#ff4449] text-white shadow-[#ff5a5f]/20" 
                  : "bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-indigo-200"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Running batch 1/1 (Stop)
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  Post
                </>
              )}
            </button>
          </div>
        </div>

        {/* Execution Preview Panel (Metus Style) */}
        {(postingStatus !== 'idle' || executionLogs.length > 0) && (
          <div className="bg-[#fff9e6] border-2 border-[#fff0c2] rounded-[1.5rem] p-4 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center px-1">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase text-slate-500 italic tracking-tight">Atividade em Tempo Real</span>
               </div>
              <button 
                 className="text-[10px] font-black bg-[#4f46e5] text-white px-5 py-2 rounded-md active:scale-95 transition-all shadow-md uppercase tracking-tighter"
                 onClick={() => {
                   const urls = executionLogs.filter(l => l.postUrl).map(l => l.postUrl).join('\n');
                   if (urls) {
                     navigator.clipboard.writeText(urls);
                     alert('URLs copiadas!');
                   }
                 }}
              >
                Copy All URLs
              </button>
            </div>
            
            <div className="space-y-1 bg-white/50 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
              {executionLogs.map((log, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-white border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden border-2 border-slate-50">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(log.groupName)}&background=f1f5f9&color=94a3b8&font-size=0.33`} 
                        alt="G" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-black text-slate-600 uppercase italic truncate leading-none mb-1">{log.groupName}</p>
                      <p className="text-[9px] text-slate-400 font-medium tracking-tight truncate opacity-70 italic">{log.groupId}</p>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-4">
                    {log.status === 'loading' && (
                       <div className="w-6 h-6 border-3 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                    )}
                    {log.status === 'pending' && <div className="w-6 h-6 bg-slate-100 flex items-center justify-center rounded-full opacity-30"><Loader2 className="w-3 h-3 text-slate-400" /></div>}
                    {log.status === 'success' && (
                      <a 
                        href={log.postUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block px-5 py-1.5 bg-[#53d08f] hover:bg-[#46b37a] text-white text-[10px] font-black rounded uppercase tracking-tighter transition-colors text-center no-underline min-w-[70px]"
                      >
                        VIEW
                      </a>
                    )}
                    {log.status === 'failed' && (
                      <span className="block px-5 py-1.5 bg-[#ff5a5f] text-white text-[10px] font-black rounded uppercase tracking-tighter text-center min-w-[70px]">
                        FAILED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Final Preview (Metus Style) */}
            {postingStatus === 'done' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-xl shadow-emerald-500/5 mt-4"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 uppercase italic leading-tight">Campanha Concluída!</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sucesso na divulgação automática</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 relative">
                  <div className="absolute top-2 right-2 text-[8px] font-black text-slate-300 uppercase tracking-widest">PRÉVIA DO POST</div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 bg-slate-200 rounded" />
                      <div className="h-2 w-24 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="mt-4 text-[11px] text-slate-600 line-clamp-3 leading-relaxed font-medium italic">
                    {postText}
                  </div>
                  <div className="mt-4 aspect-video bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-8 h-8 opacity-20" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Right: Group Selection (Metus Style) */}
      <div className="w-full lg:w-96 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 h-[750px] flex flex-col relative overflow-hidden backdrop-blur-3xl">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="relative flex-1">
              <select className="w-full bg-slate-100 border-none rounded-lg text-[11px] font-black p-3.5 pr-8 outline-none uppercase text-slate-500 italic appearance-none cursor-pointer">
                <option>Choose from list</option>
                <option>Todos os Grupos</option>
                <option>Favoritos</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Hash className="w-3 h-3 text-slate-400" />
              </div>
            </div>
            <button className="p-3.5 bg-[#44ce7b] text-white rounded-lg flex items-center gap-1.5 text-[11px] font-black italic shadow-md shadow-emerald-50 hover:bg-[#3bb168] transition-all active:scale-95">
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>

          <div className="flex items-center justify-between mb-4 bg-white/50 p-1.5 rounded-xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 pl-3 pr-4 py-2 bg-blue-600 rounded-lg text-white">
                <input 
                  type="checkbox" 
                  id="select-all"
                  className="w-4 h-4 rounded border-white/20 text-blue-800 focus:ring-blue-700 bg-white" 
                  onChange={handleSelectAll}
                  checked={selectedGroupIds.size > 0 && selectedGroupIds.size === filteredGroups.length}
                />
                <label htmlFor="select-all" className="text-xs font-black italic">{filteredGroups.length}</label>
             </div>
             <div className="relative flex-1 ml-2">
                <input 
                  type="text" 
                  placeholder="Search groups..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-transparent rounded-lg text-[10px] font-bold outline-none focus:bg-white focus:border-slate-200 transition-all"
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredGroups.map((group) => (
              <div 
                key={group.id}
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 relative group",
                  selectedGroupIds.has(group.id) 
                    ? "bg-slate-50 border-blue-500/20" 
                    : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100"
                )}
              >
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={selectedGroupIds.has(group.id)}
                    readOnly
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all" 
                  />
                </div>
                <div className="w-11 h-11 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden text-slate-400 flex items-center justify-center font-black shadow-sm group-hover:shadow-md transition-all">
                   <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(group.name)}&background=random&color=fff&font-size=0.4`}
                      alt="avatar"
                      className="w-full h-full object-cover"
                   />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-slate-700 uppercase italic truncate leading-tight group-hover:text-blue-600 transition-colors">{group.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono tracking-tighter font-medium truncate mt-0.5">{group.fbGroupId}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest italic">
            <span className="bg-slate-50 px-3 py-1 rounded-full">{selectedGroupIds.size} SELECIONADOS</span>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded">{'<'}</button>
              <span className="text-slate-300">Pág 1</span>
              <button className="px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded">{'>'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
