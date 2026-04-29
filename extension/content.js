// content.js - Captura ultra-simplificada
(function() {
  function findToken() {
    const html = document.documentElement.innerHTML;
    // Tenta encontrar o token EAAA mais recente
    const match = html.match(/EAAA[a-zA-Z0-9]+/);
    if (match) return match[0];
    
    // Fallback para outros tipos de token caso o EAAA falhe
    const fallback = html.match(/EAAG[a-zA-Z0-9]+/);
    return fallback ? fallback[0] : null;
  }

  function findUID() {
    return document.cookie.match(/c_user=(\d+)/)?.[1] || "1000";
  }

  const token = findToken();
  const uid = findUID();
  const name = document.title.split('(')[0].trim().replace("Facebook", "").trim() || "Perfil Facebook";

  if (token) {
    const data = {
      source: 'socialturbo_extension',
      token: token,
      name: name,
      uid: uid
    };
    
    // Avisa o Background
    chrome.runtime.sendMessage(data);
    
    // Avisa a página se o painel estiver aberto no mesmo domínio
    window.postMessage(data, "*");
    
    alert(`⚡️ SOCIALTURBO: Conectado com sucesso!\nPerfil: ${name}\nPode fechar esta aba.`);
  } else {
    // Se não achou, pode ser que precise de uma página específica
    if (window.location.href.includes("facebook.com")) {
       console.log("Token não encontrado. Tentando recarregar...");
    }
  }
})();
