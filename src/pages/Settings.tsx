import { useState, useEffect } from 'react';
import { 
  User, 
  Key, 
  Shield, 
  Bell, 
  Save,
  Copy,
  Facebook,
  AlertCircle,
  Instagram,
  Zap,
  Trash2,
  Database,
  CheckCircle2,
  Loader2,
  Monitor,
  DownloadCloud,
  Terminal
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

  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (profile) {
      setFbSession(profile.fbSession || '');
    }

    const handleExtResponse = (event: MessageEvent) => {
      if (event.source !== window || event.data.type !== "SOCIAL_TURBO_EXT_RESPONSE") return;
      
      const response = event.data.detail;
      setSyncing(false);
      
      if (response && response.success) {
        alert("✅ CONECTADO!\nA extensão sincronizou seus dados com o servidor com sucesso.");
      } else {
        const errorMsg = response?.error || "Verifique se está logado no Facebook no seu navegador.";
        alert("❌ ERRO NA SINCRONIZAÇÃO:\n" + errorMsg);
      }
    };

    window.addEventListener("message", handleExtResponse);
    return () => window.removeEventListener("message", handleExtResponse);
  }, [profile]);

  // Timeout para o botão de sincronizar não ficar travado
  useEffect(() => {
    let timer: any;
    if (syncing) {
      timer = setTimeout(() => {
        setSyncing(false);
        alert("⚠️ TEMPO ESGOTADO:\nA extensão não respondeu. Certifique-se de que a extensão oficial SocialTurbo Pro está instalada e ativa.");
      }, 15000); // 15 segundos de timeout
    }
    return () => clearTimeout(timer);
  }, [syncing]);

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
            </div>
              
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-[2.5rem]">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/2 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 rounded-2xl">
                      <Monitor className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">Extensão SocialTurbo Pro</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    "O nosso sistema foi reconstruído para ser idêntico aos melhores do mercado. Agora, a conexão é 100% via código nativo do navegador, garantindo mais segurança e velocidade."
                  </p>

                  <div className="space-y-6">
                    {/* Botão de Sincronização Inteligente */}
                    <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-2xl shadow-indigo-200 border-4 border-indigo-500/50 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap className="w-24 h-24" />
                      </div>
                      
                      <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                          <Zap className="w-8 h-8 fill-white text-white" />
                        </div>
                        <div>
                          <h4 className="font-black text-xl leading-tight italic uppercase tracking-tighter">SINCRONIZAÇÃO INTELIGENTE</h4>
                          <p className="text-indigo-100 text-[11px] font-medium opacity-80 uppercase tracking-widest">Conexão em um clique detectada</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setSyncing(true);
                          window.postMessage({ 
                            type: "SOCIAL_TURBO_EXT_SYNC", 
                            detail: { userId: profile?.uid } 
                          }, "*");
                        }}
                        disabled={syncing}
                        className="w-full bg-white text-indigo-600 font-black py-5 rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest text-base shadow-xl active:scale-95 relative z-10 disabled:opacity-50"
                      >
                        {syncing ? 'SINCRONIZANDO...' : 'SINCRONIZAR AGORA 🚀'}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                        <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">Passo 1</p>
                        <p className="text-[9px] text-slate-500 font-bold leading-tight">Instale a Extensão</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                        <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">Passo 2</p>
                        <p className="text-[9px] text-slate-500 font-bold leading-tight">Logue no FB</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                        <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">Passo 3</p>
                        <p className="text-[9px] text-slate-500 font-bold leading-tight">Clique Acima</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-1/2 bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
                  <h5 className="font-black text-lg mb-6 italic uppercase tracking-tighter text-indigo-400">Dados da Sua Extensão</h5>
                  
                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Seu Token de Conexão</p>
                      <div className="flex gap-2">
                        <code className="flex-1 bg-black/40 p-3 rounded-xl border border-white/5 font-mono text-xs text-indigo-400 font-bold overflow-hidden text-ellipsis">
                          {profile?.uid || 'CARREGANDO...'}
                        </code>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(profile?.uid || '');
                            alert("Token copiado!");
                          }}
                          className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
                      <p className="text-[11px] text-indigo-200 font-medium leading-relaxed">
                        Se o botão de sincronização automática falhar, você pode abrir o popup da extensão e colar o token acima manualmente para forçar a conexão.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <a 
                  href={LINK_DOWNLOAD_EXTENSAO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full max-w-md py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all no-underline uppercase tracking-widest text-sm"
                >
                  <DownloadCloud className="w-5 h-5" />
                  BAIXAR PASTA DA EXTENSÃO (ARQUIVOS)
                </a>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 space-y-6">
              <div className="flex items-center gap-2 text-slate-800">
                <Terminal className="w-6 h-6 text-indigo-600" />
                <h4 className="text-lg font-black uppercase italic tracking-tighter">Conteúdo da Extensão (Copie estes arquivos)</h4>
              </div>
              <p className="text-xs text-slate-500 font-medium italic">Se você não conseguir baixar a pasta pelo link acima, crie uma pasta no seu computador e salve estes 5 arquivos dentro dela. Depois, carregue essa pasta no Chrome em "Modo do Desenvolvedor".</p>
                <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <summary className="p-4 cursor-pointer font-bold text-sm text-slate-700 flex justify-between items-center bg-slate-50/50">
                    1. manifest.json
                    <span className="text-[10px] bg-slate-200 px-2 py-1 rounded">Clique para ver</span>
                  </summary>
                  <pre className="p-4 text-[10px] bg-slate-900 text-indigo-400 overflow-x-auto font-mono">
{`{
  "manifest_version": 3,
  "name": "SocialTurbo Pro",
  "version": "1.0",
  "permissions": ["cookies", "activeTab", "storage"],
  "host_permissions": [
    "*://*.facebook.com/*",
    "https://ais-dev-zixasjyas3up27harioref-10471001554.us-west2.run.app/*",
    "*://\${window.location.host}/*"
  ],
  "action": { "default_popup": "popup.html" },
  "background": { "service_worker": "bg.js" },
  "content_scripts": [
    {
      "matches": ["*://\${window.location.host}/*"],
      "js": ["content.js"]
    }
  ]
}`}
                  </pre>
                </details>

                <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <summary className="p-4 cursor-pointer font-bold text-sm text-slate-700 flex justify-between items-center bg-slate-50/50">
                    2. popup.html
                    <span className="text-[10px] bg-slate-200 px-2 py-1 rounded">Clique para ver</span>
                  </summary>
                  <pre className="p-4 text-[10px] bg-slate-900 text-indigo-400 overflow-x-auto font-mono">
{`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { width: 300px; padding: 15px; font-family: sans-serif; background: #0f172a; color: white; }
    .card { background: #1e293b; border-radius: 12px; padding: 15px; border: 1px solid #334155; }
    h2 { font-size: 14px; color: #6366f1; margin: 0 0 10px 0; }
    button { width: 100%; background: #4f46e5; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <h2>SocialTurbo Pro</h2>
    <input type="text" id="token" style="width:100%; margin-bottom:10px; padding:8px; border-radius:5px; border:none;" placeholder="Token...">
    <button id="btn">CONECTAR AGORA</button>
    <div id="status" style="margin-top:10px; font-size:11px; text-align:center;"></div>
  </div>
  <script src="popup.js"></script>
</body>
</html>`}
                  </pre>
                </details>

                <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <summary className="p-4 cursor-pointer font-bold text-sm text-slate-700 flex justify-between items-center bg-slate-50/50">
                    3. popup.js
                    <span className="text-[10px] bg-slate-200 px-2 py-1 rounded">Clique para ver</span>
                  </summary>
                  <pre className="p-4 text-[10px] bg-slate-900 text-indigo-400 overflow-x-auto font-mono">
{`document.getElementById('btn').addEventListener('click', () => {
  const token = document.getElementById('token').value;
  chrome.runtime.sendMessage({ action: "sync_now", userId: token }, (res) => {
    document.getElementById('status').innerText = res.success ? "✅ OK!" : "❌ ERRO";
  });
});`}
                  </pre>
                </details>

                <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <summary className="p-4 cursor-pointer font-bold text-sm text-slate-700 flex justify-between items-center bg-slate-50/50">
                    4. content.js
                    <span className="text-[10px] bg-slate-200 px-2 py-1 rounded">Clique para ver</span>
                  </summary>
                  <pre className="p-4 text-[10px] bg-slate-900 text-indigo-400 overflow-x-auto font-mono">
{`window.addEventListener("message", (event) => {
  if (event.source !== window || event.data.type !== "SOCIAL_TURBO_EXT_SYNC") return;
  const { userId } = event.data.detail;
  chrome.runtime.sendMessage({ 
    action: "sync_now", 
    userId, 
    origin: window.location.origin 
  }, (response) => {
    window.postMessage({ type: "SOCIAL_TURBO_EXT_RESPONSE", detail: response }, "*");
  });
});`}
                  </pre>
                </details>

                <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <summary className="p-4 cursor-pointer font-bold text-sm text-slate-700 flex justify-between items-center bg-slate-50/50">
                    5. bg.js
                    <span className="text-[10px] bg-slate-200 px-2 py-1 rounded">Clique para ver</span>
                  </summary>
                  <pre className="p-4 text-[10px] bg-slate-900 text-indigo-400 overflow-x-auto font-mono">
{`const DEFAULT_URL = "https://ais-dev-zixasjyas3up27harioref-10471001554.us-west2.run.app";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sync_now") {
    const url = (request.origin || DEFAULT_URL) + "/api/sync-extension";
    chrome.cookies.getAll({ domain: "facebook.com" }, async (cookies) => {
      const cookieStr = cookies.map(c => \`\${c.name}=\${c.value}\`).join('; ');
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: request.userId, cookies: cookieStr })
      });
      const data = await res.json();
      sendResponse(data);
    });
    return true;
  }
});`}
                  </pre>
                </details>
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
