import { useState, useEffect } from 'react';
import { 
  User, 
  Key, 
  Shield, 
  Bell, 
  Save,
  Facebook,
  AlertCircle,
  Instagram,
  Zap,
  Trash2,
  Database,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { auth, db, doc, getDoc, updateDoc, collection, getDocs, deleteDoc } from '../lib/firebase';
import { UserProfile } from '../types';

import { useOutletContext } from 'react-router-dom';

export default function Settings() {
  const { profile } = useOutletContext<{ profile: UserProfile }>();
  const [fbSession, setFbSession] = useState('');
  const [loading, setLoading] = useState(false);
  const [clearingDb, setClearingDb] = useState(false);

  // COLE SEU LINK DO GOOGLE DRIVE AQUI DENTRO DAS ASPAS:
  const LINK_DOWNLOAD_EXTENSAO = "https://drive.google.com/file/d/1krIA6Hk0qA80IFgye6dm3-uCbNogNGtz/view?usp=sharing";

  useEffect(() => {
    if (profile) {
      setFbSession(profile.fbSession || '');
    }
  }, [profile]);

  const handleUpdateSession = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        fbSession: fbSession,
        updatedAt: new Date()
      });
      alert('Conta conectada com sucesso!');
    } catch (err) {
      alert('Erro ao conectar conta');
    } finally {
      setLoading(false);
    }
  };

  const clearUserData = async () => {
    if (!auth.currentUser) return;
    
    const confirm = window.confirm('⚠ ATENÇÃO: Deseja realmente esvaziar seu banco de dados? Isso apagará permanentemente todos os logs e campanhas agendadas.');
    if (!confirm) return;

    setClearingDb(true);
    try {
      const uid = auth.currentUser.uid;
      
      // Clear Logs
      const logsRef = collection(db, 'users', uid, 'logs');
      const logsSnap = await getDocs(logsRef);
      const deleteLogsPromises = logsSnap.docs.map(d => deleteDoc(d.ref));
      
      // Clear Campaigns
      const campaignsRef = collection(db, 'users', uid, 'campaigns');
      const campaignsSnap = await getDocs(campaignsRef);
      const deleteCampaignsPromises = campaignsSnap.docs.map(d => deleteDoc(d.ref));

      await Promise.all([...deleteLogsPromises, ...deleteCampaignsPromises]);
      
      alert('Banco de dados limpo com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao limpar banco de dados.');
    } finally {
      setClearingDb(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-6">
            <img 
              src={auth.currentUser?.photoURL || ''} 
              className="w-20 h-20 rounded-2xl border-4 border-slate-100"
              alt="profile"
            />
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{auth.currentUser?.displayName}</h2>
              <p className="text-slate-500">{auth.currentUser?.email}</p>
              <div className="mt-2 flex gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full uppercase">Plano ProAtivo</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase">Acesso Beta</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-12">
          {/* FB Session Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Facebook className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-800">Conectar conta Facebook</h3>
              </div>
              <span className={fbSession ? "text-emerald-500 text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded uppercase" : "text-red-500 text-[10px] font-bold bg-red-50 px-2 py-1 rounded uppercase"}>
                {fbSession ? "Conectado" : "Não conectado"}
              </span>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-100 mb-8 border border-blue-400">
              <div className="flex flex-col md:flex-row items-center gap-6 w-full mb-8">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md">
                  <Zap className="w-10 h-10 text-white fill-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-xl font-bold mb-1">Conexão Ultra-Rápida (Sem Erros)</h4>
                  <p className="text-blue-100 text-sm">Escolha o método mais fácil para você abaixo.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Method A: The Infallible Prompt */}
                <div className="bg-amber-500 border-2 border-white p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 bg-white/20 text-[10px] font-black uppercase italic">Dica do Especialista</div>
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-white text-amber-600 flex items-center justify-center font-black shrink-0 shadow-lg text-lg">A</div>
                    <div className="flex-1">
                      <h5 className="font-black text-lg mb-2 leading-tight uppercase italic">Método Infalível (Para quem tem pressa)</h5>
                      <p className="text-xs mb-4 text-amber-50 leading-relaxed">
                        1. Vá no seu <b>Facebook</b>.<br/>
                        2. Aperte <b>F12</b>, clique em <b>Console</b>.<br/>
                        3. Digite <code>allow pasting</code> e aperte Enter.<br/>
                        4. Copie o código abaixo, cole lá e aperte <b>Enter</b>:
                      </p>
                      
                      <div className="flex gap-2 bg-black/40 p-3 rounded-xl border border-white/20">
                        <code className="text-[11px] font-mono text-amber-200 flex-1 break-all">
                          prompt("🚀 SUCESSO! COPIE TUDO ABAIXO:", document.cookie)
                        </code>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText('prompt("🚀 SUCESSO! COPIE TUDO ABAIXO:", document.cookie)');
                            alert("Código de emergência copiado! Vá no Facebook, cole no console e aperte Enter.");
                          }}
                          className="bg-white text-amber-600 px-4 py-2 rounded-lg font-bold text-xs hover:bg-amber-50 transition-colors shrink-0 shadow-lg"
                        >
                          COPIAR CÓDIGO
                        </button>
                      </div>
                      <p className="text-[10px] mt-3 text-amber-100 italic">
                        * Isso abrirá uma janelinha BRANCA no Facebook com os dados. Basta dar Ctrl+C neles e colar aqui.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Method B: Bookmarklet */}
                <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center font-black shrink-0 text-lg">B</div>
                    <div className="flex-1">
                      <h5 className="font-bold mb-1">BOTÃO MÁGICO (Favoritos)</h5>
                      <p className="text-xs text-blue-100 mb-4">Arraste para os favoritos e clique quando estiver no Facebook.</p>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <a 
                          href="javascript:(function(){const c=document.cookie;if(!c){alert('❌ Erro: Logue no Facebook primeiro!');return;}prompt('SUCESSO! Copie tudo abaixo (Ctrl+C):', c);})();"
                          className="inline-flex items-center gap-3 px-6 py-4 bg-white text-blue-600 font-black rounded-2xl shadow-xl hover:scale-105 transition-transform cursor-move border-b-4 border-slate-200"
                          onClick={(e) => {
                            e.preventDefault();
                            alert('⚠️ ATENÇÃO: Você deve arrastar este botão para a sua barra de favoritos (perto da estrela do Chrome). Se não souber fazer, use o Método A acima que é mais simples!');
                          }}
                        >
                          <Zap className="w-5 h-5 fill-current" />
                          ARRASTE PARA FAVORITOS
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-slate-600">
                <AlertCircle className="w-5 h-5" />
                <p className="text-xs font-bold uppercase">Painel de Conexão:</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cole abaixo o resultado (os cookies) que apareceram na janela do Facebook.
              </p>
            </div>

            <div>
              <textarea 
                value={fbSession}
                onChange={(e) => setFbSession(e.target.value)}
                placeholder="Cole o código aqui..."
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs shadow-inner"
              />
            </div>
            <button 
              onClick={handleUpdateSession}
              disabled={loading}
              className="w-full md:w-auto px-10 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Processando...' : 'Salvar e Ativar Automação'}
            </button>
          </section>

          {/* Database Management Section */}
          <section className="pt-8 border-t border-slate-100 space-y-6">
            <div className="flex items-center gap-2">
              <Database className="w-6 h-6 text-slate-400" />
              <h3 className="text-lg font-bold text-slate-800">Manutenção de Dados</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-red-500">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 uppercase italic">Limpeza Total</h4>
                    <p className="text-xs text-slate-500 font-medium">Apague relatórios e campanhas antigas para manter seu sistema rápido.</p>
                  </div>
                </div>
                <button 
                  onClick={clearUserData}
                  disabled={clearingDb}
                  className="w-full py-3 bg-white border-2 border-red-100 text-red-500 font-black rounded-xl hover:bg-red-50 hover:border-red-200 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {clearingDb ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Limpando...
                    </>
                  ) : (
                    'Esvaziar Banco de Dados'
                  )}
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 flex flex-col justify-center">
                <p className="text-[10px] text-slate-400 font-black uppercase mb-2 tracking-widest text-center">Status do Espaço</p>
                <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-slate-100">
                  <div className="bg-blue-600 h-full w-[15%]" />
                </div>
                <p className="text-center mt-3 text-xs font-black italic text-slate-800 uppercase">Uso Otimizado</p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <button className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all text-left group">
              <div className="p-3 bg-white rounded-xl shadow-sm text-pink-600 group-hover:scale-110 transition-transform">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Insta Turbo</p>
                <p className="text-slate-500 text-xs text leading-tight">Configurações de automação para Instagram</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all text-left group">
              <div className="p-3 bg-white rounded-xl shadow-sm text-slate-600 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Segurança</p>
                <p className="text-slate-500 text-xs leading-tight">Privacidade e logs de conexão</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
