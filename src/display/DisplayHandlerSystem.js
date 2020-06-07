import FrameComponent from "../states/FrameComponent.js";
import TemplateComponent from "../states/TemplateComponent.js";

export default class DisplayHandlerSystem extends AsciiEngine.System {
  // The system in charge of all templates.
  constructor() {
    super("DisplayHandler");
    
    this.width = 0;
    this.height = 0;
    
    this.templates = {};
    this.frames = {};
  }
  
  startup() {
    let resourceManager = this.getEngine().getModule(AsciiEngine.Engine.ModuleSlots.ResourceManager);
    
    this.width = resourceManager.get("screen-width");
    this.height = resourceManager.get("screen-height");
  }
  
  shutdown() {
    // Should never be called.
  }
  
  check(entity) {
    return entity.hasComponent(TemplateComponent.type) ||
      entity.hasComponent(FrameComponent.type);
  }
  
  has(entity) {
    if (entity.hasComponent(TemplateComponent.type)) {
      return entity.id in this.templates;
    } else if (entity.hasComponent(FrameComponent.type)) {
      return entity.id in this.frames;
    }
    return false;
  }
  
  add(entity) {
    if (entity.hasComponent(TemplateComponent.type)) {
      this.templates[entity.id] = entity;
    } else if (entity.hasComponent(FrameComponent.type)) {
      this.frames[entity.id] = entity;
    }
  }
  
  remove(entity) {
    if (entity.hasComponent(TemplateComponent.type)) {
      delete this.templates[entity.id];
    } else if (entity.hasComponent(FrameComponent.type)) {
      delete this.frames[entity.id];
    }
  }
  
  preUpdate() {
    this.getMessageReceiver().handleAll();
  }
  
  receiveMessage(source, tag, body) {
    if (tag === "TemplateShift") {
      let position = entity.getComponent(AsciiEngine.Components.Position.type);
      position.x = body.x;
      position.y = body.y;
      position.z = body.z;
    } else if (tag === "BodyVisibility") {
      let template = this.
      body.value = false;
    }
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
