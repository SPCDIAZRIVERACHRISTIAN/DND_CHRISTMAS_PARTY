// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// --- Escenas básicas: edítalas como quieras ---
const scenes = [
  {
    id: "frosthaven",
    title: "Frosthaven – El Pueblo Sin Espíritu",
    playerText:
      "Llegan al pueblo nevado de Frosthaven. Las fogatas están apagadas, los villancicos suenan raros y el pueblo susurra que Santa ha desaparecido.",
    dmNotes:
      "NPCs: Rudy (reno borrachón), Alcaldesa Tinsel. Mini-boss: GiftGolem ataca el pueblo. Pistas de Pepperminx y del saco mágico robado."
  },
  {
    id: "snowcap",
    title: "Montaña de Snowcap",
    playerText:
      "El grupo avanza hacia la montaña de Snowcap. El viento corta la cara y la nieve les llega a las rodillas. Algo maligno corrompe el paisaje.",
    dmNotes:
      "Encuentros: Gingerdead Men, puzzle del puente con villancicos. Introduce a Pepperminx que conoce el plan de Krampus."
  },
  {
    id: "factory",
    title: "La Fábrica Retorcida",
    playerText:
      "Una fábrica oscura con cintas de juguetes malditos, luces parpadeantes y la sensación de que los están observando.",
    dmNotes:
      "Mini-boss: NutCracker Assassin. Santa está amarrado en la sala final. Perfecto para tiradas de investigación, miedo y roleo intenso."
  },
  {
    id: "krampus",
    title: "Batalla Final – Krampus",
    playerText:
      "Entrando al círculo ritual, un fuego verde ilumina a Krampus rodeado de cadenas y decoraciones navideñas retorcidas.",
    dmNotes:
      "HP 80–100. Habilidades: Whip of Punishment, Snowstorm of Despair, Naughty List. Santa puede apoyar si lo liberan (heals, radiant damage)."
  }
];

let currentSceneId = "frosthaven";

// WebSockets
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Estado inicial
  socket.emit("state:init", {
    scenes,
    currentSceneId
  });

  // DM cambia de escena
  socket.on("dm:setScene", (sceneId) => {
    const exists = scenes.find((s) => s.id === sceneId);
    if (!exists) return;

    currentSceneId = sceneId;
    console.log("Scene changed to:", sceneId);

    io.emit("state:updateScene", { currentSceneId });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
