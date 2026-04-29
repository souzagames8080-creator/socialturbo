import { useState } from 'react';
import { 
  User, 
  Settings as SettingsIcon,
  Trash2,
  Database,
  Loader2,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock
} from 'lucide-react';
import { auth, db, doc, collection, getDocs, deleteDoc } from '../lib/firebase';
import { UserProfile } from '../types';
import { useOutletContext, useNavigate } from 'react-router-dom';

export default function Settings() {
  const { profile } = useOutletContext<{ profile: UserProfile }>();
  const [clearingDb, setClearingDb] = useState(false);
  const navigate = useNavigate();

  const clearUserData = async () => {
    if (!auth.currentUser) return;
    const confirm = window.confirm('⚠ ATENÇÃO: Deseja realmente esvaziar seu banco de dados? Isso apagará permanentemente todos os logs de envio.');
    if (!confirm) return;

    setClearingDb(true);
    try {
      const uid = auth.currentUser.uid;
      const logsRef = collection(db, 'users', uid, 'logs');
      const logsSnap = await getDocs(logsRef);
      const deleteLogsPromises = logsSnap.docs.map(d => deleteDoc(d.ref));
      
      await Promise.all(deleteLogsPromises);
      alert('Banco de dados limpo com sucesso!');
    } catch (err) {
      alert('Erro ao limpar banco de dados.');
    } finally {
      setClearingDb(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Profile Header */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-6">
            <img 
              src={auth.currentUser?.photoURL || 'https://ui-avatars.com/api/?name=' + auth.currentUser?.displayName} 
              className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg"
              alt="profile"
            />
            <div>
              <h2 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">{auth.currentUser?.displayName}</h2>
              <p className="text-slate-500 font-medium">{auth.currentUser?.email}</p>
              <div className="mt-2 flex gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest">{profile?.plan || 'PRO'} PLAN</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-10">
          {/* WhatsApp Connection */}
          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black italic uppercase italic tracking-tighter text-slate-800">Conexão WhatsApp</h3>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Servidor Online</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 border-2 border-slate-100 p-8 rounded-[2rem] space-y-4">
                  <h4 className="font-black italic uppercase tracking-tighter text-slate-800">Status da Sessão</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Instância Ativa</span>
                      <span className="text-emerald-600 italic">Sim</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Versão</span>
                      <span className="text-slate-800 italic">2.4.0 (Turbo)</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/whatsapp-turbo')}
                    className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase italic tracking-tighter shadow-xl shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Configurar WhatsApp
                  </button>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-4">
                  <h4 className="font-black italic uppercase tracking-tighter text-emerald-400">Plano Ativo</h4>
                  <div className="space-y-4">
                     <p className="text-xs text-slate-400 italic font-medium leading-relaxed">
                       Sua conta possui envios ilimitados e suporte para mídia (fotos e vídeos) via socket dedicado.
                     </p>
                     <div className="flex items-center gap-2 text-emerald-500 font-black italic text-sm">
                       <CheckCircle2 className="w-4 h-4" /> RECURSOS LIBERADOS
                     </div>
                  </div>
                </div>
             </div>
          </section>

          {/* Database & Security */}
          <section className="pt-10 border-t border-slate-100 space-y-6">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-slate-400" />
              <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-800">Manutenção</h3>
            </div>
            
            <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <h4 className="font-black text-red-800 uppercase italic tracking-tight">Limpeza de Dados</h4>
                <p className="text-[11px] text-red-600/70 font-bold uppercase tracking-widest mt-1">Apague permanentemente todos os relatórios.</p>
              </div>
              <button 
                onClick={clearUserData}
                disabled={clearingDb}
                className="px-8 py-4 bg-white border-2 border-red-200 text-red-500 font-black rounded-2xl hover:bg-red-50 transition-all text-xs uppercase tracking-tighter italic flex items-center gap-2 shadow-sm"
              >
                {clearingDb ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Limpar Logs
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
