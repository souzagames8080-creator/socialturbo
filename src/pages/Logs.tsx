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
          <h2 className="text-2xl font-bold text-slate-800">Relatórios de Atividade</h2>
          <p className="text-slate-500">Acompanhe o status de todas as suas postagens automáticas</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50">
            <Filter className="w-4 h-4" /> Filtrar
          </button>
          <button onClick={fetchLogs} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <RefreshCw className={cn("w-5 h-5 text-slate-600", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="space-y-px">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                log.status === 'success' ? "bg-emerald-100" : "bg-red-100"
              )}>
                {log.status === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                   <h4 className="font-semibold text-slate-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">{log.groupName || 'Grupo Desconhecido'}</h4>
                   <span className={cn(
                     "text-[10px] font-bold px-1.5 rounded uppercase border",
                     log.status === 'success' ? "text-emerald-500 border-emerald-200" : "text-red-500 border-red-200"
                   )}>
                     {log.status === 'success' ? 'Sucesso' : 'Erro'}
                   </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{log.message}</p>
              </div>

              <div className="text-right flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-medium">{formatDate(log.timestamp)}</span>
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
