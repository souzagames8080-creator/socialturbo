import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Middleware para JSON
  app.use(express.json());

  // API de Sincronização (Legado da Extensão, mas mantido para compatibilidade se necessário)
  app.post("/api/sync-extension", (req, res) => {
    console.log("Sincronização recebida:", req.body);
    res.json({ success: true });
  });

  // Socket.io para o QR Code em tempo real
  io.on("connection", (socket) => {
    console.log("Cliente conectado ao painel:", socket.id);

    socket.on("request_qr", () => {
      console.log("Solicitando QR Code...");
      // Aqui integraria o Baileys/Whatsapp-web.js
      // Por enquanto, simulamos o envio de patches de QR Code
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (attempts > 5) {
          socket.emit("whatsapp_status", "connected");
          clearInterval(interval);
          return;
        }
        const mockQR = "https://whatsapp.com/qr/fake_" + Math.random().toString(36).substring(7);
        socket.emit("whatsapp_qr", mockQR);
      }, 5000);

      socket.on("disconnect", () => clearInterval(interval));
    });
  });

  // Integração com Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 TurboZap rodando em http://localhost:${PORT}`);
  });
}

startServer();
