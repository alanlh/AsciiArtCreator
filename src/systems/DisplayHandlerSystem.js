import TextCellComponent from "../components/TextCellComponent.js";

export default class DisplayHandlerSystem extends AsciiEngine.Systems.Map {
  constructor() {
    super("DisplayHandler");
    
    this.width = 0;
    this.height = 0;
  }
  
  startup() {
    let mouseInputModule = this.getEngine().getModule("MouseInput");
    mouseInputModule.signup(this.name, this.getMessageReceiver());
    
    let resourceManager = this.getEngine().getModule(AsciiEngine.Engine.ModuleSlots.ResourceManager);
    
    this.width = resourceManager.get("screen-width");
    this.height = resourceManager.get("screen-height");
  }
  
  shutdown() {
    // Should never be called.
  }
  
  check(entity) {
    return entity.hasComponent(TextCellComponent.type);
  }
  
  preUpdate() {
    this.getMessageReceiver().handleAll();
  }
  
  receiveMessage(tag, body) {
    return;
    if (tag in this.entities) {
      // A mouse event.
      let targetEntity = this.entities[tag];
      let animateComponent = targetEntity.getComponent(AsciiEngine.Components.AsciiAnimate.type);
      let positionComponent = targetEntity.getComponent(AsciiEngine.Components.Position.type);
      if (body.type === "mouseenter") {
        animateComponent.setFrame("blink");
      } else if (body.type === "mouseleave") {
        animateComponent.setFrame("default");
      } else if (body.type === "click") {
        this.getSystemManager().getMessageBoard().post("mouseClick", {x: positionComponent.x, y: positionComponent.y});
      }
    } else if (tag === "cursorPositionChange") {
      // Sent by Cursor controller 
    }
  }
}
