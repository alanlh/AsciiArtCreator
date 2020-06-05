export default class BlinkerComponent extends AsciiEngine.Component {
  constructor(onDuration, offDuration) {
    super();
    
    this.onDuration = onDuration;
    this.offDuration = offDuration;
    this.on = true;
    this.timer = this.onDuration;
  }
  
  tick() {
    this.timer --;
    if (this.timer <= 0) {
      if (this.on) {
        this.on = false;
        this.timer = this.offDuration;
      } else {
        this.on = true;
        this.timer = this.onDuration;
      }
      return true;
    }
    return false;
  }
}

BlinkerComponent.type = "Blink";
