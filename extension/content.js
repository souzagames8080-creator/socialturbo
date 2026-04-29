// Script que roda no Facebook para extrair o Access Token
console.log("🚀 SocialTurbo Extension: Iniciando captura...");

function extractToken() {
  // Metodo 1: Buscar em scripts da pagina
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    const text = script.textContent || "";
    const match = text.match(/\"accessToken\":\"(EAAAA[^\"]+)\"/) || 
                  text.match(/access_token\":\"(EAAAA[^\"]+)\"/) ||
                  text.match(/EAAG[^\"]+/);
    if (match) return Array.isArray(match) ? match[1] || match[0] : match;
  }

  // Metodo 2: Buscar em variaveis globais (se injetado)
  if (window.require) {
    try {
      const fb = window.require("SiteData");
      if (fb && fb.accessToken) return fb.accessToken;
    } catch(e) {}
  }

  return null;
}

function extractUID() {
  const cookieMatch = document.cookie.match(/c_user=(\d+)/);
  return cookieMatch ? cookieMatch[1] : null;
}

const token = extractToken();
const uid = extractUID();
const name = document.title.split('(')[0].trim() || "Perfil Facebook";

if (token) {
  const data = {
    source: 'socialturbo_extension',
    token: token,
    name: name,
    uid: uid
  };
  
  console.log("✅ SocialTurbo: Token capturado!", name);
  
  // ALERTA VISUAL NO FACEBOOK
  alert(`🚀 SOCIALTURBO: Sessão de "${name}" capturada com sucesso! Retorne ao painel.`);

  // Envia para o Background para distribuir para as abas do Painel
  chrome.runtime.sendMessage(data);
  
  // Envia para a pagina atual
  window.postMessage(data, "*");
} else {
  alert("❌ SOCIALTURBO: Não foi possível encontrar sua sessão. Certifique-se de estar logado no Facebook e tente atualizar a página.");
}
