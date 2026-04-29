chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.source === 'socialturbo_extension') {
    console.log("Token capturado pela extensão:", request.token);
    // Aqui você pode redirecionar o usuário para o painel automaticamente se quiser
  }
});
