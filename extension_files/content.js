console.log("SocialTurbo Pro Extension: Content Bridge Active");

// Escuta mensagens vindas do site SocialTurbo para automatizar a conexão
window.addEventListener("message", (event) => {
  // Apenas mensagens do próprio site
  if (event.source !== window) return;
  if (event.data.type !== "SOCIAL_TURBO_EXT_SYNC") return;

  const { userId } = event.data.detail;
  if (!userId) return;

  const origin = window.location.origin;

  chrome.runtime.sendMessage({ action: "sync_now", userId, origin }, (response) => {
    // Devolve a resposta para o site
    window.postMessage({ 
      type: "SOCIAL_TURBO_EXT_RESPONSE", 
      detail: response 
    }, "*");
  });
});
