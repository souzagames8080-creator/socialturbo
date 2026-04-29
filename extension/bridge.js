// bridge.js (Roda no seu painel para receber dados da extensão)
chrome.runtime.onMessage.addListener((message) => {
  if (message.source === 'socialturbo_extension') {
    // Encaminha a mensagem da extensão para a página web (React)
    window.postMessage(message, "*");
  }
});

// Solicita dados capturados anteriormente ao carregar o painel
chrome.runtime.sendMessage({ action: "get_captured_data" }, (response) => {
  if (response) {
    window.postMessage(response, "*");
  }
});
