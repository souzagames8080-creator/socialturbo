import { useState, useEffect } from 'react';
import { 
  User, 
  Key, 
  Shield, 
  Save,
  Copy,
  Facebook,
  AlertCircle,
  Zap,
  Trash2,
  Database,
  Loader2,
  Monitor,
  DownloadCloud,
  Terminal
} from 'lucide-react';
import { auth, db, doc, updateDoc, collection, getDocs, deleteDoc } from '../lib/firebase';
import { UserProfile } from '../types';
import { useOutletContext } from 'react-router-dom';

export default function Settings() {
  const { profile } = useOutletContext<{ profile: UserProfile }>();
  const [fbSession, setFbSession] = useState('');
  const [loading, setLoading] = useState(false);
  const [clearingDb, setClearingDb] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // COLE SEU LINK DO GOOGLE DRIVE AQUI DENTRO DAS ASPAS:
  const LINK_DOWNLOAD_EXTENSAO = "https://drive.google.com/file/d/1krIA6Hk0qA80IFgye6dm3-uCbNogNGtz/view?usp=sharing";

  useEffect(() => {
    if (profile) {
      setFbSession(profile.fbSession || '');
    }

    const handleExtResponse = (event: MessageEvent) => {
      if (event.source !== window || event.data.type !== "SOCIAL_TURBO_EXT_RESPONSE") return;
      
      const response = event.data.detail;
      setSyncing(false);
      
      if (response && response.success) {
        setFbSession('connected_from_ext');
        alert("✅ CONECTADO!\nA extensão sincronizou seus dados com o servidor com sucesso.");
      } else {
        const errorMsg = response?.error || "Verifique se está logado no Facebook no seu navegador.";
        alert("❌ ERRO NA SINCRONIZAÇÃO:\n" + errorMsg);
      }
    };

    window.addEventListener("message", handleExtResponse);
    return () => window.removeEventListener("message", handleExtResponse);
  }, [profile]);

  useEffect(() => {
    let timer: any;
    if (syncing) {
      timer = setTimeout(() => {
        setSyncing(false);
      }, 15000); 
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
      alert('Dados salvos com sucesso!');
    } catch (err) {
      alert('Erro ao salvar dados');
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
      const logsRef = collection(db, 'users', uid, 'logs');
      const logsSnap = await getDocs(logsRef);
      const deleteLogsPromises = logsSnap.docs.map(d => deleteDoc(d.ref));
      
      const campaignsRef = collection(db, 'users', uid, 'campaigns');
      const campaignsSnap = await getDocs(campaignsRef);
      const deleteCampaignsPromises = campaignsSnap.docs.map(d => deleteDoc(d.ref));

      await Promise.all([...deleteLogsPromises, ...deleteCampaignsPromises]);
      alert('Banco de dados limpo com sucesso!');
    } catch (err) {
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
              src={auth.currentUser?.photoURL || 'https://ui-avatars.com/api/?name=' + auth.currentUser?.displayName} 
              className="w-20 h-20 rounded-2xl border-4 border-slate-100"
              alt="profile"
            />
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{auth.currentUser?.displayName}</h2>
              <p className="text-slate-500">{auth.currentUser?.email}</p>
              <div className="mt-2 flex gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full uppercase">Plano ProAtivo</span>
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
              <span className={fbSession ? "text-emerald-500 text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded uppercase tracking-wider animate-pulse" : "text-red-500 text-[10px] font-bold bg-red-50 px-2 py-1 rounded uppercase tracking-wider"}>
                {fbSession ? "✅ Conectado" : "❌ Não conectado"}
              </span>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-[2.5rem]">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/2 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 rounded-2xl">
                      <Monitor className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">Extensão SocialTurbo Pro</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                    "Agora com Login Inteligente! A extensão detecta seu acesso automaticamente assim que você loga no painel."
                  </p>

                  <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-2xl shadow-indigo-200 border-4 border-indigo-500/50 relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                        <Zap className="w-8 h-8 fill-white text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-xl leading-tight italic uppercase tracking-tighter">SINCRONIZAÇÃO</h4>
                        <p className="text-indigo-100 text-[11px] font-medium opacity-80 uppercase tracking-widest">Identidade Automática</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setSyncing(true);
                        window.postMessage({ type: "SOCIAL_TURBO_EXT_SYNC", detail: { userId: profile?.uid } }, "*");
                      }}
                      disabled={syncing}
                      className="w-full bg-white text-indigo-600 font-black py-5 rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest text-base shadow-xl active:scale-95 disabled:opacity-50"
                    >
                      {syncing ? 'Sincronizando...' : 'CONECTAR EXTENSÃO AGORA 🚀'}
                    </button>
                  </div>
                </div>

                <div className="w-full md:w-1/2 bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl border border-slate-800">
                  <h5 className="font-black text-lg mb-6 italic uppercase tracking-tighter text-indigo-400">Como usar a Extensão?</h5>
                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Entrar com Google</p>
                      <p className="text-[11px] text-indigo-100/70">Abra a extensão e clique em "Entrar com Google" ou simplesmente entre no site e ela vai te reconhecer.</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Token de Backup</p>
                      <div className="flex gap-2">
                        <code className="flex-1 bg-black/40 p-3 rounded-xl border border-white/5 font-mono text-[10px] text-indigo-400 font-bold overflow-hidden text-ellipsis">
                          {profile?.uid || '...'}
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
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <a 
                  href={LINK_DOWNLOAD_EXTENSAO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full max-w-md py-4 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl hover:scale-[1.01] active:scale-95 transition-all no-underline uppercase tracking-widest text-xs"
                >
                  <DownloadCloud className="w-5 h-5" />
                  BAIXAR VERSÃO OFICIAL (.ZIP)
                </a>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 space-y-6">
              <div className="flex items-center gap-2 text-slate-800">
                <Terminal className="w-6 h-6 text-indigo-600" />
                <h4 className="text-lg font-black uppercase italic tracking-tighter">CÓDIGOS PARA CRIAÇÃO MANUAL</h4>
              </div>
              <p className="text-xs text-slate-500 font-medium italic">Clique em copiar para cada arquivo abaixo se estiver criando a extensão manualmente:</p>
              
              <div className="space-y-6">
                {[
                  {
                    name: '1. manifest.json',
                    content: `{
  "manifest_version": 3,
  "name": "SocialTurbo Pro",
  "version": "1.1",
  "description": "Sincronização e acesso rápido ao SocialTurbo Pro",
  "background": { "service_worker": "bg.js" },
  "action": { "default_popup": "popup.html" },
  "permissions": ["cookies", "storage", "tabs"],
  "host_permissions": [
    "*://*.facebook.com/*", 
    "*://*.whatsapp.com/*",
    "https://*.run.app/*", 
    "*://socialturbo.minhadivulgacao.com.br/*"
  ],
  "content_scripts": [{ 
    "matches": ["*://socialturbo.minhadivulgacao.com.br/*", "https://*.run.app/*", "https://*.whatsapp.com/*"], 
    "js": ["content.js"] 
  }]
}`
                  },
                  {
                    name: '2. popup.html',
                    content: `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <style>
    body { width: 280px; padding: 0; margin: 0; font-family: sans-serif; background: #0f172a; color: white; }
    .container { padding: 20px; }
    .header h1 { font-size: 16px; color: #6366f1; text-transform: uppercase; font-style: italic; font-weight: 900; text-align: center; margin-bottom: 15px; }
    #view-login, #view-ready { display: none; }
    input { width: 100%; padding: 12px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: white; box-sizing: border-box; }
    .btn-primary { width: 100%; padding: 12px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 900; cursor: pointer; text-transform: uppercase; transition: 0.2s; }
    .btn-primary:hover { transform: translateY(-1px); background: #4338ca; }
    .user-info { background: #1e293b; padding: 12px; border-radius: 8px; margin-bottom: 15px; font-size: 11px; border: 1px solid #334155; }
    .status { text-align: center; font-size: 10px; margin-top: 10px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>SocialTurbo Pro</h1></div>
    <div id="view-login">
      <button id="btn-google" class="btn-primary" style="background:white; color:#0f172a; margin-bottom:15px; display:flex; align-items:center; justify-content:center; gap:10px;">
        <img src="https://www.google.com/favicon.ico" style="width:16px;">ENTRAR COM GOOGLE
      </button>
      <div style="text-align:center; font-size:9px; color:#475569; margin-bottom:10px;">OU DIGITE SEU TOKEN</div>
      <input type="text" id="token-input" placeholder="seu@email.com">
      <button id="btn-save" class="btn-primary" style="background:transparent; border:1px solid #334155;">CONFIGURAR</button>
    </div>
    <div id="view-ready">
      <div class="user-info">
        <div style="color:#64748b; margin-bottom:4px;">Logado como:</div>
        <div id="display-user" style="color:#10b981; font-weight:800;">-</div>
      </div>
      <button id="btn-open" class="btn-primary" style="background:#10b981">ABRIR PAINEL</button>
      <div id="ready-status" class="status"></div>
    </div>
  </div>
  <script src="popup.js"></script>
</body>
</html>`
                  },
                  {
                    name: '3. popup.js',
                    content: `const URL = "${window.location.origin}";
function showView(v) { 
  document.getElementById('view-login').style.display = v === 'login' ? 'block' : 'none';
  document.getElementById('view-ready').style.display = v === 'ready' ? 'block' : 'none';
}
chrome.storage.local.get(['turboToken'], (res) => {
  if (res.turboToken) { document.getElementById('display-user').innerText = res.turboToken; showView('ready'); sync(res.turboToken); }
  else { showView('login'); }
});
document.getElementById('btn-google').addEventListener('click', () => { chrome.tabs.create({ url: URL }); window.close(); });
document.getElementById('btn-save').addEventListener('click', () => {
  const t = document.getElementById('token-input').value.trim();
  if(t) chrome.storage.local.set({ turboToken: t }, () => { location.reload(); });
});
document.getElementById('btn-open').addEventListener('click', () => { chrome.tabs.create({ url: URL }); });
async function sync(t) {
  const s = document.getElementById('ready-status');
  if(s) s.innerText = "⏳ Sincronizando...";
  chrome.runtime.sendMessage({ action: "sync_now", userId: t }, (res) => {
    if(s) {
       s.innerText = res?.success ? "✅ CONECTADO" : "❌ FACEBOOK DESLOGADO";
       s.style.color = res?.success ? "#10b981" : "#ef4444";
    }
  });
}`
                  },
                  {
                    name: '4. bg.js',
                    content: `const URL = "${window.location.origin}";
chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.action === "sync_now") {
    // Tenta capturar cookies de forma mais abrangente
    chrome.cookies.getAll({}, async (c) => {
      const fbCookies = c.filter(x => x.domain.includes("facebook.com"));
      const waCookies = c.filter(x => x.domain.includes("whatsapp.com"));
      const s = fbCookies.map(x => x.name + "=" + x.value).join("; ");
      const wa_s = waCookies.map(x => x.name + "=" + x.value).join("; ");
      
      if(!s.includes("c_user")) {
        return res({ success: false, error: "Abra o Facebook.com em uma aba e faça login primeiro!" });
      }

      try {
        // Tenta capturar grupos (Scraper Metus Style)
        const groupsResp = await fetch("https://www.facebook.com/groups/feed/", {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
        });
        const html = await groupsResp.text();
        const foundGroups = [];
        
        // Regex para capturar IDs e nomes (formato aproximado no JSON interno do FB)
        const groupPattern = /"id":"(\d+)","name":"(.*?)"/g;
        let m;
        const seen = new Set();
        
        while ((m = groupPattern.exec(html)) !== null) {
          const id = m[1];
          const name = m[2].replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => String.fromCharCode(parseInt(grp, 16)));
          if (!seen.has(id)) {
            foundGroups.push({ fbGroupId: id, name: name });
            seen.add(id);
          }
        }

        // Envia para o servidor
        const r = await fetch(URL + "/api/sync-extension", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            userId: req.userId, 
            cookies: s,
            wa_cookies: wa_s,
            groups: foundGroups,
            supportsMedia: true,
            platform: "all"
          })
        });
        const data = await r.json();
        res(data);
      } catch(e) { 
        res({ success: false, error: "Erro na rede ao capturar grupos." }); 
      }
    });
    return true;
  }
  if (req.action === "save_token") {
    chrome.storage.local.set({ turboToken: req.userId }, () => {
       res({ success: true });
    });
    return true;
  }
});`
                  },
                  {
                    name: '5. content.js',
                    content: `window.addEventListener("message", (event) => {
  if (event.source !== window || !event.data.type) return;
  if (event.data.type === "SOCIAL_TURBO_EXT_SYNC") {
    const userId = event.data.detail?.userId;
    if (userId) {
      chrome.runtime.sendMessage({ action: "save_token", userId: userId }, () => {
        window.postMessage({ type: "SOCIAL_TURBO_EXT_RESPONSE", detail: { success: true } }, "*");
      });
    }
  }
});`
                  }
                ].map((file, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 bg-slate-50/50 flex items-center justify-between border-b border-slate-100">
                      <span className="font-bold text-sm text-slate-700">{file.name}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(file.content);
                          alert('Código de ' + file.name + ' copiado!');
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                      >
                        <Copy className="w-3 h-3" />
                        COPIAR
                      </button>
                    </div>
                    <pre className="p-4 text-[10px] bg-slate-800 text-indigo-300 overflow-x-auto font-mono leading-relaxed">
                      {file.content}
                    </pre>
                  </div>
                ))}
              </div>
              
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase py-4 border-t border-slate-200">
                🚀 Após instalar, clique no ícone da extensão no Chrome para começar.
              </p>
            </div>
          </section>

          {/* Database Management Section */}
          <section className="pt-8 border-t border-slate-100 space-y-6">
            <div className="flex items-center gap-2">
              <Database className="w-6 h-6 text-slate-400" />
              <h3 className="text-lg font-bold text-slate-800">Manutenção de Banco de Dados</h3>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <h4 className="font-black text-slate-800 uppercase italic">Limpeza Total</h4>
                <p className="text-xs text-slate-500 font-medium">Apague relatórios e campanhas antigas para manter seu sistema rápido.</p>
              </div>
              <button 
                onClick={clearUserData}
                disabled={clearingDb}
                className="px-8 py-3 bg-white border-2 border-red-100 text-red-500 font-black rounded-xl hover:bg-red-50 hover:border-red-200 transition-all text-xs uppercase tracking-widest flex items-center gap-2"
              >
                {clearingDb ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Esvaziar Banco
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
