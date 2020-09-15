import AsciiEngine from "../../external/engine.js";

export default class CursorComponent extends AsciiEngine.Component {
  constructor(minX, maxX, minY, maxY) {
    super();

    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;

    this.x = minX;
    this.y = minY;

    this.width = this.maxX - this.minX + 1;
    this.height = this.maxY - this.minY + 1;
  }

  increment() {
    this.x++;
    if (this.x > this.maxX) {
      this.x = this.minX;
      this.y++;
      if (this.y > this.maxY) {
        this.y = this.minY;
      }
    }
  }

  decrement() {
    this.x--;
    if (this.x < this.minX) {
      this.x = this.maxX;
      this.y--;
      if (this.y < this.minY) {
        this.y = this.maxY;
      }
    }
  }

  setPosition(x, y) {
    this.x = Math.max(this.minX, Math.min(x, this.maxX));
    this.y = Math.max(this.minY, Math.min(y, this.maxY));
  }

  shiftPosition(x, y) {
    let posX = this.x + x - this.minX; 
    let posY = this.y + y - this.minY;
    // Use the trick here to prevent negative mods.
    // https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
    posX = ((posX % this.width) + this.width) % this.width;
    posY = ((posY % this.height) + this.height) % this.height;
    this.x = this.minX + posX;
    this.y = this.minY + posY;
  }

  shfitNewLine() {
    this.setPosition(Number.NEGATIVE_INFINITY, this.y);
    this.shiftPosition(0, 1);
  }
}

CursorComponent.type = "Cursor";
