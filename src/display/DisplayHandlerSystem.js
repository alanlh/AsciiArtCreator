import AsciiEngine from "../../external/engine.js";

import StateManager from "../state_management/StateManager.js";

import {TypeEnum, SupportedStyles} from "../Config.js";

export default class DisplayHandlerSystem extends AsciiEngine.System {
  // The system in charge of all templates.
  constructor() {
    super("DisplayHandler");
    
    this.templates = {};
    this.sprites = {};
    this.styles = {};
  }
  
  check(entity) {
    // Should never encounter entities beyond the ones it owns directly.
    return false;
  }
  
  has(entity) {
    return false;
  }
  
  preUpdate() {
    let stateManager = this.getStateManager();
    let changedIds = stateManager.getChangedIds();
    for (let id in changedIds) {
      if (changedIds[id] === TypeEnum.Template) {
        this.updateTemplate(stateManager, id);
      } else if (changedIds[id] === TypeEnum.Sprite) {
        this.updateSprite(stateManager, id);
      } else if (changedIds[id] === TypeEnum.Style) {
        this.updateStyle(stateManager, id);
      }
    }
  }
  
  updateTemplate(stateManager, id) {
    if (stateManager.hasId(id)) {
      let templateEntity;
      if (id in this.templates) {
        templateEntity = this.templates[id];
      } else {
        templateEntity = new AsciiEngine.Entity("Template");
        let pos = new AsciiEngine.Components.Position(0, 0, 0);
        templateEntity.setComponent(pos);
        this.getEngine().getEntityManager().requestAddEntity(templateEntity);
        this.templates[id] = templateEntity;
      }
      // Update
      let pos = stateManager.getTemplatePosition(id);
      let posComponent = templateEntity.getComponent(AsciiEngine.Components.Position.type);
      posComponent.x = pos[0];
      posComponent.y = pos[1];
      posComponent.z = pos[2];
      let spriteNames = [];
      let styleNames = [];
      let positions = [];
      let activeFrameId = stateManager.getTemplateActiveFrame(id);
      if (activeFrameId) {
        let fragIds = stateManager.getFrameFragmentIds(activeFrameId);
        for (let fragId of fragIds) {
          let spriteName = stateManager.getFragmentSprite(fragId);
          let styleName = stateManager.getFragmentStyle(fragId);
          let position = stateManager.getFragmentPosition(fragId);
          if (spriteName && styleName) {
            spriteNames.push(spriteName);
            styleNames.push(styleName);
            positions.push([...position]);
          }
        }
      }
      // Deactivate the current renderComponent to prevent it from being shown.
      // TODO: Is there a better way to have the new component appear immediately?
      // Right now the old component is maintained until the next game update.
      let currentRenderComponent = templateEntity.getComponent(AsciiEngine.Components.AsciiRender.type);
      if (currentRenderComponent) {
        currentRenderComponent.visible = false;
      }
      let renderComponent = new AsciiEngine.Components.AsciiRender(
        spriteNames, styleNames, positions
      );
      let visible = stateManager.getTemplateVisibility(id);
      renderComponent.visible = visible;
      templateEntity.setComponent(renderComponent);
    } else {
      // Delete
      if (id in this.templates) {
        this.templates[id].markForDeletion();
      }
    }
  }
  
  updateSprite(stateManager, id) {
    let resourceManager = this.getResourceManager();
    if (stateManager.hasId(id)) {
      if (!(id in this.sprites)) {
        // Create
        let spriteName = stateManager.getName(id);
        this.sprites[id] = spriteName;
      }
      // Update
      let spriteName = stateManager.getName(id);
      if (this.sprites[id] !== spriteName) {
        resourceManager.delete(spriteName);
        this.sprites[id] = spriteName;
      }
      
      let text = stateManager.getSpriteText(id);
      let setAsBlank = stateManager.getSpriteSetAsBlank(id);
      let spaceIsTransparent = stateManager.getSpriteSpaceIsTransparent(id);
      let ignoreLeadingSpaces = stateManager.getSpriteIgnoreLeadingSpaces(id);
      let spaceHasFormatting = stateManager.getSpriteSpaceHasFormatting(id);
      let sprite = new AsciiEngine.GL.Sprite(text, {
        setAsBlank: setAsBlank,
        spaceIsTransparent: spaceIsTransparent,
        ignoreLeadingSpaces: ignoreLeadingSpaces,
        spaceHasFormatting: spaceHasFormatting,
      });
      
      resourceManager.add(spriteName, sprite);
    } else {
      // Delete
      let name = this.sprites[id];
      if (!name) {
        return;
      }
      resourceManager.delete(name);
      delete this.sprites[id];
    }
  }
  
  updateStyle(stateManager, id) {
    let resourceManager = this.getResourceManager();
    if (stateManager.hasId(id)) {
      if (!(id in this.styles)) {
        // Create
        let styleName = stateManager.getName(id);
        this.styles[id] = styleName;
      }
      // Update
      let styleName = stateManager.getName(id);
      if (this.styles[id] !== styleName) {
        resourceManager.delete(styleName);
        this.styles[id] = styleName;
      }
      
      let style = new AsciiEngine.GL.Style();
      
      for (let styleType in SupportedStyles) {
        let styleKey = SupportedStyles[styleType].key;
        let value = stateManager.getStyleProperty(styleKey, id);
        style.setStyle(styleKey, value);
      }
      
      resourceManager.add(styleName, style);
    } else {
      // Delete
      let name = this.styles[id];
      if (!name) {
        return;
      }
      resourceManager.delete(name);
      delete this.styles[id];
    }
  }
  
  getResourceManager() {
    return this.getEngine().getModule(AsciiEngine.ModuleSlots.Resources);
  }
  
  getStateManager() {
    return this.getEngine().getModule("StateManager");
  }
}
