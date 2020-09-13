import AsciiEngine from "../../external/engine.js";

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

    this.subscribe(["KeyboardEvent", undefined, "keydown", "Arrow"], this._handleArrow, true);
    this.subscribe(["KeyboardEvent", undefined, "keydown", "Backspace"], this._handleBackspace, true);
    this.subscribe(["KeyboardEvent", undefined, "keydown", "Enter"], this._handleEnter, true);

    this.subscribe(["MouseEvent", undefined, "click"], this._handleClick, true);

    let blinkerSystem = new BlinkerSystem();
    this.getSystemManager().addSystem(blinkerSystem);
  }

  postUpdate() {
    let positionComponent = this.cursorEntity.getComponent(AsciiEngine.Components.Position.type);
    positionComponent.x = this.cursorComponent.x;
    positionComponent.y = this.cursorComponent.y;
  }

  _handleArrow(body) {
    if (body.event.key === "ArrowDown") {
      this.cursorComponent.shiftPosition(0, 1);
    } else if (body.event.key === "ArrowUp") {
      this.cursorComponent.shiftPosition(0, -1);
    } else if (body.event.key === "ArrowRight") {
      this.cursorComponent.shiftPosition(1, 0);
    } else if (body.event.key === "ArrowLeft") {
      this.cursorComponent.shiftPosition(-1, 0);
    }
  }

  _handleBackspace(body) {
    // ???
  }

  _handleEnter() {
    this.cursorComponent.shiftPosition(Number.NEGATIVE_INFINITY, 1);
  }

  _handleClick(body) {
    this.cursorComponent.setPosition(body.coords.x, body.coords.y);
  }
}
