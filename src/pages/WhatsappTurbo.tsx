import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Trash2,
  Image as ImageIcon, 
  Video, 
  Link as LinkIcon,
  Loader2,
  MessageSquare,
  Users,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Clock,
  QrCode,
  RefreshCw,
  LogOut,
  Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { io, Socket } from 'socket.io-client';
import { cn } from '../lib/utils';

export default function WhatsappTurbo() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUser, setConnectedUser] = useState<{ id: string, name?: string } | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [numbersText, setNumbersText] = useState('');
  const [postText, setPostText] = useState('');
  const [mediaFiles, setMediaFiles] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
  const [delayMin, setDelayMin] = useState(15);
  const [delayMax, setDelayMax] = useState(30);
  const [loading, setLoading] = useState(false);
  const [postingStatus, setPostingStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [executionLogs, setExecutionLogs] = useState<{ number: string; name: string; status: 'pending' | 'loading' | 'success' | 'failed'; time?: string }[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileTypeToUpload, setFileTypeToUpload] = useState<'image' | 'video' | null>(null);

  useEffect(() => {
    // Conectar ao backend do painel
    const socket = io();
    socketRef.current = socket;

    socket.on('whatsapp_qr', (qr: string) => {
      setQrValue(qr);
      setLoading(false);
    });

    socket.on('whatsapp_status', (data: any) => {
      const status = typeof data === 'string' ? data : data.status;
      if (status === 'connected') {
        setIsConnected(true);
        setConnectedUser(data.user || null);
        setShowQR(false);
        setLoading(false);
      } else if (status === 'connecting') {
        setLoading(true);
        setIsConnected(false);
      } else {
        setIsConnected(false);
        setConnectedUser(null);
        setLoading(false);
      }
    });

    socket.on('bulk_progress', ({ number, status }: { number: string, status: 'success' | 'error' }) => {
      setExecutionLogs(prev => prev.map(l => 
        l.number === number ? { ...l, status: status === 'success' ? 'success' : 'failed', time: new Date().toLocaleTimeString() } : l
      ));
    });

    socket.on('bulk_done', () => {
      setPostingStatus('done');
      setLoading(false);
      alert('Envios concluídos!');
    });

    socket.on('bulk_error', (err: string) => {
      alert('Erro: ' + err);
      setPostingStatus('idle');
      setLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleRequestQR = () => {
    setLoading(true);
    setShowQR(true);
    setQrValue(''); // Limpa o QR anterior para mostrar o loader
    socketRef.current?.emit('request_qr');
  };

  const handleFileSelect = (e: any) => {
    const files = e.target.files;
    if (!files || !fileTypeToUpload) return;
    const newFiles = Array.from(files).map((file: any) => ({
      url: URL.createObjectURL(file),
      type: fileTypeToUpload
    }));
    setMediaFiles(prev => [...prev, ...newFiles]);
    setFileTypeToUpload(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const parseNumbers = () => {
    return numbersText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split(',');
        return {
          number: parts[0]?.replace(/\D/g, ''),
          name: parts[1]?.trim() || 'Cliente'
        };
      })
      .filter(x => x.number.length >= 8);
  };

  const handleStartSending = () => {
    if (!isConnected) return;
    const contacts = parseNumbers();
    if (contacts.length === 0) return alert('Insira pelo menos um número válido (55...)');
    if (!postText.trim()) return alert('A mensagem é obrigatória');

    setLoading(true);
    setPostingStatus('running');
    
    const initialLogs = contacts.map(c => ({ 
      number: c.number, 
      name: c.name, 
      status: 'pending' as const 
    }));
    setExecutionLogs(initialLogs);

    // Envia para o backend processar os disparos
    socketRef.current?.emit('send_message', {
      numbers: contacts.map(c => c.number),
      message: postText
    });
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja desconectar o WhatsApp? Isso apagará a sessão atual.')) {
      socketRef.current?.emit('logout');
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-12 space-y-8 bg-slate-50">
              <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800 mb-2">Conectar WhatsApp</h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed">Associe seu número para começar os disparos em massa.</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">1</div>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed italic">Abra o <span className="text-emerald-500 underline">WhatsApp</span> no seu celular.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">2</div>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed italic">Toque em <span className="font-black">Mais opções</span> ou <span className="font-black">Configurações</span> e selecione <span className="font-black">Dispositivos conectados</span>.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">3</div>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed italic">Aponte seu celular para esta tela para capturar o código.</p>
                </div>
              </div>

              <div className="p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-100 flex items-start gap-4">
                 <Info className="w-6 h-6 text-emerald-500 shrink-0" />
                 <p className="text-[11px] text-emerald-700 font-medium italic leading-relaxed">Seu WhatsApp ficará conectado de forma segura. Você pode desconectar a qualquer momento pelo celular.</p>
              </div>
            </div>

            <div className="p-12 flex flex-col items-center justify-center bg-white">
              {!showQR ? (
                <button 
                  onClick={handleRequestQR}
                  className="w-full py-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[2rem] font-black italic uppercase tracking-tighter text-xl shadow-xl shadow-emerald-200 transition-all active:scale-95 flex flex-col items-center gap-4"
                >
                  <QrCode className="w-16 h-16" />
                  Gerar QR Code Agora
                </button>
              ) : (
                <div className="space-y-8 text-center w-full">
                  <div className="relative inline-block p-6 bg-white border-4 border-slate-100 rounded-[2.5rem] shadow-2xl">
                    {qrValue ? <QRCodeSVG value={qrValue} size={220} level="H" /> : <Loader2 className="w-16 h-16 animate-spin text-slate-200" />}
                    {loading && !qrValue && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-[2.5rem]">
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                      {qrValue ? 'Capture o código original acima' : 'Gerando conexão segura...'}
                    </p>
                    <button 
                      onClick={handleRequestQR}
                      className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase italic hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Atualizar QR Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto pb-10">
      <div className="flex-1 space-y-6">
        {/* Header Branding */}
        <div className="bg-emerald-600 rounded-[3rem] p-8 text-white shadow-xl shadow-emerald-100 flex items-center justify-between overflow-hidden relative border-4 border-emerald-500/50">
          <div className="relative z-10 flex items-center justify-between w-full">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Smartphone className="w-8 h-8 fill-white text-white" />
                </div>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter">WhatsApp Turbo</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                <p className="text-emerald-50 text-[10px] font-black uppercase tracking-widest opacity-80">
                  {connectedUser ? `WhatsApp Conectado: ${connectedUser.id.split(':')[0]}` : 'WhatsApp Conectado'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group"
              title="Desconectar"
            >
              <LogOut className="w-6 h-6 group-hover:text-red-300 transition-colors" />
            </button>
          </div>
          <div className="absolute right-[-20px] top-[-20px] opacity-10">
            <MessageSquare className="w-64 h-64 rotate-12" />
          </div>
        </div>

        {/* Message Configuration */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-emerald-50 rounded-2xl">
               <MessageSquare className="w-6 h-6 text-emerald-600" />
             </div>
             <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-700">Conteúdo da Mensagem</h3>
          </div>

          <div className="relative group">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Digite sua mensagem aqui... Use {nome} para personalizar."
              className="w-full h-48 p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none font-medium text-sm leading-relaxed"
            />
            
            {mediaFiles.length > 0 && (
              <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-2xl mt-2 border-2 border-dashed border-slate-200">
                {mediaFiles.map((file, idx) => (
                  <div key={idx} className="relative group/media w-24 h-24 bg-slate-900 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                    {file.type === 'image' ? (
                      <img src={file.url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <Video className="w-8 h-8 text-white/50" />
                      </div>
                    )}
                    <button 
                      onClick={() => removeMedia(idx)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover/media:opacity-100 transition-all hover:scale-110 shadow-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="absolute bottom-4 right-4 flex gap-2">
               <div className="flex gap-1">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  onChange={handleFileSelect}
                  accept={fileTypeToUpload === 'image' ? 'image/*' : 'video/*'}
                  multiple
                />
                <button 
                  onClick={() => { setFileTypeToUpload('image'); setTimeout(() => fileInputRef.current?.click(), 0); }}
                  className="p-3 bg-white text-slate-500 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm border border-slate-100"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { setFileTypeToUpload('video'); setTimeout(() => fileInputRef.current?.click(), 0); }}
                  className="p-3 bg-white text-slate-500 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm border border-slate-100"
                >
                  <Video className="w-4 h-4" />
                </button>
               </div>
            </div>
          </div>
        </div>

        {/* Settings & Execution */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl border-4 border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h4 className="font-black italic uppercase tracking-tighter text-emerald-400">Configuração de Fluxo</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Delay Mín (s)</span>
                  <input type="number" value={delayMin} onChange={(e) => setDelayMin(Number(e.target.value))} className="bg-transparent text-xl font-black w-full outline-none" />
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Delay Máx (s)</span>
                  <input type="number" value={delayMax} onChange={(e) => setDelayMax(Number(e.target.value))} className="bg-transparent text-xl font-black w-full outline-none" />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-end">
              <button 
                onClick={handleStartSending}
                disabled={loading}
                className={cn(
                  "w-full py-5 rounded-[2rem] font-black text-xl shadow-2xl flex items-center justify-center gap-3 transition-all uppercase tracking-tighter italic",
                  loading ? "bg-red-500 shadow-red-500/20" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                )}
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                {loading ? 'Interromper Envio' : 'Iniciar Envio em Massa'}
              </button>
            </div>
          </div>

          {/* Logs Area */}
          {(postingStatus !== 'idle' || executionLogs.length > 0) && (
            <div className="bg-black/40 rounded-3xl p-6 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar border border-white/5">
              {executionLogs.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs">
                       {log.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[11px] font-black italic uppercase text-slate-100 leading-none">{log.name}</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-1">{log.number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {log.time && <span className="text-[9px] text-slate-500 font-mono italic">{log.time}</span>}
                    {log.status === 'success' && <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg uppercase italic border border-emerald-500/20">Enviado</span>}
                    {log.status === 'loading' && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />}
                    {log.status === 'pending' && <Clock className="w-4 h-4 text-slate-600" />}
                    {log.status === 'failed' && <span className="text-[9px] font-black bg-red-500/20 text-red-500 px-3 py-1 rounded-lg uppercase italic border border-red-500/20">Falhou</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar: Number List */}
      <div className="w-full lg:w-96 space-y-6">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 flex flex-col h-[750px] relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-700">Contatos</h3>
          </div>

          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Formato: 5511999999999, Nome</p>
          
          <textarea
            value={numbersText}
            onChange={(e) => setNumbersText(e.target.value)}
            placeholder="5511988887777, João&#10;5511988886666, Maria"
            className="flex-1 w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none font-mono text-xs leading-relaxed"
          />

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-800 italic">{parseNumbers().length}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Números Válidos</span>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.readText().then(text => setNumbersText(prev => prev + (prev ? '\n' : '') + text));
              }}
              className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[11px] uppercase italic hover:bg-indigo-100 transition-all flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Colar Lista
            </button>
          </div>
        </div>

        {/* Safety Alert */}
        <div className="bg-orange-50 border-2 border-orange-100 rounded-3xl p-6 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0" />
          <p className="text-[11px] text-orange-800 font-medium italic">
            <strong className="block uppercase tracking-widest mb-1">Cuidado com Banimentos!</strong>
            Não envie mensagens para pessoas que não salvaram seu número. Comece com delays altos (60-300s).
          </p>
        </div>
      </div>
    </div>
  );
}
