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
      "NPCs: Rudy (reno borrachón), Alcaldesa Tinsel. Mini-boss: GiftGolem ataca el pueblo. Pistas de Pepperminx y del saco mágico robado.", // TODO change the location they find the pepperminx
    story: {
      line1: "Llegaron a un lugar frío colmado de nieve, una aldea que antes llena de felicidad y alegría hoy esta triste y vacía.",
      line2: "En la plaza encuentran una taverna nombrada: TRAGA Y VETE!",
      line3: "Debido a que era el unico lugar abierto deciden entrar.",
      line4: "Encuntran a los clientes bebiendo como si todos trabajaran en el CDT de Patillas ",
    },
    bossFight: {
      giftGolem: {
        hp: 40,
        attacks: {
          atk1: "candy cane machine gun",
          atk2: "ribbon strangle",
          atk3: "Super strength"
        },
        loot: "Amulet of Life"
      },
      event: "De la nada aparece un monstruo que destruye media taberna los clientes huyen a todas direcciones tratando de salvarse."
    }
  },
  {
    id: "snowcap",
    title: "Montaña de Snowcap",
    playerText:
      "El grupo avanza hacia la montaña de Snowcap. El viento corta la cara y la nieve les llega a las rodillas. Algo maligno corrompe el paisaje.",
    dmNotes:
      "Encuentros: Gingerdead Men, puzzle del puente con villancicos. Introduce a Pepperminx que conoce el plan de Krampus.",
    story: {
      line1: "Llegaron a un lugar frío colmado de nieve, una aldea que antes llena de felicidad y alegría hoy esta triste y vacía.",
      line2: "En la plaza encuentran una taverna nombrada: TRAGA Y VETE!",
      line3: "Debido a que era el unico lugar abierto deciden entrar.",
      line4: "Encuntran a los clientes bebiendo como si todos trabajaran en el CDT de Patillas ",
    },
    bossFight: {
      pepperminx: {
        hp: 100,
        attacks: {
          atk1: "frost mist",
          atk2: "claw slash",
          atk3: "Ice dive bomb"
        },
        loot: "Amulet of Life"
      },
      event: "En la cima de la montaña aparece frente a ustedes aparece un sphinx volador con olor y sabor a menta"
    }
  },
  {
    id: "factory",
    title: "La Fábrica Retorcida",
    playerText:
      "Una fábrica oscura con cintas de juguetes malditos, luces parpadeantes y la sensación de que los están observando.",
    dmNotes:
      "Mini-boss: NutCracker Assassin. Santa está amarrado en la sala final. Perfecto para tiradas de investigación, miedo y roleo intenso.",
    story: {
      line1: "Llegaron a un lugar frío colmado de nieve, una aldea que antes llena de felicidad y alegría hoy esta triste y vacía.",
      line2: "En la plaza encuentran una taverna nombrada: TRAGA Y VETE!",
      line3: "Debido a que era el unico lugar abierto deciden entrar.",
      line4: "Encuntran a los clientes bebiendo como si todos trabajaran en el CDT de Patillas ",
    },
    bossFight: {
      giftGolem: {
        hp: 40,
        attacks: {
          atk1: "candy cane machine gun",
          atk2: "ribbon strangle",
          atk3: "Super strength"
        },
        loot: "Amulet of Life"
      },
      event: "De la nada aparece un monstruo quew destruye media taberna los clientes huyen a todas direcciones tratando de salvarse."
    }
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
