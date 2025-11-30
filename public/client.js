// client.js
const socket = io();

// DOM refs
const roleSelectDiv = document.getElementById("role-select");
const mainDiv = document.getElementById("main");
const roleLabel = document.getElementById("role-label");

const sceneTitle = document.getElementById("scene-title");
const scenePlayerText = document.getElementById("scene-player-text");
const sceneDmNotes = document.getElementById("scene-dm-notes");
const sceneSelect = document.getElementById("scene-select");
const dmPanel = document.getElementById("dm-panel");

const diceButtons = document.querySelectorAll("#dice-roller button");
const diceResult = document.getElementById("dice-result");

let role = null;
let scenes = [];
let currentSceneId = null;

// Role selection
roleSelectDiv.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;

  role = e.target.dataset.role; // "dm" o "player"
  roleSelectDiv.classList.add("hidden");
  mainDiv.classList.remove("hidden");

  roleLabel.textContent =
    role === "dm"
      ? "You are: Dungeon Master 🧙‍♂️"
      : "You are: Player 🛡️";

  if (role === "dm") {
    dmPanel.classList.remove("hidden");
  } else {
    dmPanel.classList.add("hidden");
  }

  // Render escena actual si ya está disponible
  if (scenes.length && currentSceneId) {
    renderScene();
  }
});

// Estado inicial desde el servidor
socket.on("state:init", (data) => {
  scenes = data.scenes || [];
  currentSceneId = data.currentSceneId;

  // Llenar select del DM
  sceneSelect.innerHTML = "";
  scenes.forEach((scene) => {
    const opt = document.createElement("option");
    opt.value = scene.id;
    opt.textContent = scene.title;
    sceneSelect.appendChild(opt);
  });

  sceneSelect.value = currentSceneId;
  renderScene();
});

// Actualización de escena (para todos)
socket.on("state:updateScene", ({ currentSceneId: newId }) => {
  currentSceneId = newId;
  if (sceneSelect.value !== newId) {
    sceneSelect.value = newId;
  }
  renderScene();
});

// DM cambia la escena
sceneSelect.addEventListener("change", (e) => {
  if (role !== "dm") return;
  const sceneId = e.target.value;
  socket.emit("dm:setScene", sceneId);
});

// Renderizar escena en pantalla
function renderScene() {
  const scene = scenes.find((s) => s.id === currentSceneId);
  if (!scene) return;

  sceneTitle.textContent = scene.title || "";
  scenePlayerText.textContent = scene.playerText || "";

  if (role === "dm") {
    sceneDmNotes.textContent = scene.dmNotes || "";
  } else {
    sceneDmNotes.textContent = "";
  }
}

// Dice roller
diceButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const sides = parseInt(btn.dataset.dice, 10);
    if (!sides) return;

    const roll = Math.floor(Math.random() * sides) + 1;
    diceResult.textContent = `You rolled a d${sides}: ${roll}`;
  });
});
