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
    this.charEntitiesByPos = {};
    this.occupiedPos = [];
    this.charSprites = {};

    this.cursorEntity = undefined;
    /**
     * @type CursorComponent
     */
    this.cursorComponent = undefined;

    this.rootEntity = new AsciiEngine.Entity("SpriteEditorRoot");
    this.rootComponent = new AsciiEngine.Components.Position(...position);
    this.rootEntity.setComponent(this.rootComponent);

    this.width = 0;
    this.height = 0;
  }

  startup() {
    let keyboardInput = this.getKeyboardInputModule();
    keyboardInput.signup(this.name, this.getMessageReceiver());

    keyboardInput.subscribe(this.name, keyboardInput.ALL, ["keydown"]);

    let resourceManager = this.getResourceManager();
    this.width = resourceManager.get("_#_#_screen-width");
    this.height = resourceManager.get("_#_#_screen-height");

    this.getEngine().getEntityManager().requestAddEntity(this.rootEntity);

    let isLeadingSpace = true;
    let x = 0;
    let y = 0;
    for (let c of this.text) {
      if (c === "\n") {
        isLeadingSpace = true;
        x = 0;
        y++;
        continue;
      } else if (isLeadingSpace && c !== " ") {
        isLeadingSpace = false;
      }
      if (c === " " && isLeadingSpace) {
        x++;
        continue;
      }
      isLeadingSpace = false;
      this.writeCharAtRelPos(c, [x, y]);
      x++;
    }
  }

  shutdown() {
    let keyboardInput = this.getKeyboardInputModule();
    keyboardInput.withdraw(this.name);

    let entityManager = this.getEngine().getEntityManager();
    entityManager.requestDeleteEntity(this.rootEntity);
  }

  check(entity) {
    return entity.hasComponent(CursorComponent.type);
  }

  has(entity) {
    return entity.hasComponent(CursorComponent.type);
  }

  add(entity) {
    if (entity.hasComponent(CursorComponent.type)) {
      this.cursorEntity = entity;
      this.cursorComponent = entity.getComponent(CursorComponent.type);
    }
  }

  remove(entity) {

  }

  preUpdate() {
    this.getMessageReceiver().handleAll();
  }

  receiveMessage(source, tag, message) {
    if (source === "keydown") {
      if (message.key.length === 1) {
        this.handleCharInsertion(message.key);
      } else if (message.key === "Backspace") {
        this.handleBackspace();
      }
    }
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

  getSpriteId() {
    return this.spriteId;
  }

  /**
   * Shifts the sprite from its original position.
   * The original position is set so that the leftmost character and topmost character
   * are at the first column and row, respective.
   * 
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   */
  setSpritePosition(x, y, z) {
    this.rootComponent.x = x;
    this.rootComponent.y = y;
    this.rootComponent.z = z;
  }

  /**
   * Gets the relative position of an input character.
   * 
   * @returns {Array<number>} The 2D position after accounting for the root offset.
   */
  getCursorRelPosition() {
    return [
      this.cursorComponent.x - this.rootComponent.x,
      this.cursorComponent.y - this.rootComponent.y,
    ];
  }

  handleCharInsertion(char) {
    this.writeCharAtRelPos(char, this.getCursorRelPosition());
    this.cursorComponent.increment();
  }

  /**
   * Overwrites the currently selected character if it exists
   */
  handleBackspace() {
    let [x, y] = this.getCursorRelPosition();
    if (x in this.charsByPos && y in this.charsByPos[x]) {
      this.writeCharAtRelPos(" ", [x, y]);
    }
    this.cursorComponent.decrement();
  }

  writeCharAtRelPos(c, [x, y]) {
    if (!(x in this.charsByPos)) {
      this.charsByPos[x] = {};
      this.charEntitiesByPos[x] = {};
    }
    if (!(y in this.charsByPos[x])) {
      this.occupiedPos.push([x, y]);

      let cEntity = new AsciiEngine.Entity("sprite-char-entity");
      cEntity.setComponent(new AsciiEngine.Components.AsciiRender(
        ["_#_#_" + c], ["_#_#_emptyStyle"], [[0, 0, 0]]
      ));
      cEntity.setComponent(new AsciiEngine.Components.Position(x, y, 0));
      this.rootEntity.addChild(cEntity);
      this.getEngine().getEntityManager().requestAddEntity(cEntity);
      this.charEntitiesByPos[x][y] = cEntity;
    } else {
      let cRender = this.charEntitiesByPos[x][y].getComponent(AsciiEngine.Components.AsciiRender.type);
      cRender.spriteNameList[0] = "_#_#_" + c;
    }
    this.charsByPos[x][y] = c;

    if (!(c in this.charSprites)) {
      let cSprite = new AsciiEngine.GL.Sprite(c, {
        spaceIsTransparent: false,
      });

      this.charSprites[c] = cSprite;
      this.getResourceManager().add("_#_#_" + c, cSprite);
    }
  }

  compile() {
    this.occupiedPos.sort((p1, p2) => {
      return p1[1] - p2[1] || p1[0] - p2[0];
    });

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;

    // First passthrough is to determine the boundaries.
    for (let pos of this.occupiedPos) {
      if (this.charsByPos[pos[0]][pos[1]] !== " ") {
        minX = Math.min(minX, pos[0]);
        minY = Math.min(minY, pos[1]);
      }
    }

    let textArr = [];
    let currY = minY;
    let prevX = minX;
    for (let pos of this.occupiedPos) {
      if (this.charsByPos[pos[0]][pos[1]] === " ") {
        continue;
      }
      if (pos[1] > currY) {
        textArr.push("\n".repeat(pos[1] - currY));
        prevX = minX;
        currY = pos[1];
      }
      if (pos[0] - prevX > 0) {
        textArr.push(" ".repeat(pos[0] - prevX));
      }
      textArr.push(this.charsByPos[pos[0]][pos[1]]);
      prevX = pos[0] + 1;
    }
    this.text = textArr.join("");

    if (textArr.length === 0) {
      minX = -this.rootComponent.x;
      minY = -this.rootComponent.y;
    }
    return {
      id: this.spriteId,
      text: this.text,
      position: [
        this.rootComponent.x + minX,
        this.rootComponent.y + minY,
        this.rootComponent.z,
      ],
    };
  }
}