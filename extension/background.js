let capturedData = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.source === 'socialturbo_extension') {
    capturedData = request;
    console.log("Sessão capturada:", capturedData.name);
    
    // Tenta enviar para todas as abas do painel que estiverem abertas
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url && (tab.url.includes('localhost') || tab.url.includes('socialturbo') || tab.url.includes('ais-dev'))) {
          chrome.tabs.sendMessage(tab.id, request);
        }
      });
    });
  }
  
  if (request.action === 'get_captured_data') {
    sendResponse(capturedData);
  }
});
