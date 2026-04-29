import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  delay
} from "@whiskeysockets/baileys";
import pino from "pino";
import { Boom } from "@hapi/boom";
import fs from "fs";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  const PORT = 3000;
  app.use(express.json());

  let sock: any = null;
  let qrCode: string | null = null;
  let connectionStatus: "connecting" | "connected" | "disconnected" = "disconnected";

  async function connectToWhatsApp() {
    if (connectionStatus === "connecting" || connectionStatus === "connected") return;
    
    console.log("Iniciando conexão Baileys (Modo Turbo)...");
    connectionStatus = "connecting";
    io.emit("whatsapp_status", "connecting");

    try {
      const { state, saveCreds } = await useMultiFileAuthState("auth_info_turbozap");
      const { version } = await fetchLatestBaileysVersion();
      
      sock = makeWASocket({
        version,
        printQRInTerminal: false,
        auth: state,
        logger: pino({ level: "error" }) as any,
        browser: Browsers.macOS('Desktop'), // Identifica como computador original
        syncFullHistory: false,
        qrTimeout: 40000, // 40 segundos para dar tempo ao usuário
      });

      sock.ev.on("connection.update", (update: any) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          qrCode = qr;
          io.emit("whatsapp_qr", qr);
          console.log("✅ QR Code SocialTurbo gerado!");
        }

        if (connection === "close") {
          const error = (lastDisconnect?.error as Boom);
          const statusCode = error?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          
          console.log("Conexão fechada. Motivo:", error?.message, "| Reconectar:", shouldReconnect);
          
          connectionStatus = "disconnected";
          qrCode = null;
          io.emit("whatsapp_status", "disconnected");

          if (shouldReconnect) {
            // Se o erro for de QR timeout ou algo recuperável, tenta de novo após pequeno delay
            setTimeout(() => connectToWhatsApp(), 3000);
          } else {
            // Se deslogou, limpa a pasta de auth para permitir novo login
            console.log("Usuário deslogou. Limpando sessão...");
            if (fs.existsSync("auth_info_turbozap")) {
              fs.rmSync("auth_info_turbozap", { recursive: true, force: true });
            }
            sock = null;
          }
        } else if (connection === "open") {
          console.log("🚀 Conexão estabelecida com sucesso!");
          connectionStatus = "connected";
          qrCode = null;
          io.emit("whatsapp_status", { status: "connected", user: sock.user });
        }
      });

      sock.ev.on("creds.update", saveCreds);

    } catch (error) {
      console.error("Erro crítico na conexão:", error);
      connectionStatus = "disconnected";
      io.emit("whatsapp_status", "disconnected");
    }
  }

  // Socket.io
  io.on("connection", (socket) => {
    console.log("Interface conectada:", socket.id);

    if (connectionStatus === "connected") {
      socket.emit("whatsapp_status", { status: "connected", user: sock?.user });
    } else {
      socket.emit("whatsapp_status", connectionStatus);
    }
    
    if (qrCode) socket.emit("whatsapp_qr", qrCode);

    socket.on("request_qr", () => {
      if (connectionStatus === "connected") {
        socket.emit("whatsapp_status", { status: "connected", user: sock?.user });
      } else {
        connectToWhatsApp();
      }
    });

    socket.on("logout", async () => {
      if (sock) {
        try {
          await sock.logout();
        } catch (e) {
          console.error("Erro no logout:", e);
        }
        if (fs.existsSync("auth_info_turbozap")) {
          fs.rmSync("auth_info_turbozap", { recursive: true, force: true });
        }
        connectionStatus = "disconnected";
        sock = null;
        qrCode = null;
        io.emit("whatsapp_status", "disconnected");
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
          await delay(2000); 
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
    console.log(`🚀 SocialTurbo Online na porta ${PORT}`);
  });
}

startServer();
