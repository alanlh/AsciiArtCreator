import { TypeEnum } from "../Config.js";
import DataStructBase from "./DataObject.js";

export default class Sprite extends DataStructBase {
  constructor() {
    super();

    this.name = undefined;
    this.text = "";
    this.setAsBlank = "";
    this.ignoreLeadingSpaces = true;
    this.spaceIsTransparent = true;

    this.cachedPosition = [0, 0, 0];

    this.usages = new Set();
  }

  get type() {
    return TypeEnum.Sprite;
  }

  get used() {
    return this.countUsages() > 0;
  }

  get parent() {
    return undefined;
  }

  get container() {
    return this.id;
  }

  hasUsage(id) {
    return this.usages.has(id);
  }

  addUsage(id) {
    this.usages.add(id);
  }

  removeUsage(id) {
    this.usages.delete(id);
  }

  countUsages() {
    return this.usages.size;
  }
}
