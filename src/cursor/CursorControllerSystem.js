import CursorComponent from "./CursorComponent.js";
import BlinkerComponent from "./BlinkerComponent.js";

import BlinkerSystem from "./BlinkerSystem.js";

export default class CursorControllerSystem extends AsciiEngine.System {
  constructor() {
    super("CursorController");

    this.cursorEntity = new AsciiEngine.Entity("cursor");
    this.cursorComponent = null;
  }

  startup() {
    let resourceManager = this.getEngine().getModule(AsciiEngine.ModuleSlots.ResourceManager);
    let screenWidth = resourceManager.get("_#_#_screen-width");
    let screenHeight = resourceManager.get("_#_#_screen-height");

    this.cursorComponent = new CursorComponent(0, screenWidth - 1, 0, screenHeight - 1);
    this.cursorEntity.setComponent(new AsciiEngine.Components.Position(
      this.cursorComponent.x, this.cursorComponent.y
    ));
    this.cursorEntity.setComponent(resourceManager.get("_#_#_sprite-cursor").construct());
    this.cursorEntity.setComponent(this.cursorComponent);
    this.cursorEntity.setComponent(new BlinkerComponent(6, 3));

    this.getEngine().getEntityManager().requestAddEntity(this.cursorEntity);

    let keyboardInputModule = this.getEngine().getModule("KeyboardInput");
    keyboardInputModule.signup(this.name, this.getMessageReceiver());
    keyboardInputModule.subscribe(this.name, "ArrowDown", ["keydown"]);
    keyboardInputModule.subscribe(this.name, "ArrowUp", ["keydown"]);
    keyboardInputModule.subscribe(this.name, "ArrowLeft", ["keydown"]);
    keyboardInputModule.subscribe(this.name, "ArrowRight", ["keydown"]);
    keyboardInputModule.subscribe(this.name, "Backspace", ["keydown"]);
    keyboardInputModule.subscribe(this.name, "Enter", ["keydown"]);

    let mouseInputModule = this.getEngine().getModule("MouseInput");
    mouseInputModule.signup(this.name, this.getMessageReceiver());
    mouseInputModule.subscribe(this.name, mouseInputModule.GLOBAL, ["click"]);

    let blinkerSystem = new BlinkerSystem();
    this.getSystemManager().addSystem(blinkerSystem);
  }

  shutdown() {
    this.getEngine().getEntityManager().requestDeleteEntity(this.cursorEntity);
    let mouseInputModule = this.getEngine().getModule("MouseInput");
    mouseInputModule.withdraw(this.name);

    let keyboardInputModule = this.getEngine().getModule("KeyboardInput");
    keyboardInputModule.withdraw(this.name);
  }

  preUpdate() {

  }

  update() {
    // Because AE currently doesn't support system ordering, 
    // need to handle in update() so that SpriteEditorSystem is processed first. 
    this.getMessageReceiver().handleAll();
  }

  postUpdate() {
    let positionComponent = this.cursorEntity.getComponent(AsciiEngine.Components.Position.type);
    positionComponent.x = this.cursorComponent.x;
    positionComponent.y = this.cursorComponent.y;
  }

  receiveMessage(source, tag, body) {
    if (source === "click") {
      this.cursorComponent.setPosition(body.coords.x, body.coords.y);
    } else if (source === "keydown") {
      if (tag === "ArrowDown") {
        this.cursorComponent.shiftPosition(0, 1);
      } else if (tag === "ArrowUp") {
        this.cursorComponent.shiftPosition(0, -1);
      } else if (tag === "ArrowRight") {
        this.cursorComponent.shiftPosition(1, 0);
      } else if (tag === "ArrowLeft") {
        this.cursorComponent.shiftPosition(-1, 0);
      } else if (tag === "Enter") {
        this.cursorComponent.shiftPosition(Number.NEGATIVE_INFINITY, 1);
      }
    }
  }
}
