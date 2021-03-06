import { TypeEnum, TypeConfig, SupportedStyles } from "../Config.js";
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

    // Maps Ids to TypeEnum.
    // The only TypeEnums should be Template, Sprite, and Style
    this._changedIds = {};
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

  getChangedIds() {
    let changed = this._changedIds;
    this._changedIds = {};
    return changed;
  }

  _markChanged(obj) {
    this._changedIds[obj.container] = TypeConfig[obj.type].containerType;
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
        template.addFrame(dataObj);
        if (template.activeFrame === undefined) {
          template.activeFrame = dataObj.id;
          dataObj.isActiveFrame = true;
        }
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
    this._markChanged(dataObj);
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
    this._deleteInternal(id, true);
  }

  _deleteInternal(delId, modifyReferences) {
    let delObj = this._objects[delId];
    let type = this._typeIndex[delId];
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
          this._objects[fragId].styleId = undefined;
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

    this._markChanged(delObj);
    if (type === TypeEnum.Sprite || type === TypeEnum.Style) {
      for (let usingId of delObj.usages) {
        this._markChanged(this._objects[usingId]);
      }
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
    this._markChanged(this._objects[changingId]);
    if (type === TypeEnum.Sprite || type === TypeEnum.Style) {
      for (let usingId of this._objects[changingId].usages) {
        this._markChanged(this._objects[usingId]);
      }
    }
  }

  copy(type, idToCopy) {
    idToCopy = idToCopy || this._selectedIds[type];
    if (idToCopy === undefined) {
      Log.warn("No id selected");
      return;
    }
    type = this.getType(idToCopy);

    let oldObj = this._objects[idToCopy];
    let newObj = new DataConstructors[type]();

    if (TypeConfig[type].hasGlobalName) {
      let newName = Funcs.getFreeName(oldObj.name, this._nameIndex);
      this._nameIndex[newName] = newObj.id;
      newObj.name = newName;
    } else if (TypeConfig[type].hasLocalName) {
      if (type === TypeEnum.Frame) {
        let parentId = oldObj.parent;
        let template = this._objects[parentId];
        let newName = Funcs.getFreeName(oldObj.name, template.framesByName);
        newObj.name = newName;
        newObj.templateId = parentId;
        template.addFrame(newObj);
      }
    }

    if (type === TypeEnum.Fragment) {
      this._objects[oldObj.frameId].addFragment(newObj.id);
      newObj.templateId = oldObj.templateId;
      newObj.frameId = oldObj.frameId;
    }

    this._objects[newObj.id] = newObj;
    this._typeIndex[newObj.id] = type;
    this._markChanged(newObj);

    // Perform deep copies.
    switch (type) {
      case TypeEnum.Template:
        this._copyTemplate(newObj, oldObj);
        break;
      case TypeEnum.Frame:
        this._copyFrame(newObj, oldObj);
        break;
      case TypeEnum.Fragment:
        this._copyFragment(newObj, oldObj);
        break;
      case TypeEnum.Sprite:
        this._copySprite(newObj, oldObj);
        break;
      case TypeEnum.Style:
        this._copyStyle(newObj, oldObj);
        break;
    }

    return newObj.id;
  }

  _copyTemplate(newTemplate, oldTemplate) {
    for (let id in oldTemplate.framesById) {
      let oldFrame = this._objects[id];
      let newFrame = new Frame();
      newFrame.templateId = newTemplate.id;
      newFrame.name = oldFrame.name;

      this._objects[newFrame.id] = newFrame;
      this._typeIndex[newFrame.id] = TypeEnum.Frame;
      this._markChanged(newFrame);

      this._copyFrame(newFrame, oldFrame);
      newFrame.isActiveFrame = oldFrame.isActiveFrame;
      if (newFrame.isActiveFrame) {
        newTemplate.activeFrame = newFrame.id;
      }
      newTemplate.addFrame(newFrame);
    }

    newTemplate.position = [...oldTemplate.position];
    newTemplate.visible = oldTemplate.visible;
  }

  _copyFrame(newFrame, oldFrame) {
    for (let fragId of oldFrame.fragIds) {
      let oldFrag = this._objects[fragId];
      let newFrag = new Fragment();
      newFrag.frameId = newFrame.id;
      newFrag.templateId = newFrame.parent;
      newFrame.addFragment(newFrag.id);

      this._objects[newFrag.id] = newFrag;
      this._typeIndex[newFrag.id] = TypeEnum.Fragment;
      this._markChanged(newFrag);

      this._copyFragment(newFrag, oldFrag);
    }
    newFrame.isActiveFrame = false;
  }

  _copyFragment(newFragment, oldFragment) {
    let oldSprite = this.getFragmentSprite(oldFragment.id);
    this.setFragmentSprite(oldSprite, newFragment.id);

    let oldStyle = this.getFragmentStyle(oldFragment.id);
    this.setFragmentStyle(oldStyle, newFragment.id);
    
    let oldPosition = this.getFragmentPosition(oldFragment.id);
    this.setFragmentPosition(oldPosition, newFragment.id);
  }

  _copySprite(newSprite, oldSprite) {
    newSprite.text = oldSprite.text;
    newSprite.setAsBlank = oldSprite.setAsBlank;
    newSprite.ignoreLeadingSpaces = oldSprite.ignoreLeadingSpaces;
    newSprite.spaceIsTransparent = oldSprite.spaceIsTransparent;
    newSprite.spaceHasFormatting = oldSprite.spaceHasFormatting;

    newSprite.cachedPosition = [...oldSprite.cachedPosition];
  }

  _copyStyle(newStyle, oldStyle) {
    for (let propType in SupportedStyles) {
      let key = SupportedStyles[propType].key;
      newStyle.properties[key] = oldStyle.properties[key];
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

        this._markChanged(template);
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

        this._markChanged(template);
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

              this._markChanged(template);
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

        this._markChanged(fragment);
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

        this._markChanged(fragment);
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

        this._markChanged(fragment);
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
          this._spriteBeingModified = undefined;
        } else {
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

        this._markChanged(sprite);
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

        this._markChanged(sprite);
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

        this._markChanged(sprite);
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
        this._markChanged(sprite);
      }
    );
  }

  getSpriteSpaceHasFormatting(spriteId) {
    return this._checkExistenceThenCallback(
      spriteId || this._selectedIds[TypeEnum.Sprite], TypeEnum.Sprite,
      (sprite) => {
        return sprite.spaceHasFormatting;
      }
    )
  }

  setSpriteSpaceHasFormatting(value, spriteId) {
    return this._checkExistenceThenCallback(
      spriteId || this._selectedIds[TypeEnum.Sprite], TypeEnum.Sprite,
      (sprite) => {
        sprite.spaceHasFormatting = !!value;
        this._markChanged(sprite);
      }
    )
  }

  getSpriteCachedPosition(spriteId) {
    return this._checkExistenceThenCallback(
      spriteId || this._selectedIds[TypeEnum.Sprite], TypeEnum.Sprite,
      (sprite) => {
        return [...sprite.cachedPosition];
      }
    )
  }

  setSpriteCachedPosition([x, y, z], spriteId) {
    return this._checkExistenceThenCallback(
      spriteId || this._selectedIds[TypeEnum.Sprite], TypeEnum.Sprite,
      (sprite) => {
        sprite.cachedPosition[0] = x;
        sprite.cachedPosition[1] = y;
        sprite.cachedPosition[2] = z;
      }
    )
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

        this._markChanged(style);
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
