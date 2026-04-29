import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  const PORT = 3000;
  app.use(express.json());

  let client: Client | null = null;
  let qrCode: string | null = null;
  let connectionStatus: "connecting" | "connected" | "disconnected" | "starting" = "disconnected";

  function initWhatsApp() {
    if (client || connectionStatus === "starting" || connectionStatus === "connected") return;

    console.log("Iniciando motor do WhatsApp...");
    connectionStatus = "starting";
    io.emit("whatsapp_status", "starting");

    client = new Client({
      authStrategy: new LocalAuth({
        dataPath: path.join(process.cwd(), ".wwebjs_auth")
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--font-render-hinting=none'
        ]
      }
    });

    client.on("qr", async (qr) => {
      console.log("✅ QR Code original gerado com sucesso!");
      qrCode = qr;
      io.emit("whatsapp_qr", qr);
    });

    client.on("ready", () => {
      console.log("Cliente pronto!");
      connectionStatus = "connected";
      qrCode = null;
      io.emit("whatsapp_status", { status: "connected", user: client?.info?.wid });
    });

    client.on("authenticated", () => {
      console.log("Autenticado!");
    });

    client.on("auth_failure", (msg) => {
      console.error("Falha na autenticação:", msg);
      connectionStatus = "disconnected";
      io.emit("whatsapp_status", "disconnected");
    });

    client.on("disconnected", (reason) => {
      console.log("Desconectado:", reason);
      connectionStatus = "disconnected";
      client = null;
      qrCode = null;
      io.emit("whatsapp_status", "disconnected");
    });

    client.initialize().catch(err => {
      console.error("Erro ao inicializar cliente:", err);
      connectionStatus = "disconnected";
      io.emit("whatsapp_status", "disconnected");
      client = null;
    });
  }

  // Socket.io
  io.on("connection", (socket) => {
    console.log("Cliente socket conectado:", socket.id);

    if (connectionStatus === "connected") {
      socket.emit("whatsapp_status", { status: "connected", user: client?.info?.wid });
    } else {
      socket.emit("whatsapp_status", connectionStatus);
    }
    
    if (qrCode) socket.emit("whatsapp_qr", qrCode);

    socket.on("request_qr", () => {
      if (connectionStatus === "connected") {
        socket.emit("whatsapp_status", { status: "connected", user: client?.info?.wid });
      } else {
        if (!client || connectionStatus === "disconnected") {
          console.log("Solicitação de QR: Iniciando WhatsApp...");
          initWhatsApp();
        } else if (qrCode) {
          socket.emit("whatsapp_qr", qrCode);
        }
      }
    });

    socket.on("send_message", async ({ numbers, message }: { numbers: string[], message: string }) => {
      if (connectionStatus !== "connected" || !client) {
        socket.emit("bulk_error", "WhatsApp não conectado");
        return;
      }

      for (const num of numbers) {
        try {
          const jid = num.includes("@c.us") ? num : `${num.replace(/\D/g, "")}@c.us`;
          await client.sendMessage(jid, message);
          socket.emit("bulk_progress", { number: num, status: "success" });
          await new Promise(r => setTimeout(r, 2000));
        } catch (err) {
          console.error(`Erro ao enviar para ${num}:`, err);
          socket.emit("bulk_progress", { number: num, status: "error" });
        }
      }
      socket.emit("bulk_done");
    });
  });

  // Vite middleware
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
