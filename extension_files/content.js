// Este arquivo roda dentro do site SocialTurbo Pro
// Ele escuta comandos do site e envia para a extensão

window.addEventListener("message", (event) => {
  // Apenas aceita mensagens da mesma janela e do nosso tipo
  if (event.source !== window || !event.data.type) return;

  if (event.data.type === "SOCIAL_TURBO_EXT_SYNC") {
    const userId = event.data.detail?.userId;
    if (userId) {
      console.log("SocialTurbo: Sincronizando ID capturado do site:", userId);
      chrome.runtime.sendMessage({ action: "save_token", userId: userId }, (response) => {
        // Opcional: Avisar o site que deu certo
        window.postMessage({ 
          type: "SOCIAL_TURBO_EXT_RESPONSE", 
          detail: { success: true, message: "Conectado via site!" } 
        }, "*");
      });
    }
  }
});

console.log("SocialTurbo Pro Content Script Ativo");
