const DEFAULT_URL = "https://socialturbo.minhadivulgacao.com.br";

function showView(viewId) {
  document.getElementById('view-login').style.display = viewId === 'login' ? 'block' : 'none';
  document.getElementById('view-ready').style.display = viewId === 'ready' ? 'block' : 'none';
}

// Inicialização
chrome.storage.local.get(['turboToken'], (res) => {
  if (res.turboToken) {
    document.getElementById('display-user').innerText = res.turboToken;
    showView('ready');
    handleFinalSync(res.turboToken);
  } else {
    showView('login');
  }
});

// Botão Google (Abre o site)
document.getElementById('btn-google').addEventListener('click', () => {
  chrome.tabs.create({ url: DEFAULT_URL });
  window.close();
});

// Ação de Salvar Inicial
document.getElementById('btn-save').addEventListener('click', () => {
  const token = document.getElementById('token-input').value.trim();
  if (!token) return;
  
  chrome.storage.local.set({ turboToken: token }, () => {
    document.getElementById('display-user').innerText = token;
    showView('ready');
    handleFinalSync(token);
  });
});

// Botão Abrir Painel
document.getElementById('btn-open').addEventListener('click', () => {
  chrome.storage.local.get(['turboToken'], (res) => {
    handleFinalSync(res.turboToken);
  });
});

// Trocar conta
document.getElementById('btn-change').addEventListener('click', () => {
  chrome.storage.local.remove(['turboToken'], () => {
    showView('login');
  });
});

async function handleFinalSync(token) {
  const status = document.getElementById('ready-status') || document.getElementById('login-status');
  status.innerText = "⏳ Sincronizando...";
  status.style.color = "#6366f1";

  chrome.runtime.sendMessage({ action: "sync_now", userId: token }, (res) => {
    if (res && res.success) {
      status.innerText = "✅ Sincronizado! Abrindo...";
      status.style.color = "#10b981";
      
      setTimeout(() => {
        chrome.tabs.create({ url: DEFAULT_URL });
        window.close();
      }, 800);
    } else {
      status.innerText = "❌ Erro: " + (res?.error || "Acesse o Facebook!");
      status.style.color = "#ef4444";
    }
  });
}
