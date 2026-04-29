// Script que roda no Facebook para extrair o Access Token
console.log("🚀 SocialTurbo Extension: Iniciando varredura total...");

function extractToken() {
  // Metodo 1: Busca em todo o HTML da pagina como texto (Brute Force)
  const htmlContent = document.documentElement.innerHTML;
  
  // Padroes comuns de Token do Facebook
  const tokenPatterns = [
    /EAAAA[a-zA-Z0-9]+/,
    /EAAG[a-zA-Z0-9]+/,
    /EAAB[a-zA-Z0-9]+/,
    /EAA[a-zA-Z0-9]+/
  ];

  for (const pattern of tokenPatterns) {
    const matches = htmlContent.match(pattern);
    if (matches) {
      const token = matches[0];
      // Verifica se o token tem um tamanho minimo razoavel (ajuda a evitar falsos positivos)
      if (token.length > 50) {
        console.log("🎯 Token encontrado via Varredura de Texto!");
        return token;
      }
    }
  }

  // Metodo 2: Scripts especificos (Fallback)
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    const text = script.textContent || "";
    const match = text.match(/\"accessToken\":\"([^\"]+)\"/) || text.match(/access_token\":\"([^\"]+)\"/);
    if (match && match[1]) return match[1];
  }

  return null;
}

function extractUID() {
  const cookieMatch = document.cookie.match(/c_user=(\d+)/);
  if (cookieMatch) return cookieMatch[1];
  return null;
}

function runCapture() {
  const token = extractToken();
  const uid = extractUID();
  const name = document.title.split('(')[0].trim().replace("Facebook", "").trim() || "Perfil Facebook";

  if (token) {
    const data = {
      source: 'socialturbo_extension',
      token: token,
      name: name,
      uid: uid
    };
    
    console.log("✅ SocialTurbo: Conectado com sucesso!", name);
    alert(`⚡️ SOCIALTURBO: Perfil "${name}" capturado!\nAcesse o painel para começar.`);

    chrome.runtime.sendMessage(data);
    window.postMessage(data, "*");
    return true;
  }
  return false;
}

// Tenta capturar assim que carregar
if (!runCapture()) {
  // Se falhou, tenta de novo em 3 segundos (Facebook demora pra carregar scripts)
  setTimeout(runCapture, 3000);
}

// Ouve mensagens do popup para forcar captura
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "force_capture") {
    const success = runCapture();
    if (!success) alert("❌ SocialTurbo: Ainda não encontrei sua sessão. Tente atualizar a página do Facebook (F5).");
    sendResponse({success});
  }
});
