console.log("SocialTurbo Pro Extension: Content Bridge Active");

// Escuta eventos vindos do site SocialTurbo para automatizar a conexão
window.addEventListener("SOCIAL_TURBO_EXT_SYNC", async (event) => {
  const { userId } = event.detail;
  if (!userId) return;

  chrome.runtime.sendMessage({ action: "sync_now", userId }, (response) => {
    // Devolve a resposta para o site
    window.dispatchEvent(new CustomEvent("SOCIAL_TURBO_EXT_RESPONSE", { 
      detail: response 
    }));
  });
});
