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
  CheckCircle2
} from 'lucide-react';
import { auth, db, doc, getDoc, updateDoc } from '../lib/firebase';
import { UserProfile } from '../types';

import { useOutletContext } from 'react-router-dom';

export default function Settings() {
  const { profile } = useOutletContext<{ profile: UserProfile }>();
  const [fbSession, setFbSession] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFbSession(profile.fbSession || '');
    }

    // Listener para o sucesso do login via popup
    const handleMessage = (event: MessageEvent) => {
      // Validar origem se necessário, mas para postMessage entre janelas do mesmo app é seguro
      if (event.data?.type === 'FB_AUTH_SUCCESS' && event.data?.token) {
        setFbSession(event.data.token);
        updateDocInDB(event.data.token);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [profile]);

  const updateDocInDB = async (token: string) => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        fbSession: token,
        updatedAt: new Date()
      });
      alert('SocialTurbo: Conta conectada via Modo Automático!');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const startAutoAuth = async () => {
    try {
      const res = await fetch('/api/auth/facebook/url');
      const data = await res.json();
      if (data.url) {
        window.open(data.url, 'fb_auth', 'width=600,height=700');
      } else {
        alert(data.error || 'Erro ao iniciar conexão automática. Verifique as variáveis de ambiente.');
      }
    } catch (err) {
      alert('Erro na comunicação com o servidor.');
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

        <div className="p-8 space-y-8">
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
            <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-100 flex flex-col md:flex-row items-center gap-6 mb-8 border border-blue-400">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md">
                <Zap className="w-10 h-10 text-white fill-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-xl font-bold mb-1">Acesso Turbo (1-Clique)</h4>
                <p className="text-blue-100 text-sm">Seu cliente só precisa clicar aqui. O sistema reconhece o Facebook logado no navegador dele automaticamente.</p>
              </div>
              <button 
                onClick={startAutoAuth}
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-lg hover:bg-blue-50 transition-all flex items-center gap-3 whitespace-nowrap"
              >
                <Facebook className="fill-blue-600 w-5 h-5" />
                Conectar Agora
              </button>
            </div>

            {profile?.role === 'admin' && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-xs font-bold uppercase">Nota para o Revendedor (Você):</p>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Para que o botão acima funcione sem erros, você deve inserir sua <b>App Key</b> do Facebook nas configurações do servidor. Uma vez configurado, seu cliente nunca mais verá códigos ou tokens. É ligar e usar!
                </p>
              </div>
            )}
            <div>
              <textarea 
                value={fbSession}
                onChange={(e) => setFbSession(e.target.value)}
                placeholder="Cole aqui seus Cookies (JSON) ou seu Token de Acesso (EAAA...)"
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-mono text-xs shadow-inner"
              />
            </div>
            <button 
              onClick={handleUpdateSession}
              disabled={loading}
              className="w-full md:w-auto px-10 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Processando...' : 'Salvar e Conectar Facebook'}
            </button>
          </section>

          <div className="border-t border-slate-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all text-left">
              <div className="p-3 bg-white rounded-xl shadow-sm text-pink-600">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Insta Turbo</p>
                <p className="text-slate-500 text-xs">Conectar contas do Instagram</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all text-left">
              <div className="p-3 bg-white rounded-xl shadow-sm text-slate-600">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Proteção e Segurança</p>
                <p className="text-slate-500 text-xs">Gerenciar sua conta e senha</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
