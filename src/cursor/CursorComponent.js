export default class CursorComponent extends AsciiEngine.Component {
  constructor(minX, maxX, minY, maxY) {
    super();

    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;

    this.x = minX;
    this.y = minY;
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
    this.x = this.minX + (this.x + x - this.minX) % (this.maxX - this.minX + 1);
    this.y = this.minY + (this.y + y - this.minY) % (this.maxY - this.minY + 1);
  }

  shfitNewLine() {
    this.setPosition(Number.NEGATIVE_INFINITY, this.y);
    this.shiftPosition(0, 1);
  }
}

CursorComponent.type = "Cursor";
