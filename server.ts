import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  delay
} from "@whiskeysockets/baileys";
import pino from "pino";
import { Boom } from "@hapi/boom";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  const PORT = 3000;
  app.use(express.json());

  // Estado da conexão
  let sock: any = null;
  let qrCode: string | null = null;
  let connectionStatus: "connecting" | "connected" | "disconnected" = "disconnected";

  async function connectToWhatsApp() {
    console.log("Iniciando conexão Baileys...");
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    console.log(`Usando versão Baileys v${version.join(".")}, latest: ${isLatest}`);

    sock = makeWASocket({
      version,
      printQRInTerminal: true,
      auth: state,
      logger: pino({ level: "silent" }) as any,
    });

    sock.ev.on("connection.update", (update: any) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        qrCode = qr;
        io.emit("whatsapp_qr", qr);
        console.log("Novo QR Code gerado!");
      }

      if (connection === "close") {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log("Conexão fechada devido a", lastDisconnect?.error, ", reconectando:", shouldReconnect);
        connectionStatus = "disconnected";
        io.emit("whatsapp_status", "disconnected");
        if (shouldReconnect) {
          connectToWhatsApp();
        }
      } else if (connection === "open") {
        console.log("Conexão aberta!");
        connectionStatus = "connected";
        qrCode = null;
        io.emit("whatsapp_status", { status: "connected", user: sock.user });
      }
    });

    sock.ev.on("creds.update", saveCreds);
  }

  // Socket.io
  io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    // Envia status atual ao conectar
    if (connectionStatus === "connected") {
      socket.emit("whatsapp_status", { status: "connected", user: sock?.user });
    } else {
      socket.emit("whatsapp_status", connectionStatus);
    }
    
    if (qrCode) socket.emit("whatsapp_qr", qrCode);

    socket.on("request_qr", () => {
      if (connectionStatus === "connected") {
        socket.emit("whatsapp_status", { status: "connected", user: sock?.user });
      } else if (qrCode) {
        socket.emit("whatsapp_qr", qrCode);
      } else {
        if (!sock) connectToWhatsApp();
      }
    });

    socket.on("send_message", async ({ numbers, message }: { numbers: string[], message: string }) => {
      if (connectionStatus !== "connected" || !sock) {
        socket.emit("bulk_error", "WhatsApp não conectado");
        return;
      }

      for (const num of numbers) {
        try {
          const jid = num.includes("@s.whatsapp.net") ? num : `${num.replace(/\D/g, "")}@s.whatsapp.net`;
          await sock.sendMessage(jid, { text: message });
          socket.emit("bulk_progress", { number: num, status: "success" });
          await delay(2000); // Delay entre mensagens
        } catch (err) {
          console.error(`Erro ao enviar para ${num}:`, err);
          socket.emit("bulk_progress", { number: num, status: "error" });
        }
      }
      socket.emit("bulk_done");
    });
  });

  // Start initial connection attempt
  connectToWhatsApp();

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
