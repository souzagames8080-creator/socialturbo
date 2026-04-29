let capturedData = null;

// Escuta mensagens da Content Script (Facebook) ou do Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Se a mensagem vem da captura direta no Facebook
  if (request.source === 'socialturbo_extension' && request.token) {
    capturedData = request;
    relayToPanel(request);
    sendResponse({ status: "ok" });
    return;
  }

  // Se o Popup pediu para iniciar captura
  if (request.action === 'start_capture') {
    chrome.tabs.query({ url: "https://*.facebook.com/*" }, (tabs) => {
      if (tabs.length > 0) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        });
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: "Abra o Facebook em uma aba antes de conectar." });
      }
    });
    return true; 
  }

  if (request.action === 'get_captured_data') {
    sendResponse(capturedData);
  }
});

// Envia os dados para o seu painel
function relayToPanel(data) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && (tab.url.includes('socialturbo') || tab.url.includes('ais-dev') || tab.url.includes('localhost'))) {
        chrome.tabs.sendMessage(tab.id, data);
      }
    });
  });
}
