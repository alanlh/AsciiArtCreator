export default class FrameComponent extends AsciiEngine.Component {
  constructor() {
    super();
    
    this.name = "DefaultFrame";
    
    this.spriteList = [];
    this.styleList = [];
    this.relativePositionList = [];
  }
}

FrameComponent.type = "Frame";
