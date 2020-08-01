import CursorControllerSystem from "./cursor/CursorControllerSystem.js";

// State Management
import StateManager from "./state_management/StateManager.js";

// Menu Imports
import MenuSetup from "./menu/MenuSetup.js";

import LoadingSetup from "./menu/Loading.js";

// import LoadingSystem from "./controllers/LoadingSystem.js";
// import StyleChangeHandler from "./controllers/StyleChangeHandler.js";
// 
// import ArtHolderSystem from "./systems/ArtHolderSystem.js";
// import DisplayHandlerSystem from "./display/DisplayHandlerSystem.js";
// 
// import TextCellComponent from "./components/TextCellComponent.js";
// 
// import AEObjectTracker from "./AEObjectTracker.js";
// 
// import TemplateOperations from "./database/Template.js";
// import FrameOperations from "./database/Frame.js";
// import FragmentOperations from "./database/Frame.js";
// import SpriteOperations from "./database/Frame.js";
// import StyleOperations from "./database/Frame.js";

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
  
  // Load Base AsciiEngine Systems
  let cursorController = new CursorControllerSystem();
  engine.getSystemManager().addSystem(cursorController);
  let asciiRender = new AsciiEngine.Systems.AsciiRender("AsciiRender");
  engine.getSystemManager().addSystem(asciiRender);
  
  // State
  let stateManager = new StateManager();
  
  // Menu setup
  for (let type in MenuSetup) {
    MenuSetup[type](stateManager);
  }
  
  LoadingSetup(stateManager);
  
  // let displayHandler = new DisplayHandlerSystem();
  // let artHolder = new ArtHolderSystem();
  // let loadingSystem = new LoadingSystem();
  // let styleChangeHandler = new StyleChangeHandler();
  // let objTracker = new AEObjectTracker();
  // 
  // engine.getSystemManager().addSystem(displayHandler);
  // engine.getSystemManager().addSystem(artHolder);
  // engine.getSystemManager().addSystem(loadingSystem);
  // engine.getSystemManager().addSystem(styleChangeHandler);
  
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
