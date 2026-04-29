// bridge.js - Faz a ponte entre a extensão e o seu site
chrome.runtime.onMessage.addListener((message) => {
  if (message.source === 'socialturbo_extension') {
    // Repassa para o seu App React
    window.postMessage(message, "*");
  }
});
