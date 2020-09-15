import {TypeEnum} from "../Config.js";
import DataStructBase from "./DataObject.js";

export default class Template extends DataStructBase {
  constructor() {
    super();

    this.name = undefined;
    this.framesById = {};
    this.framesByName = {};
    this.position = [0, 0, 0];
    this.visible = false;
    this.activeFrame = undefined;
  }
  
  get type() {
    return TypeEnum.Template;
  }
  
  get used() {
    return this.visible;
  }
  
  get parent() {
    return undefined;
  }
  
  get container() {
    return this.id;
  }
  
  addFrame(frame) {
    if (frame.id in this.framesById || frame.name in this.framesByName) {
      return false;
    }
    this.framesById[frame.id] = frame.name;
    this.framesByName[frame.name] = frame.id;
    return true;
  }
  
  renameFrame(oldName, newName) {
    if (newName in this.framesByName) {
      return false;
    }
    if (!(oldName in this.framesByName)) {
      return false;
    }
    let id = this.framesByName[oldName];
    delete this.framesByName[oldName];
    this.framesByName[newName] = id;
    this.framesById[id] = newName;
    return true;
  }
  
  removeFrame(frameId) {
    if (!(frameId in this.framesById)) {
      return false;
    }
    if (this.activeFrame === frameId) {
      this.activeFrame = undefined;
    }
    let frameName = this.framesById[frameId];
    delete this.framesById[frameId];
    delete this.framesByName[frameName];
    return true;
  }
}
