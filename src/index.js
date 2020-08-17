import CursorControllerSystem from "./cursor/CursorControllerSystem.js";

// State Management
import StateManager from "./state_management/StateManager.js";

// Menu Imports
import MenuSetup from "./menu/MenuSetup.js";
import LoadingSetup from "./menu/Loading.js";
import * as SpriteModifySetup from "./menu/SpriteModifySetup.js";

import DisplayHandlerSystem from "./display/DisplayHandlerSystem.js";

const engine = new AsciiEngine.Engine();

function main() {
  document.getElementById("startAacButton").addEventListener("click", startAac);
}

async function startAac() {
  setupUI();

  let width = parseInt(document.getElementById("screenWidthInput").value) || 120;
  let height = parseInt(document.getElementById("screenHeightInput").value) || 60;

  document.getElementById("setupPrompt").remove();
  document.getElementById("displayContainer").style.display = "block";

  let agl = new AsciiEngine.GL.Instance("artCreator");
  agl.init(width, height);

  let keyboardInput = new AsciiEngine.Modules.KeyboardInput();
  let asciiMouseInput = new AsciiEngine.Modules.AsciiMouseInput(agl);
  let resourceManager = new AsciiEngine.Modules.ResourceManager();

  engine.setModule(AsciiEngine.ModuleSlots.Graphics, agl);
  engine.setModule(AsciiEngine.ModuleSlots.ResourceManager, resourceManager);
  engine.setModule("KeyboardInput", keyboardInput);
  engine.setModule("MouseInput", asciiMouseInput);

  resourceManager.add("_#_#_screen-width", width);
  resourceManager.add("_#_#_screen-height", height);

  await resourceManager.loadSpriteFiles([
    "./assets/sprites.json",
  ]);
  await resourceManager.loadTemplateFiles([
    "./assets/cursor.json",
  ]);

  // Load Base AsciiEngine Systems
  let cursorController = new CursorControllerSystem();
  engine.getSystemManager().addSystem(cursorController);
  let asciiRender = new AsciiEngine.Systems.AsciiRender("AsciiRender");
  engine.getSystemManager().addSystem(asciiRender);

  // State
  let stateManager = new StateManager();
  engine.setModule("StateManager", stateManager);

  // Menu setup
  for (let type in MenuSetup) {
    MenuSetup[type](stateManager);
  }
  LoadingSetup(stateManager);
  SpriteModifySetup.setupSpriteModify(stateManager, engine);

  let displayHandler = new DisplayHandlerSystem();
  engine.getSystemManager().addSystem(displayHandler);
  engine.startLoop(125);
}

function setupUI() {
  // Top tabs for alternating between the component and sprite tab. 
  document.getElementById("templateViewTab").addEventListener("click", (event) => {
    document.getElementById("templateViewBody").style.display = "block";
    document.getElementById("spriteViewBody").style.display = "none";

    document.getElementById("templateViewTab").classList.add("activeTab");
    document.getElementById("spriteViewTab").classList.remove("activeTab");

  });

  document.getElementById("spriteViewTab").addEventListener("click", (event) => {
    document.getElementById("templateViewBody").style.display = "none";
    document.getElementById("spriteViewBody").style.display = "block";

    document.getElementById("templateViewTab").classList.remove("activeTab");
    document.getElementById("spriteViewTab").classList.add("activeTab");
  });
}

window.onload = main;
