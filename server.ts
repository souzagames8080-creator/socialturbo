import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  const PORT = 3000;
  app.use(express.json());

  // Real-time updates for mass posting status
  io.on("connection", (socket) => {
    console.log("🟢 Novo cliente Dashboard SocialTurbo conectado");

    socket.on("start_mass_post", (data) => {
      console.log("📢 Iniciando postagem massiva Facebook:", data);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        socket.emit("post_progress", { progress, currentGroup: `Grupo ${Math.floor(progress/10)}` });
        if (progress >= 100) {
          clearInterval(interval);
          socket.emit("post_done");
        }
      }, 1500);
    });
  });

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
    console.log(`🚀 SocialTurbo Pro Online na porta ${PORT}`);
  });
}

startServer();
