import { useState, useEffect } from 'react';
import { 
  History, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Clock,
  Filter
} from 'lucide-react';
import { auth, db, collection, query, getDocs, orderBy, limit } from '../lib/firebase';
import { ExecutionLog } from '../types';
import { cn, formatDate } from '../lib/utils';

export default function Logs() {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, `users/${auth.currentUser.uid}/logs`),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const snapshot = await getDocs(q);
      const fetchedLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExecutionLog));
      
      // Mock data if empty
      if (fetchedLogs.length === 0) {
        setLogs([
          { id: '1', userId: '1', status: 'success', message: 'Post compartilhado com sucesso', groupName: 'VEJA OPORTUNIDADES', timestamp: new Date() },
          { id: '2', userId: '1', status: 'error', message: 'Erro ao postar: Sessão expirada', groupName: 'Bazar Web', timestamp: new Date(Date.now() - 3600000) },
          { id: '3', userId: '1', status: 'success', message: 'Postagem em massa realizada', groupName: 'Vendas Ceará', timestamp: new Date(Date.now() - 7200000) },
        ]);
      } else {
        setLogs(fetchedLogs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter decoration-blue-500 decoration-8 underline-offset-8 underline">Relatórios de <span className="text-blue-600">Atividade</span></h2>
          <p className="text-slate-500 font-bold mt-2 uppercase text-xs tracking-widest italic font-black">Acompanhe suas automações em tempo real</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-500 font-black text-[10px] uppercase tracking-widest italic hover:border-blue-200 hover:text-blue-600 transition-all">
            <Filter className="w-4 h-4" /> Filtrar
          </button>
          <button onClick={fetchLogs} className="p-3 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-200 transition-all group">
            <RefreshCw className={cn("w-5 h-5 text-slate-400 group-hover:text-blue-600", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center gap-6 p-6 hover:bg-slate-50 transition-all group">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                log.status === 'success' ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
              )}>
                {log.status === 'success' ? (
                  <CheckCircle className="w-7 h-7" />
                ) : (
                  <XCircle className="w-7 h-7" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                   <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">{log.groupName || 'Sistema'}</h4>
                   <span className={cn(
                     "text-[9px] font-black px-2 py-0.5 rounded-lg uppercase italic tracking-widest",
                     log.status === 'success' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                   )}>
                     {log.status === 'success' ? 'Sucesso' : 'Erro'}
                   </span>
                </div>
                <p className="text-xs text-slate-500 font-bold italic uppercase tracking-tight truncate">{log.message}</p>
              </div>

              <div className="text-right flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase italic tracking-tighter">{formatDate(log.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}

          {logs.length === 0 && !loading && (
            <div className="p-12 text-center text-slate-400">
              <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Nenhum registro de atividade encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
