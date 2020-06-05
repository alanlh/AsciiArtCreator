export default class StyleComponent extends AsciiEngine.Component {
  constructor() {
    super(name);
    
    this.name = name;
    this.key = "emptyStyle";
  }
}

StyleComponent.type = "Style";
