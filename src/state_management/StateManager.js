import {TypeEnum, TypeConfig, SupportedStyles} from "../Config.js";
import Log from "../Logging.js";

import Funcs from "../utils/Funcs.js";

import Template from "./Template.js";
import Frame from "./Frame.js";
import Fragment from "./Fragment.js";
import Sprite from "./Sprite.js";
import Style from "./Style.js";

export default class StateManager {
  constructor() {
    this._selectedIds = {};
    for (let type in TypeEnum) {
      this._selectedIds[TypeEnum[type]] = undefined;
    }
    
    this._objects = {};
    this._typeIndex = {};
    this._containerIndex = {};
    
    this._nameIndex = {};
    this._usageIndex = {};
    
    this._spriteBeingModified = undefined;
    
    // TODO:
    this._changedTemplates = new Set();
    this._changedSprites = new Set();
    this._changedStyles = new Set();
  }
  
  hasId(id) {
    return id in this._objects;
  }
  
  hasIdOfType(id, type) {
    return id in this._objects && this._typeIndex[id] === type;
  }
  
  hasGlobalName(name) {
    return name in this._nameIndex;
  }
  
  getName(id) {
    return this._objects[id].name;
  }
  
  getNameOfType(id, type) {
    if (id in this._typeIndex && this._typeIndex[id] === type) {
      return this._nameIndex[id];
    }
    return undefined;
  }
  
  getSelectedId(type) {
    return this._selectedIds[type];
  }
  
  getAEObject(id) {
    // TODO:
  }
  
  getUsed(id) {
    if (id in this._objects) {
      return this._objects[id].used;
    }
    return false;
  }
  
  getType(id) {
    if (id in this._objects) {
      return this._typeIndex[id];
    }
  }
  
  getAllIds(type) {
    let ids = new Set();
    for (let id in this._objects) {
      if (this._typeIndex[id] === type) {
        ids.add(id);
      }
    }
    return ids;
  }
  
  getIdFromName(name) {
    return this._nameIndex[name];
  }
  
  getIdOfTypeFromName(name, type) {
    if (name in this._nameIndex) {
      if (this._typeIndex[this._nameIndex[name]] === type) {
        return this._nameIndex[name];
      }
    }
    return undefined;
  }

  getTemplateFrameIds(tempId) {
    if (this._typeIndex[tempId] === TypeEnum.Template) {
      return new Set(Object.keys(this._objects[tempId].framesById));
    }
    return new Set();
  }
  
  getFrameFragmentIds(frameId) {
    if (this._typeIndex[frameId] === TypeEnum.Frame) {
      return new Set(this._objects[frameId].fragIds);
    }
    return new Set();
  }
  
  getSpriteUsages(spriteId) {
    if (this._typeIndex[spriteId] === TypeEnum.Sprite) {
      return new Set(this._objects[spriteId].usages);
    }
    return new Set();
  }
  
  getStyleUsages(styleId) {
    if (this._typeIndex[styleId] === TypeEnum.Style) {
      return new Set(this._objects[styleId].usages);
    }
    return new Set();
  }

  click(id) {
    if (!this.hasId(id)) {
      Log.error("Invalid id clicked.");
      return;
    }
    let type = this._typeIndex[id];
    if (this._selectedIds[type] === id) {
      this._selectedIds[type] = undefined;
    } else {
      this._selectedIds[type] = id;
    }
    if (type === TypeEnum.Template) {
      this._selectedIds[TypeEnum.Frame] = undefined;
      this._selectedIds[TypeEnum.Fragment] = undefined;
    } else if (type === TypeEnum.Frame) {
      this._selectedIds[TypeEnum.Fragment] = undefined;
    }
  }
  
  create(type, name = "[Blank]", sameNameRequired = false) {
    if (!name) {
      Log.warn("Empty names are not allowed.");
      return undefined;
    }
    let dataObj = new DataConstructors[type]();

    if (TypeConfig[type].hasGlobalName) {
      if (sameNameRequired && this.hasGlobalName(name)) {
        return undefined;
      }
      name = Funcs.getFreeName(name, this._nameIndex);
      this._nameIndex[name] = dataObj.id;
      dataObj.name = name;
    } else if (TypeConfig[type].hasLocalName) {
      if (type === TypeEnum.Frame) {
        let parentId = this._selectedIds[TypeEnum.Template];
        if (parentId === undefined) {
          return;
        }
        let template = this._objects[parentId];
        if (sameNameRequired && name in template.framesByName) {
          return;
        }
        name = Funcs.getFreeName(name, template.framesByName);
        dataObj.name = name;
        dataObj.templateId = parentId;
        template.framesById[dataObj.id] = dataObj.name;
        template.framesByName[dataObj.name] = dataObj.id;
      }
      // Shouldn't be any other case...
    }
    if (type === TypeEnum.Fragment) {
      let templateId = this._selectedIds[TypeEnum.Template];
      let frameId = this._selectedIds[TypeEnum.Frame];
      if (templateId === undefined || frameId === undefined) {
        return;
      }
      this._objects[frameId].addFragment(dataObj.id);
      dataObj.templateId = templateId;
      dataObj.frameId = frameId;
    }
    
    this._objects[dataObj.id] = dataObj;
    this._typeIndex[dataObj.id] = type;
    return dataObj.id;
  }
  
  deleteSelected(type, id) {
    let delId = id || this._selectedIds[type];
    if (delId !== undefined) {
      this.delete(delId);
      this._selectedIds[type] = undefined;
      if (type === TypeEnum.Template) {
        this._selectedIds[TypeEnum.Frame] = undefined;
        this._selectedIds[TypeEnum.Fragment] = undefined;
      } else if (type === TypeEnum.Frame) {
        this._selectedIds[TypeEnum.Fragment] = undefined;
      }
    } else {
      Log.warn("Attempting to delete non-existent object.");
    }
    return delId;
  }
  
  delete(id) {
    if (!(id in this._objects)) {
      Log.warn("Attempting to delete non-existent object.");
      return;
    }
    let type = this._typeIndex[id];
    this._deleteInternal(id, type, true);
  }
  
  _deleteInternal(delId, type, modifyReferences) {
    let delObj = this._objects[delId];
    if (delObj === undefined) {
      Log.error("Attempting to delete non-existent object.");
    }
    
    // These are when other obj is ALWAYS impacted.
    switch (type) {
      case TypeEnum.Template:
        for (let frameId in delObj.framesById) {
          this._deleteInternal(frameId, TypeEnum.Frame, false);
        }
        break;
      case TypeEnum.Frame:
        for (let fragId of delObj.fragIds) {
          this._deleteInternal(fragId, TypeEnum.Fragment, false);
        }
        break;
      case TypeEnum.Fragment:
        if (delObj.spriteId) {
          this._objects[delObj.spriteId].removeUsage(delObj.id);
        }
        if (delObj.styleId) {
          this._objects[delObj.styleId].removeUsage(delObj.id);
        }
        break;
      case TypeEnum.Sprite:
        for (let fragId of delObj.usages) {
          this._objects[fragId].spriteId = undefined;
        }
        break;
      case TypeEnum.Style:
        for (let fragId of delObj.usages) {
          this._objects[fragId].spriteId = undefined;
        }
        break;
    }
    
    // These should only happen if this is the initial object being deleted.
    if (modifyReferences) {
      switch (type) {
        case TypeEnum.Frame:
          this._objects[delObj.templateId].removeFrame(delObj.id);
          break;
        case TypeEnum.Fragment:
          this._objects[delObj.frameId].removeFragment(delObj.id);
          break;
      }
    }
    
    delete this._objects[delId];
    delete this._typeIndex[delId];
    if (TypeConfig[type].hasGlobalName) {
      delete this._nameIndex[delObj.name];
    }
  }
  
  renameSelected(type, newName) {
    let changingId = this._selectedIds[type];
    if (changingId === undefined) {
      Log.warn("No id selected.");
      return;
    }
    
    if (TypeConfig[type].hasGlobalName) {
      if (newName in this._nameIndex) {
        Log.warn("Another object already uses this name.")
        return;
      }
      let oldName = this._objects[changingId].name;
      this._objects[changingId].name = newName;
      this._nameIndex[newName] = changingId;
      delete this._nameIndex[oldName];
    }
    
    if (type === TypeEnum.Frame) {
      let frame = this._objects[changingId];
      let oldName = frame.name;
      let parent = this._objects[frame.templateId];
      if (parent.renameFrame(oldName, newName)) {
        frame.name = newName;
      } else {
        Log.warn("Another object already uses this name.")
      }
    }
  }
  
  getTemplateVisibility(tempId) {
    return this._checkExistenceThenCallback(
      tempId || this._selectedIds[TypeEnum.Template], TypeEnum.Template, 
      (template) => {
        return template.visible;
      }
    );
  }
  
  setTemplateVisibility(value, tempId) {
    return this._checkExistenceThenCallback(
      tempId || this._selectedIds[TypeEnum.Template], TypeEnum.Template, 
      (template) => {
        template.visible = !!value;
      }
    );
  }
  
  getTemplatePosition(tempId) {
    return this._checkExistenceThenCallback(
      tempId || this._selectedIds[TypeEnum.Template], TypeEnum.Template, 
      (template) => {
        return [...template.position];
      }
    );
  }
  
  setTemplatePosition([x, y, z], tempId) {
    return this._checkExistenceThenCallback(
      tempId || this._selectedIds[TypeEnum.Template], TypeEnum.Template, 
      (template) => {
        template.position[0] = x;
        template.position[1] = y;
        template.position[2] = z;
      }
    );
  }
  
  getTemplateActiveFrame(tempId) {
    return this._checkExistenceThenCallback(
      tempId || this._selectedIds[TypeEnum.Template], TypeEnum.Template, 
      (template) => {
        return template.activeFrame;
      }
    );
  }
  
  setTemplateActiveFrame(frameId, tempId) {
    return this._checkExistenceThenCallback(
      tempId || this._selectedIds[TypeEnum.Template], TypeEnum.Template, 
      (template) => {
        return this._checkExistenceThenCallback(
          frameId || this._selectedIds[TypeEnum.Frame], TypeEnum.Frame, 
          (frame) => {
            if (frame.parent === template.id) {
              let oldActiveFrameId = template.activeFrame;
              if (oldActiveFrameId) {
                this._objects[oldActiveFrameId].isActiveFrame = false;
              }
              template.activeFrame = frame.id;
              frame.isActiveFrame = true;
            }
          }
        );
      }
    );
  }
  
  getFragmentSprite(fragId) {
    return this._checkExistenceThenCallback(
      fragId || this._selectedIds[TypeEnum.Fragment], TypeEnum.Fragment, 
      (fragment) => {
        let spriteId = fragment.spriteId;
        if (spriteId && spriteId in this._objects 
          && this._typeIndex[spriteId] === TypeEnum.Sprite) {
          return this._objects[spriteId].name;
        }
      }
    );
  }
  
  setFragmentSprite(spriteName, fragId) {
    return this._checkExistenceThenCallback(
      fragId || this._selectedIds[TypeEnum.Fragment], TypeEnum.Fragment, 
      (fragment) => {
        if (spriteName in this._nameIndex) {
          if (this._typeIndex[this._nameIndex[spriteName]] !== TypeEnum.Sprite) {
            Log.warn("Name does not belong to any sprite");
            return;
          }
        } else if (spriteName) {
          Log.warn("Name does not exist.");
          return;
        }
        let spriteId = (spriteName) ? this._nameIndex[spriteName] : undefined;
        let previousSprite = fragment.spriteId;
        if (previousSprite) {
          this._objects[previousSprite].removeUsage(fragment.id);
        }
        fragment.spriteId = spriteId;
        if (spriteId) {
          this._objects[fragment.spriteId].addUsage(fragment.id);
        }
        return true;
      }
    );
  }
  
  getFragmentStyle(fragId) {
    return this._checkExistenceThenCallback(
      fragId || this._selectedIds[TypeEnum.Fragment], TypeEnum.Fragment, 
      (fragment) => {
        let styleId = fragment.styleId;
        if (styleId && styleId in this._objects 
          && this._typeIndex[styleId] === TypeEnum.Style) {
          return this._objects[styleId].name;
        }
      }
    );
  }
  
  setFragmentStyle(styleName, fragId) {
    return this._checkExistenceThenCallback(
      fragId || this._selectedIds[TypeEnum.Fragment], TypeEnum.Fragment, 
      (fragment) => {
        if (styleName in this._nameIndex) {
          if (this._typeIndex[this._nameIndex[styleName]] !== TypeEnum.Style) {
            Log.warn("Name does not belong to any style");
            return;
          }
        } else if (styleName) {
          Log.warn("Name does not exist.");
          return;
        }
        let styleId = (styleName) ? this._nameIndex[styleName] : undefined;
        let previousStyle = fragment.styleId;
        if (previousStyle) {
          this._objects[previousStyle].removeUsage(fragment.id);
        }
        fragment.styleId = styleId;
        if (styleId) {
          this._objects[fragment.styleId].addUsage(fragment.id);
        }
        return true;
      }
    );
  }
  
  getFragmentPosition(fragId) {
    return this._checkExistenceThenCallback(
      fragId || this._selectedIds[TypeEnum.Fragment], TypeEnum.Fragment, 
      (fragment) => {
        return [...fragment.position];
      }
    );
  }
  
  setFragmentPosition([x, y, z], fragId) {
    return this._checkExistenceThenCallback(
      fragId || this._selectedIds[TypeEnum.Fragment], TypeEnum.Fragment, 
      (fragment) => {
        fragment.position[0] = x;
        fragment.position[1] = y;
        fragment.position[2] = z;
        return true;
      }
    );
  }
  
  isSpriteBeingModified(spriteId) {
    return this._spriteBeingModified !== undefined 
      && (spriteId === undefined || spriteId === this._spriteBeingModified);
  }
  
  getSpriteBeingModified() {
    return this._spriteBeingModified;
  }
  
  toggleSpriteBeingModified(spriteId) {
    return this._checkExistenceThenCallback(
      spriteId || this._selectedIds[TypeEnum.Sprite], TypeEnum.Sprite, 
      (sprite) => {
        if (sprite.id === this._spriteBeingModified) {
          // TODO: Stop and save the current value?
          this._spriteBeingModified = undefined;
        } else {
          // TODO: Save the current modified sprite if necessary, and create a new modifier.
          this._spriteBeingModified = sprite.id;
        }
      }
    );
  }

  getSpriteText(spriteId) {
    return this._checkExistenceThenCallback(
      spriteId || this._selectedIds[TypeEnum.Sprite], TypeEnum.Sprite, 
      (sprite) => {
        return sprite.text;
      }
    );
  }
  
  setSpriteText(value, spriteId) {
    return this._checkExistenceThenCallback(
      spriteId || this._selectedIds[TypeEnum.Sprite], TypeEnum.Sprite, 
      (sprite) => {
        sprite.text = value;
      }
    );
  }

  getSpriteSetAsBlank(spriteId) {
    return this._checkExistenceThenCallback(
      spriteId || this._selectedIds[TypeEnum.Sprite], TypeEnum.Sprite, 
      (sprite) => {
        return sprite.setAsBlank;
      }
    );
  }
  
  setSpriteSetAsBlank(value, spriteId) {
    return this._checkExistenceThenCallback(
      spriteId || this._selectedIds[TypeEnum.Sprite], TypeEnum.Sprite, 
      (sprite) => {
        sprite.setAsBlank = value;
      }
    );
  }

  getSpriteSpaceIsTransparent(spriteId) {
    return this._checkExistenceThenCallback(
      spriteId || this._selectedIds[TypeEnum.Sprite], TypeEnum.Sprite, 
      (sprite) => {
        return sprite.spaceIsTransparent;
      }
    );
  }
  
  setSpriteSpaceIsTransparent(value, spriteId) {
    return this._checkExistenceThenCallback(
      spriteId || this._selectedIds[TypeEnum.Sprite], TypeEnum.Sprite, 
      (sprite) => {
        sprite.spaceIsTransparent = !!value;
      }
    );
  }

  getSpriteIgnoreLeadingSpaces(spriteId) {
    return this._checkExistenceThenCallback(
      spriteId || this._selectedIds[TypeEnum.Sprite], TypeEnum.Sprite, 
      (sprite) => {
        return sprite.ignoreLeadingSpaces;
      }
    );
  }
  
  setSpriteIgnoreLeadingSpaces(value, spriteId) {
    return this._checkExistenceThenCallback(
      spriteId || this._selectedIds[TypeEnum.Sprite], TypeEnum.Sprite, 
      (sprite) => {
        sprite.ignoreLeadingSpaces = !!value;
      }
    );
  }

  getStyleProperty(propertyName, styleId) {
    return this._checkExistenceThenCallback(
      styleId || this._selectedIds[TypeEnum.Style], TypeEnum.Style, 
      (style) => {
        return style.properties[propertyName];
      }
    );
  }
  
  setStyleProperty(propertyName, value, styleId) {
    return this._checkExistenceThenCallback(
      styleId || this._selectedIds[TypeEnum.Style], TypeEnum.Style, 
      (style) => {
        style.setProperty(propertyName, value);
      }
    );
  }
  
  _checkExistenceThenCallback(id, type, callback) {
    if (!(id in this._objects) || this._objects[id].type !== type) {
      Log.warn("No valid objects found.");
      return;
    }
    return callback(this._objects[id]);
  }
}

const DataConstructors = {
  [TypeEnum.Template]: Template,
  [TypeEnum.Frame]: Frame,
  [TypeEnum.Fragment]: Fragment,
  [TypeEnum.Sprite]: Sprite,
  [TypeEnum.Style]: Style,
}
