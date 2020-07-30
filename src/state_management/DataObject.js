import {TypeEnum} from "../Config.js";

export default class DataStructBase {
  /**
   * Base type for every data type.
   */
  constructor() {
    this.id = generateId();
  }
  
  get type() {
    return TypeEnum.NONE;
  }
  
  get used() {
    return false;
  }
  
  get parent() {
    return undefined;
  }
  
  get container() {
    return this.id;
  }
}

let idx = 0;
function generateId() {
  return "AAC_Object_" + (++idx);
}
