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
  Hash
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

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(collection(db, `users/${auth.currentUser.uid}/groups`));
      const snapshot = await getDocs(q);
      const fetchedGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FBGroup));
      
      // Mock data if empty for demo
      if (fetchedGroups.length === 0) {
        const mockGroups: FBGroup[] = [
          { id: '1', userId: auth.currentUser.uid, fbGroupId: '12345', name: 'VENDE TUDO FORTALEZA', memberCount: 250000 },
          { id: '2', userId: auth.currentUser.uid, fbGroupId: '67890', name: 'Mercado livre vendas e trocas novos e usados sobral', memberCount: 15000 },
          { id: '3', userId: auth.currentUser.uid, fbGroupId: '11121', name: 'Cidade 2000 - Fortaleza', memberCount: 8500 },
          { id: '4', userId: auth.currentUser.uid, fbGroupId: '31415', name: 'MONTESE FORTALEZA', memberCount: 22000 },
          { id: '5', userId: auth.currentUser.uid, fbGroupId: '92653', name: 'Bazar, vendas e trocas Fortaleza', memberCount: 190000 },
          { id: '6', userId: auth.currentUser.uid, fbGroupId: '58979', name: 'OLX FORTALEZA SERRINHA', memberCount: 45000 },
        ];
        setGroups(mockGroups);
      } else {
        setGroups(fetchedGroups);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const toggleGroup = (id: string) => {
    const next = new Set(selectedGroupIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedGroupIds(next);
  };

  const handlePost = async () => {
    if (selectedGroupIds.size === 0) return alert('Selecione pelo menos um grupo');
    if (!postText.trim()) return alert('O texto da postagem é obrigatório');

    setLoading(true);
    setPostingStatus('running');

    try {
      // In a real app, we would send this to our backend worker
      // For now, we simulate creating a campaign
      await addDoc(collection(db, `users/${auth.currentUser?.uid}/campaigns`), {
        text: postText,
        groupIds: Array.from(selectedGroupIds),
        delayMin,
        delayMax,
        threads,
        isAnonymous,
        status: 'pending',
        processedCount: 0,
        totalCount: selectedGroupIds.size,
        createdAt: serverTimestamp(),
      });

      // Simulate completion for UI
      setTimeout(() => {
        setPostingStatus('done');
        setLoading(false);
      }, 2000);
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
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* Left: Configuration Form */}
      <div className="flex-1 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 text-orange-600 mb-6 font-bold text-sm bg-orange-50 p-3 rounded-xl border border-orange-100">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            MAIS CUIDADO COM MENOS GASTO! Use tags de randomização para evitar bloqueios.
          </div>

          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="O que você deseja postar hoje?"
                className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none font-medium"
              />
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-4">
                 <label className="flex items-center gap-2 cursor-pointer select-none">
                   <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                   </div>
                   <span className="text-sm font-medium text-slate-700">Modo Anônimo</span>
                 </label>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors" title="Compartilhar Link">
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors" title="Adicionar Imagem">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors" title="Adicionar Vídeo">
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
                "w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all",
                loading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
              )}
            >
              <Send className="w-6 h-6" />
              {loading ? 'Processando...' : 'Iniciar Postagem Turbo'}
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="bg-slate-100 rounded-2xl p-8 text-center text-slate-400 font-medium">
          {postingStatus === 'idle' && 'Nenhuma postagem realizada ainda'}
          {postingStatus === 'running' && (
            <div className="space-y-4">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '40%' }}
                  className="bg-orange-500 h-full rounded-full"
                />
              </div>
              <p className="text-slate-600">Enviando para os grupos selecionados...</p>
            </div>
          )}
          {postingStatus === 'done' && (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-emerald-100 rounded-full">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-slate-800 font-bold">Campanha iniciada com sucesso!</p>
              <p className="text-sm">Acompanhe o progresso em tempo real nos relatórios.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Group Selection */}
      <div className="w-full lg:w-96 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 h-[700px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <select className="bg-slate-100 border-none rounded-lg text-xs font-bold p-2 outline-none uppercase text-slate-500">
              <option>Escolher por lista</option>
              <option>Todos os Grupos</option>
              <option>Favoritos</option>
            </select>
            <div className="flex gap-1">
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                <FileJson className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredGroups.map((group) => (
              <div 
                key={group.id}
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  "p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3",
                  selectedGroupIds.has(group.id) 
                    ? "bg-orange-50 border-orange-200" 
                    : "bg-white border-transparent hover:bg-slate-50"
                )}
              >
                <div className="w-5 h-5 border-2 rounded flex-shrink-0 flex items-center justify-center transition-colors border-slate-200">
                   {selectedGroupIds.has(group.id) && <div className="w-3 h-3 bg-orange-500 rounded-sm" />}
                </div>
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden text-slate-400 flex items-center justify-center font-bold text-xs">
                   {group.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate uppercase">{group.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{group.fbGroupId}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>{selectedGroupIds.size} SELECIONADOS</span>
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
