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
const dmCharactersPanel = document.getElementById("dm-characters");

const characterForm = document.getElementById("character-form");

let role = null;
let scenes = [];
let currentSceneId = null;

// Handle character form submission (for player)
if (characterForm) {
  characterForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect form data
    const formData = new FormData(characterForm);
    const data = {
      name: formData.get("charName"),
      role: formData.get("role"),
      power1: formData.get("power1"),
      desc1: formData.get("desc1"),
      power2: formData.get("power2"),
      desc2: formData.get("desc2"),
      power3: formData.get("power3"),
      desc3: formData.get("desc3"),
      weakness: formData.get("weakness"),
    };

    // Send to server
    const res = await fetch("/api/characters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    // Fetch the character by ID
    const charRes = await fetch(`/api/characters/${result.id}`);
    const character = await charRes.json();

    // Show character info
    showCharacterInfo(character);

    characterForm.classList.add("hidden");
    mainDiv.classList.remove("hidden");
  });
}

// Helper to display character info
function showCharacterInfo(character) {
  const infoDiv = document.getElementById("character-info");
  if (!infoDiv) return;

  infoDiv.innerHTML = `
    <h2>${character.name} (${character.role})</h2>
    <p><strong>Health:</strong> ${character.health} | <strong>Mana:</strong> ${character.mana} | <strong>Stamina:</strong> ${character.stamina}</p>
    <p><strong>Weakness:</strong> ${character.weakness}</p>
    <h3>Powers</h3>
    <ul>
      <li><strong>${character.power1}:</strong> ${character.desc1}</li>
      <li><strong>${character.power2}:</strong> ${character.desc2}</li>
      <li><strong>${character.power3}:</strong> ${character.desc3}</li>
    </ul>
  `;
  infoDiv.classList.remove("hidden");
}

// Fetch and display all characters for DM
async function fetchAndShowAllCharacters() {
  const listDiv = document.getElementById("dm-characters-list");
  if (!listDiv) return;
  listDiv.innerHTML = "Loading...";
  const res = await fetch("/api/characters");
  const characters = await res.json();
  if (!characters.length) {
    listDiv.innerHTML = "<em>No characters yet.</em>";
    return;
  }
  listDiv.innerHTML = characters.map(c => `
    <div class="dm-character-card">
      <h5>${c.name} (${c.role})</h5>
      <p><strong>Health:</strong> ${c.health} | <strong>Mana:</strong> ${c.mana} | <strong>Stamina:</strong> ${c.stamina}</p>
      <p><strong>Weakness:</strong> ${c.weakness}</p>
      <ul>
        <li><strong>${c.power1}:</strong> ${c.desc1}</li>
        <li><strong>${c.power2}:</strong> ${c.desc2}</li>
        <li><strong>${c.power3}:</strong> ${c.desc3}</li>
      </ul>
    </div>
  `).join("");
}

// Listen for real-time updates from the server
socket.on("character:added", () => {
  if (role === "dm") fetchAndShowAllCharacters();
});

// Role selection
roleSelectDiv.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;

  role = e.target.dataset.role; // "dm" or "player"
  roleSelectDiv.classList.add("hidden");

  if (role === "dm") {
    mainDiv.classList.remove("hidden");
    dmPanel.classList.remove("hidden");
    if (dmCharactersPanel) dmCharactersPanel.classList.remove("hidden");
    roleLabel.textContent = "You are: Dungeon Master 🧙‍♂️";
    fetchAndShowAllCharacters();
  } else {
    if (characterForm) characterForm.classList.remove("hidden");
    mainDiv.classList.add("hidden");
    roleLabel.textContent = "You are: Player 🛡️";
    dmPanel.classList.add("hidden");
    if (dmCharactersPanel) dmCharactersPanel.classList.add("hidden");
  }

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
