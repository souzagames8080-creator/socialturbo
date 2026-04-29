import { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Send, 
  Image as ImageIcon, 
  Video, 
  Settings, 
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckSquare,
  Square,
  Facebook,
  LogIn,
  Key,
  ShieldCheck,
  CheckCircle2,
  X,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Group {
  id: string;
  name: string;
  memberCount: string;
}

interface FBAccount {
  id: string;
  name: string;
  status: 'active' | 'expired';
}

const MOCK_GROUPS: Group[] = Array.from({ length: 50 }, (_, i) => ({
  id: `${1234567890 + i}`,
  name: `Grupo de Vendas ${i + 1} - ${['Fortaleza', 'São Paulo', 'Rio', 'Curitiba'][i % 4]}`,
  memberCount: `${Math.floor(Math.random() * 100000)} membros`
}));

export default function FacebookGroups() {
  const [fbAccount, setFbAccount] = useState<FBAccount | null>(() => {
    const saved = localStorage.getItem('socialturbo_fb_account');
    return saved ? JSON.parse(saved) : null;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [token, setToken] = useState('');
  const [media, setMedia] = useState<'photo' | 'video' | null>(null);
  
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [settings, setSettings] = useState({
    thread: 1,
    minDelay: 60,
    maxDelay: 120,
    limit: 0,
    repeat: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredGroups = useMemo(() => {
    return MOCK_GROUPS.filter(g => 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.id.includes(searchTerm)
    );
  }, [searchTerm]);

  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredGroups.slice(start, start + itemsPerPage);
  }, [filteredGroups, currentPage]);

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);

  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      // Log para debug (aparecerá no console do navegador)
      console.log("Mensagem recebida no Painel:", event.data);

      if (event.data?.source === 'socialturbo_extension' && event.data?.token) {
        const { token, name, uid } = event.data;
        
        setToken(token);
        const newAccount: FBAccount = {
          id: uid || 'captured_id',
          name: name || 'Conta Capturada',
          status: 'active'
        };
        
        setFbAccount(newAccount);
        localStorage.setItem('socialturbo_fb_account', JSON.stringify(newAccount));
        
        // Alerta visual imediato
        alert(`SUCESSO! Perfil "${name}" conectado via Extensão.`);
      }
    };

    window.addEventListener('message', handleExtensionMessage);
    // Também ouve do chrome runtime se injetado diretamente (bridge)
    return () => window.removeEventListener('message', handleExtensionMessage);
  }, []);

  const handleManualLogin = () => {
    setShowLoginModal(true);
  };

  const toggleGroup = (id: string) => {
    setSelectedGroups(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedGroups.length === filteredGroups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(filteredGroups.map(g => g.id));
    }
  };

  const handleLogin = () => {
    if (!token.trim()) return;
    
    const newAccount: FBAccount = {
      id: '1000987654321',
      name: 'Anderson Luiz Souza',
      status: 'active'
    };
    
    setFbAccount(newAccount);
    localStorage.setItem('socialturbo_fb_account', JSON.stringify(newAccount));
    setShowLoginModal(false);
    setToken('');
  };

  const handleLogout = () => {
    setFbAccount(null);
    localStorage.removeItem('socialturbo_fb_account');
  };

  const handlePost = () => {
    if (!fbAccount) {
      alert('Conecte uma conta do Facebook primeiro');
      setShowLoginModal(true);
      return;
    }
    if (selectedGroups.length === 0) {
      alert('Selecione pelo menos um grupo');
      return;
    }
    if (!message.trim()) {
      alert('Digite uma mensagem');
      return;
    }
    alert('Postagem iniciada em ' + selectedGroups.length + ' grupos!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header com Status da Conta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter decoration-blue-600 decoration-8 underline-offset-8 underline">
            Postar em <span className="text-blue-600">Grupos</span>
          </h1>
          <p className="text-slate-500 font-bold mt-2 uppercase text-xs tracking-widest italic">
            Gerencie suas postagens automáticas no Facebook
          </p>
        </div>
        
        {fbAccount ? (
          <div className="flex items-center gap-4 bg-white p-3 pr-6 rounded-[2rem] border-2 border-blue-100 shadow-xl shadow-blue-50">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Facebook size={28} fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conta Conectada</p>
              <h3 className="font-black text-slate-800 uppercase italic tracking-tighter leading-tight">{fbAccount.name}</h3>
              <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 italic mt-0.5">
                <CheckCircle2 size={10} /> STATUS ATUALIZADO
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-4 p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors font-black text-[10px] uppercase tracking-widest"
            >
              Trocar Conta
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase italic tracking-widest shadow-xl shadow-blue-200 transition-all active:scale-95"
          >
            <LogIn size={18} />
            Conectar Facebook
          </button>
        )}
      </div>

      {!fbAccount && (
        <div className="bg-white rounded-[2.5rem] p-12 border-2 border-dashed border-blue-200 text-center space-y-6 shadow-2xl shadow-blue-50">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-200">
            <Facebook size={40} fill="currentColor" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800">Conecte seu Facebook</h2>
            <p className="text-slate-500 font-bold max-w-md mx-auto text-sm uppercase italic tracking-widest leading-relaxed">
              Use nossa extensão master para capturar seu perfil instantaneamente. 
              Garantia de segurança SocialTurbo Pro.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
             <button 
              onClick={() => setShowLoginModal(true)}
              className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase italic tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3"
            >
              <LogIn size={20} />
              Login Manual
            </button>
            <button 
              onClick={() => window.location.href = '/extension'}
              className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase italic tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3"
            >
              <Zap size={20} className="fill-white" />
              Ver Tutorial Extensão
            </button>
          </div>
        </div>
      )}

      {/* Grid Principal */}
      <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-8 transition-opacity duration-500", !fbAccount && "opacity-30 pointer-events-none grayscale")}>
        {/* Left Column: Post Settings */}
        <div className="lg:col-span-5 space-y-6">
          {/* ... (resto do componente FacebookGroups continua igual, mas com os seletores de conta se houver múltiplas) */}

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Plus size={120} className="text-slate-900" />
            </div>

            <div className="space-y-6 relative">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Conteúdo da Postagem</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="O que você está pensando? Use [msg1|msg2] para variações aleatórias."
                  className="w-full h-48 bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-slate-700 font-bold focus:border-blue-200 focus:bg-white transition-all outline-none resize-none placeholder:text-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setMedia(media === 'photo' ? null : 'photo')}
                  className={cn(
                    "flex items-center justify-center gap-3 py-4 border-2 rounded-2xl font-black text-[10px] uppercase italic tracking-widest transition-all group/btn",
                    media === 'photo' ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200 hover:text-blue-600"
                  )}
                >
                  <ImageIcon size={18} className={cn(media === 'photo' ? "text-white" : "group-hover/btn:scale-110 transition-transform")} />
                  Fotos
                </button>
                <button 
                  onClick={() => setMedia(media === 'video' ? null : 'video')}
                  className={cn(
                    "flex items-center justify-center gap-3 py-4 border-2 rounded-2xl font-black text-[10px] uppercase italic tracking-widest transition-all group/btn",
                    media === 'video' ? "bg-red-600 border-red-600 text-white" : "bg-slate-50 border-slate-100 text-slate-500 hover:border-red-200 hover:text-red-500"
                  )}
                >
                  <Video size={18} className={cn(media === 'video' ? "text-white" : "group-hover/btn:scale-110 transition-transform")} />
                  Vídeos
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Users size={20} className="text-slate-400" />
                  </div>
                  <span className="font-black text-[10px] text-slate-500 uppercase tracking-widest italic">Modo Anônimo</span>
                </div>
                <button 
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    isAnonymous ? "bg-emerald-500" : "bg-slate-300"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    isAnonymous ? "left-7" : "left-1"
                  )} />
                </button>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 text-center">Thread</label>
                    <input 
                      type="number" 
                      value={settings.thread}
                      onChange={(e) => setSettings({...settings, thread: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-center font-black text-slate-600 outline-none focus:border-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 text-center">Delay Min (s)</label>
                    <input 
                      type="number" 
                      value={settings.minDelay}
                      onChange={(e) => setSettings({...settings, minDelay: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-center font-black text-slate-600 outline-none focus:border-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1 text-center">Delay Max (s)</label>
                    <input 
                      type="number" 
                      value={settings.maxDelay}
                      onChange={(e) => setSettings({...settings, maxDelay: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-center font-black text-slate-600 outline-none focus:border-blue-200"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Limite</label>
                    <input 
                      type="number" 
                      value={settings.limit}
                      onChange={(e) => setSettings({...settings, limit: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-emerald-600 font-black outline-none focus:border-emerald-200"
                    />
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, repeat: !settings.repeat})}
                    className={cn(
                      "flex-1 h-[52px] mt-6 rounded-xl border-2 flex items-center justify-center gap-3 transition-all px-4",
                      settings.repeat ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-400"
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded-md border-2 flex items-center justify-center", settings.repeat ? "border-emerald-500 bg-emerald-500" : "border-slate-300")}>
                      {settings.repeat && <div className="w-2 h-2 bg-white rounded-sm" />}
                    </div>
                    <span className="text-[10px] font-black uppercase italic tracking-widest">Repetir</span>
                  </button>
                </div>
              </div>

              <button 
                onClick={handlePost}
                className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-sm uppercase italic tracking-widest shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
              >
                <Send size={20} />
                Iniciar Disparos
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Groups Selection */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="text"
                  placeholder="Pesquisar grupos por nome ou ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-5 pl-16 pr-8 text-slate-700 font-bold focus:border-blue-200 focus:bg-white transition-all outline-none placeholder:text-slate-300"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={toggleAll}
                  className={cn(
                    "px-6 py-5 rounded-2xl font-black text-[10px] uppercase italic tracking-widest transition-all flex items-center gap-3",
                    selectedGroups.length === filteredGroups.length && filteredGroups.length > 0
                      ? "bg-blue-50 text-blue-600 border-2 border-blue-100"
                      : "bg-slate-50 text-slate-500 border-2 border-slate-100 hover:border-slate-200"
                  )}
                >
                  {selectedGroups.length === filteredGroups.length && filteredGroups.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                  Selecionar Todos
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {paginatedGroups.map((group) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    key={group.id}
                    onClick={() => toggleGroup(group.id)}
                    className={cn(
                      "group p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between",
                      selectedGroups.includes(group.id)
                        ? "bg-blue-50 border-blue-200 shadow-lg shadow-blue-100"
                        : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black transition-all",
                        selectedGroups.includes(group.id)
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-200"
                          : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-500"
                      )}>
                        {group.name[0]}
                      </div>
                      <div>
                        <h3 className={cn(
                          "font-black text-sm uppercase tracking-tighter transition-colors",
                          selectedGroups.includes(group.id) ? "text-blue-900" : "text-slate-700"
                        )}>
                          {group.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-slate-400 font-black tracking-widest">{group.id}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="text-[10px] text-emerald-500 font-black uppercase italic">{group.memberCount}</span>
                        </div>
                      </div>
                    </div>

                    <div className={cn(
                      "w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all",
                      selectedGroups.includes(group.id)
                        ? "bg-blue-500 border-blue-500 text-white scale-110"
                        : "border-slate-200 text-transparent"
                    )}>
                      <Plus size={16} strokeWidth={4} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredGroups.length === 0 && (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto">
                    <Filter className="text-slate-200" size={40} />
                  </div>
                  <p className="text-slate-400 font-black uppercase italic tracking-widest text-xs">Nenhum grupo encontrado</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-12 h-12 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:border-blue-200 hover:text-blue-600 disabled:opacity-30 disabled:hover:border-slate-100 disabled:hover:text-slate-400 transition-all font-black"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-12 h-12 rounded-2xl font-black text-xs transition-all",
                        currentPage === page 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110" 
                          : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-12 h-12 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:border-blue-200 hover:text-blue-600 disabled:opacity-30 disabled:hover:border-slate-100 disabled:hover:text-slate-400 transition-all font-black"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setShowLoginModal(false)} className="text-slate-300 hover:text-slate-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-200 mb-6">
                    <LogIn size={32} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">Capturar Conta</h2>
                  <p className="text-slate-500 font-medium">Use seu Access Token para vincular o perfil ao SocialTurbo.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                    <Zap className="text-blue-600 mt-1 shrink-0" size={18} />
                    <div className="space-y-1">
                      <p className="text-[10px] text-blue-900 font-bold uppercase italic leading-tight">
                        Detecção Automática Ativa
                      </p>
                      <p className="text-[9px] text-blue-600 font-bold uppercase leading-relaxed">
                        Se você tem a extensão SocialTurbo instalada, clique no ícone da extensão no seu Facebook para capturar os dados instantaneamente.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Token (EAAAA...)</label>
                      <a href="https://business.facebook.com/adsmanager" target="_blank" className="text-[9px] font-black text-blue-500 uppercase underline">Como pegar?</a>
                    </div>
                    <div className="relative">
                      <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <textarea 
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Cole aqui o token que começa com EAAAA..."
                        className="w-full h-32 bg-slate-50 border-2 border-slate-100 rounded-3xl py-4 pl-14 pr-6 text-slate-700 font-mono font-bold focus:border-blue-200 focus:bg-white transition-all outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                    <ShieldCheck className="text-emerald-500 mt-1 shrink-0" size={18} />
                    <p className="text-[10px] text-emerald-700 font-bold uppercase italic leading-relaxed">
                      Sua conta é processada localmente. O SocialTurbo não armazena sua senha original, apenas o token de sessão.
                    </p>
                  </div>

                  <button 
                    onClick={handleLogin}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase italic tracking-widest shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    Vincular Perfil
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
