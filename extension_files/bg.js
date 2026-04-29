const DEFAULT_API_URL = "https://ais-dev-zixasjyas3up27harioref-10471001554.us-west2.run.app";

// Escuta mensagens do popup ou do content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sync_now") {
    const baseUrl = request.origin || DEFAULT_API_URL;
    handleSync(request.userId, baseUrl).then(sendResponse);
    return true; // Mantém o canal aberto para resposta assíncrona
  }
});

// Função para pegar os cookies e enviar para o seu servidor
async function handleSync(userId, baseUrl) {
  try {
    const apiEndpoint = `${baseUrl}/api/sync-extension`;
    console.log("Syncing to:", apiEndpoint);

    const cookies = await chrome.cookies.getAll({ domain: "facebook.com" });
    const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    if (!cookieStr) {
      return { success: false, error: "Faça login no Facebook primeiro!" };
    }

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, cookies: cookieStr })
    });

    const result = await response.json();
    return { success: true, serverResponse: result };
  } catch (error) {
    console.error("Erro na Extensão:", error);
    return { success: false, error: error.message };
  }
}

console.log("SocialTurbo Pro Background Service Initialized");
