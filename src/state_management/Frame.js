import {TypeEnum} from "../Config.js";
import DataStructBase from "./DataObject.js";

export default class Frame extends DataStructBase {
  constructor() {
    super();
    
    this.fragIds = new Set();
    this.templateId = undefined;
    this.isActiveFrame = false;
  }
  
  get type() {
    return TypeEnum.Frame;
  }
  
  get used() {
    return this.isActiveFrame;
  }
  
  get parent() {
    return this.templateId;
  }
  
  get container() {
    return this.templateId;
  }
  
  addFragment(id) {
    if (this.fragIds.has(id)) {
      return false;
    }
    this.fragIds.add(id);
    return true;
  }
  
  removeFragment(id) {
    if (!this.fragIds.has(id)) {
      return false;
    }
    this.fragIds.delete(id);
    return true;
  }
}
