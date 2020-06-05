export default class TemplateComponent extends AsciiEngine.Component {
  constructor(name) {
    super();
    
    this.name = name;
    
    this.frameName = "";
    
    this.frames = {};
    
    this.visible = false;
  }
}

TemplateComponent.type = "Template";
