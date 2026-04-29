// Carrega o token salvo automaticamente
chrome.storage.local.get(['turboToken'], (res) => {
  if (res.turboToken) document.getElementById('token').value = res.turboToken;
});

document.getElementById('btn').addEventListener('click', async () => {
  const tokenInput = document.getElementById('token');
  const token = tokenInput.value.trim();
  const statusEl = document.getElementById('status');
  const btn = document.getElementById('btn');
  
  if (!token) {
    statusEl.className = "status error";
    statusEl.innerText = "❌ ERRO: INSIRA O TOKEN!";
    return;
  }

  statusEl.className = "status loading";
  statusEl.innerText = "⏳ SINCRONIZANDO...";
  btn.disabled = true;

  // Salva o token para a próxima vez
  chrome.storage.local.set({ turboToken: token });

  // Envia comando para o background script sincronizar
  chrome.runtime.sendMessage({ action: "sync_now", userId: token }, (response) => {
    btn.disabled = false;
    
    if (response && response.success) {
      statusEl.className = "status success";
      statusEl.innerText = "✅ CONECTADO COM SUCESSO!";
      setTimeout(() => {
        alert("SocialTurbo Conectado! Você já pode usar o painel.");
        window.close();
      }, 500);
    } else {
      statusEl.className = "status error";
      statusEl.innerText = "❌ ERRO AO CONECTAR";
      alert("Aviso: " + (response ? response.error : "Erro desconhecido."));
    }
  });
});
