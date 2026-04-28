document.getElementById('btnConnect').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  statusEl.innerText = "Conectando...";
  statusEl.className = "";

  try {
    // Pegar cookies do Facebook
    const cookies = await chrome.cookies.getAll({ domain: "facebook.com" });
    
    if (!cookies || cookies.length === 0) {
      statusEl.innerText = "❌ Logue no Facebook primeiro!";
      statusEl.className = "error";
      return;
    }

    // Formatar string de cookies
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    // Copiar para o clipboard
    const el = document.createElement('textarea');
    el.value = cookieString;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    statusEl.innerText = "✅ ACESSO COPIADO!";
    statusEl.className = "success";
    
    setTimeout(() => {
      alert("✅ ACESSO COPIADO!\n\nAgora volte no SocialTurbo e cole os dados no campo de configuração.");
    }, 100);

  } catch (error) {
    console.error(error);
    statusEl.innerText = "❌ Erro ao capturar dados.";
    statusEl.className = "error";
  }
});
