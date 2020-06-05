import CursorControllerSystem from "./cursor/CursorControllerSystem.js";

import ArtHolderSystem from "./systems/ArtHolderSystem.js";
import DisplayHandlerSystem from "./systems/DisplayHandlerSystem.js";

import TextCellComponent from "./components/TextCellComponent.js";

const engine = new AsciiEngine.Engine();

async function main() {
  setupUI();
  
  let width = 180;
  let height = 60;
  
  let agl = new AsciiEngine.GL.Instance("artCreator");
  agl.init(width, height);
  
  let keyboardInput = new AsciiEngine.Modules.KeyboardInput();
  let asciiMouseInput = new AsciiEngine.Modules.AsciiMouseInput(agl);
  let resourceManager = new AsciiEngine.Modules.ResourceManager();
  
  engine.setModule(AsciiEngine.Engine.ModuleSlots.Graphics, agl);
  engine.setModule(AsciiEngine.Engine.ModuleSlots.ResourceManager, resourceManager);
  engine.setModule("KeyboardInput", keyboardInput);
  engine.setModule("MouseInput", asciiMouseInput);
  
  resourceManager.add("screen-width", width);
  resourceManager.add("screen-height", height);
  
  await resourceManager.loadSpriteFiles([
    "./assets/sprites.json",
  ]);
  await resourceManager.loadTemplateFiles([
    "./assets/cursor.json",
  ]);
  
  let cursorController = new CursorControllerSystem();
  let displayHandler = new DisplayHandlerSystem();
  let artHolder = new ArtHolderSystem();
  
  let asciiRender = new AsciiEngine.Systems.AsciiRender("AsciiRender");
  
  engine.getSystemManager().addSystem(cursorController);
  engine.getSystemManager().addSystem(displayHandler);
  engine.getSystemManager().addSystem(artHolder);
  engine.getSystemManager().addSystem(asciiRender);
  
  engine.startLoop(125);
}

function setupUI() {
  // Top tabs for alternating between the component and sprite tab. 
  document.getElementById("componentViewTab").addEventListener("click", (event) => {
    document.getElementById("componentViewBody").style.display = "block";
    document.getElementById("spriteViewBody").style.display = "none";
    
    document.getElementById("componentViewTab").classList.add("activeTab");
    document.getElementById("spriteViewTab").classList.remove("activeTab");

  });
  
  document.getElementById("spriteViewTab").addEventListener("click", (event) => {
    document.getElementById("componentViewBody").style.display = "none";
    document.getElementById("spriteViewBody").style.display = "block";
    
    document.getElementById("componentViewTab").classList.remove("activeTab");
    document.getElementById("spriteViewTab").classList.add("activeTab");
  });
}

window.onload = main;
