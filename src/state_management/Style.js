import {TypeEnum, SupportedStyles} from "../Config.js";
import DataStructBase from "./DataObject.js";

export default class Style extends DataStructBase {
  constructor() {
    super();
    
    this.name = undefined;
    this.properties = {};
    for (let styleType in SupportedStyles) {
      this.properties[SupportedStyles[styleType].key] = undefined;
    }
    
    this.usages = new Set();
  }
  
  get type() {
    return TypeEnum.Style;
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
  
  setProperty(propName, value) {
    if (propName in this.properties) {
      this.properties[propName] = value;
    }
  }
  
  setStyles(values) {
    for (let styleType in SupportedStyles) {
      let styleKey = SupportedStyles[styleType].key;
      if (styleKey in values && values[styleKey]) {
        this.properties[styleKey] = values[styleKey];
      } else {
        this.properties[styleKey] = undefined;
      }
    }
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
