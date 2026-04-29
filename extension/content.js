// Script que roda no Facebook para extrair o Access Token e enviar para o Painel
console.log("🚀 SocialTurbo Extension Ativa");

function findAccessToken() {
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    const match = script.textContent?.match(/\"accessToken\":\"(EAAAA[^\"]+)\"/);
    if (match) return match[1];
  }
  return null;
}

function findName() {
  return document.title.replace(/\s*\|\s*Facebook/i, '') || "Usuário Facebook";
}

// Quando o usuário clica no ícone da extensão ou quando a página carrega
const token = findAccessToken();
if (token) {
  const data = {
    source: 'socialturbo_extension',
    token: token,
    name: findName(),
    uid: document.cookie.match(/c_user=(\d+)/)?.[1]
  };
  
  // Envia para o painel (ajustado para aceitar localhost e o domínio do app)
  window.postMessage(data, "*");
  chrome.runtime.sendMessage(data);
}
