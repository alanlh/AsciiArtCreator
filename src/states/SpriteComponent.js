export default class SpriteComponent extends AsciiEngine.Component {
  constructor(name) {
    super();
    
    this.name = name;
    this.key = "emptySprite";
  }
}

SpriteComponent.type = "Sprite";
