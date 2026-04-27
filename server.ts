import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Facebook OAuth Implementation
  app.get("/api/auth/facebook/url", (req, res) => {
    const appId = process.env.VITE_FB_APP_ID;
    const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/facebook/callback`;
    
    if (!appId) {
      return res.status(200).json({ 
        url: null, 
        error: "Configuração Master Pendente: O administrador precisa configurar o App ID para habilitar a conexão de 1-clique." 
      });
    }

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      scope: "public_profile,email,groups_access_member_info,publish_to_groups,instagram_basic,instagram_content_publish",
      response_type: "code"
    });

    res.json({ url: `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}` });
  });

  app.get("/api/auth/facebook/callback", async (req, res) => {
    const { code } = req.query;
    const appId = process.env.VITE_FB_APP_ID;
    const appSecret = process.env.FB_APP_SECRET;
    const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/facebook/callback`;

    if (!code) return res.send("Código de autorização não recebido.");

    try {
      const tokenResponse = await fetch(
        `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`
      );
      const data = await tokenResponse.json();

      if (data.access_token) {
        // Envia mensagem para o popup fechar e avisar a janela pai
        res.send(`
          <html>
            <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f0f2f5;">
              <div style="text-align: center; background: white; padding: 2rem; border-radius: 1rem; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                <h2 style="color: #1877f2;">Conectado com Sucesso!</h2>
                <p>O SocialTurbo já recebeu suas chaves de acesso.</p>
                <p>Esta janela fechará em instantes...</p>
                <script>
                  window.opener.postMessage({ type: 'FB_AUTH_SUCCESS', token: '${data.access_token}' }, '*');
                  setTimeout(() => window.close(), 2000);
                </script>
              </div>
            </body>
          </html>
        `);
      } else {
        res.status(400).send("Erro ao obter token: " + JSON.stringify(data));
      }
    } catch (error) {
      res.status(500).send("Erro no servidor durante a conexão.");
    }
  });

  // Mock Automation Engine
  // In a real app, this would be a separate worker process
  // Here we just simulate something happening every 10 seconds
  setInterval(async () => {
    // This is just a placeholder. Real implementation would use firebase-admin
    // to check for pending campaigns and process them.
    // console.log("Checking for pending automation tasks...");
  }, 10000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
