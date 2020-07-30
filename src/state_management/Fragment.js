import {TypeEnum} from "../Config.js";
import DataStructBase from "./DataObject.js";

export default class Fragment extends DataStructBase {
  constructor() {
    super();
    
    this.templateId = undefined;
    this.frameId = undefined;
    this.spriteId = undefined;
    this.styleId = undefined;
    this.position = [0, 0, 0];
  }
  
  get type() {
    return TypeEnum.Fragment;
  }
  
  get used() {
    return this.spriteId !== undefined && this.styleId !== undefined;
  }
  
  get parent() {
    return this.frameId;
  }
  
  get container() {
    return this.templateId;
  }
}
