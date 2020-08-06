import CursorComponent from "../cursor/CursorComponent.js";

export default class SpriteEditorSystem extends AsciiEngine.System {
  /**
   * 
   * @param {string} text 
   */
  constructor(id, text, position) {
    super("SpriteEditor");

    this.spriteId = id;
    this.text = text;
    this.charsByPos = {};
    
    this.cursorEntity = undefined;

    this.rootEntity = new AsciiEngine.Entity("SpriteEditorRoot");
    this.rootEntity.setComponent(new AsciiEngine.Components.Position(0, 0, 0));
  }
  
  startup() {
    let keyboardInput = this.getKeyboardInputModule();
    keyboardInput.signup(this.name, this.getMessageReceiver());
    
    keyboardInput.subscribe(this.name, keyboardInput.ALL, ["keydown"]);
    console.log("Starting a new sprite editor with text:", this.text);

    
  }
  
  shutdown() {
    let keyboardInput = this.getKeyboardInputModule();
    keyboardInput.withdraw(this.name);
    console.log("Shutting down sprite editor with text: ", this.text);
  }
  
  check(entity) {
    return entity.hasComponent(CursorComponent.type);
  }
  
  has(entity) {
    return entity.hasComponent(CursorComponent.type);
  }
  
  add(entity) {
    this.cursorEntity = entity;
  }
  
  remove(entity) {
    
  }
  
  preUpdate(entity) {
    
  }
  
  getResourceManager() {
    return this.getEngine().getModule(AsciiEngine.Engine.ModuleSlots.ResourceManager);
  }
  
  getKeyboardInputModule() {
    return this.getEngine().getModule("KeyboardInput");
  }
  
  getStateManager() {
    return this.getEngine().getModule("StateManager");
  }
  
  getCursorPosition() {
    if (this.cursorEntity) {
      let cursorComponent = this.cursor.getComponent(CursorComponent.type);
      return {
        x: cursorComponent.x,
        y: cursorComponent.y,
      }
    }
  }
  
  /**
   * Returns the current display as a string.
   * 
   * @returns {string}
   */
  getText() {
    return this.text;
  }

  getSpriteId() {
    return this.spriteId;
  }
}
