import Funcs from "../utils/Funcs.js";
import Log from "../Logging.js";

import * as MenuListFuncs from "./MenuListUpdateFuncs.js";
import * as MenuFieldFuncs from "./MenuFieldUpdateFuncs.js";

import {TypeEnum, TypeConfig, SupportedStyles} from "../Config.js";

export default function LoadingSetup(stateManager) {
  Funcs.addClickListener("uploadTemplatesButton", (event) => {
    document.getElementById("uploadTemplates").click();
  });
  document.getElementById("uploadTemplates").addEventListener("change", async (event) => {
    let files = event.target.files;
    for (let file of files) {
      let fileReader = new FileReader();
      fileReader.onload = () => {
        let text = fileReader.result;
        let templateJson = JSON.parse(text);
        insertTemplateJson(stateManager, templateJson);
        MenuListFuncs.refreshAll(stateManager);
        MenuFieldFuncs.refreshAll(stateManager);
      }
      fileReader.readAsText(file);
    }
    document.getElementById("uploadTemplates").value = "";
  });
  
  Funcs.addClickListener("downloadSelectedTemplatesButton", (event) => {
    downloadData(stateManager, false, downloadTemplateData);
  });
  
  Funcs.addClickListener("downloadAllTemplatesButton", (event) => {
    downloadData(stateManager, true, downloadTemplateData);
  });
  
  Funcs.addClickListener("uploadSpritesButton", (event) => {
    document.getElementById("uploadSprites").click();
  });
  
  document.getElementById("uploadSprites").addEventListener("change", (event) => {
    let files = event.target.files;
    for (let file of files) {
      let fileReader = new FileReader();
      fileReader.onload = () => {
        let text = fileReader.result;
        let spriteJson = JSON.parse(text);
        insertSpriteJson(stateManager, spriteJson.sprites);
        insertStyleJson(stateManager, spriteJson.styles);
        MenuListFuncs.refreshAll(stateManager);
        MenuListFuncs.refreshAll(stateManager);
      }
      fileReader.readAsText(file);
    }
    
    document.getElementById("uploadSprites").value = "";
  });
  
  Funcs.addClickListener("downloadVisibleSpritesButton", (event) => {
    downloadData(stateManager, false, downloadSpriteData);
  });
  
  Funcs.addClickListener("downloadAllSpritesButton", (event) => {
    downloadData(stateManager, true, downloadSpriteData);
  });
}

function insertTemplateJson(stateManager, templatesJson) {
  for (let templateName in templatesJson) {
    let templateId = stateManager.create(TypeEnum.Template, templateName, false);
    if (templateId === undefined) {
      Log.warn("Unable to create template", templateName, "Duplicate names?");
      continue;
    }
    stateManager.click(templateId);
    let templateData = templatesJson[templateName];
    for (let frameName in templateData) {
      let frameId = stateManager.create(TypeEnum.Frame, frameName, true);
      if (frameId === undefined) {
        Log.warn("Unable to add frame", frameName, "to template", templateName);
        continue;
      }
      stateManager.click(frameId);
      let frameData = templateData[frameName];
      for (let i = 0; i < frameData.spriteNameList.length; i ++) {
        let fragmentId = stateManager.create(TypeEnum.Fragment);
        let spriteSet = stateManager.setFragmentSprite(frameData.spriteNameList[i], fragmentId);
        let styleSet = stateManager.setFragmentStyle(frameData.styleNameList[i], fragmentId);
        stateManager.setFragmentPosition(frameData.relativePositionList[i], fragmentId);
        if (!spriteSet || !styleSet) {
          Log.warn("Failed to set a fragment's sprite or style.",
            "Maybe the sprite file hasn't been loaded yet?");
        }
      }
    }
  }
}

function insertSpriteJson(stateManager, sprites) {
  for (let spriteName in sprites) {
    let spriteId = stateManager.create(TypeEnum.Sprite, spriteName, false);
    if (spriteId === undefined) {
      Log.warn("Unable to create sprite", spriteName);
      continue;
    }
    stateManager.setSpriteText(sprites[spriteName].text, spriteId);
    stateManager.setSpriteSetAsBlank(sprites[spriteName].settings.setAsBlank, spriteId);
    stateManager.setSpriteIgnoreLeadingSpaces(
      sprites[spriteName].settings.ignoreLeadingSpaces, spriteId);
    stateManager.setSpriteSpaceIsTransparent(
      sprites[spriteName].settings.spaceIsTransparent, spriteId);
  }
}

function insertStyleJson(stateManager, styles) {
  for (let styleName in styles) {
    let styleId = stateManager.create(TypeEnum.Style, styleName, false);
    if (styleId === undefined) {
      Log.warn("Unable to create style", styleName);
      continue;
    }
    for (let styleKey in styles[styleName]) {
      stateManager.setStyleProperty(styleKey, styles[styleName][styleKey], styleId);
    }
  }
}

function downloadData(stateManager, downloadAll, dataRetriever) {
  let downloadData = dataRetriever(stateManager, downloadAll);
  
  let downloadString = "data:text/json;charset=utf-8," 
    + encodeURIComponent(JSON.stringify(downloadData));
  let downloadElement = document.getElementById("download");
  downloadElement.setAttribute("href", downloadString);
  downloadElement.setAttribute("download", "templates.json");
  downloadElement.click();
}

function downloadTemplateData(stateManager, downloadAll) {
  let downloadData = {};
  let templateIds = stateManager.getAllIds(TypeEnum.Template);
  for (let templateId of templateIds) {
    if (downloadAll || stateManager.getUsed(templateId)) {
      let templateName = stateManager.getName(templateId);
      let templateData = {};
      let frameIds = stateManager.getTemplateFrameIds(templateId);
      for (let frameId of frameIds) {
        let frameName = stateManager.getName(frameId);
        let frameData = {
          spriteNameList: [],
          styleNameList: [],
          relativePositionList: [],
        };
        let fragIds = stateManager.getFrameFragmentIds(frameId);
        for (let fragId of fragIds) {
          let spriteName = stateManager.getFragmentSprite(fragId);
          let styleName = stateManager.getFragmentStyle(fragId);
          let position = stateManager.getFragmentPosition(fragId);
          // Only add if it's a meaningful fragment.
          if (spriteName && styleName) {
            frameData.spriteNameList.push(spriteName);
            frameData.styleNameList.push(styleName);
            frameData.relativePositionList.push([...position]);
          } else {
            Log.warn(
              "Fragment in template", templateName, "and frame", frameName,
              "has undefined sprite or style. Not adding..."
            );
          }
        }
        templateData[frameName] = frameData;
      }
      downloadData[templateName] = templateData;
    }
  }
  return downloadData;
}

function downloadSpriteData(stateManager, downloadAll) {
  return {
    sprites: downloadSprites(stateManager, downloadAll),
    styles: downloadStyles(stateManager, downloadAll),
  };
}

function downloadSprites(stateManager, downloadAll) {
  let spriteData = {};
  let spriteIds = stateManager.getAllIds(TypeEnum.Sprite);
  for (let spriteId of spriteIds) {
    if (downloadAll || stateManager.getUsed(spriteId)) {
      let spriteName = stateManager.getName(spriteId);
      
      let text = stateManager.getSpriteText(spriteId);
      let setAsBlank = stateManager.getSpriteSetAsBlank(spriteId);
      let ignoreLeadingSpaces = stateManager.getSpriteIgnoreLeadingSpaces(spriteId);
      let spaceIsTransparent = stateManager.getSpriteSpaceIsTransparent(spriteId);
      let settings = {
        ignoreLeadingSpaces: ignoreLeadingSpaces,
        spaceIsTransparent: spaceIsTransparent,
      };
      if (setAsBlank !== undefined) {
        settings.setAsBlank = setAsBlank;
      }
      spriteData[spriteName] = {
        text: text,
        settings: settings,
      }
    }
  }
  return spriteData;
}

function downloadStyles(stateManager, downloadAll) {
  let styleData = {};
  let styleIds = stateManager.getAllIds(TypeEnum.Style);
  for (let styleId of styleIds) {
    if (downloadAll || stateManager.getUsed(styleId)) {
      let styleName = stateManager.getName(styleId);
      styleData[styleName] = {};
      for (let styleType in SupportedStyles) {
        let styleKey = SupportedStyles[styleType].key;
        let styleValue = stateManager.getStyleProperty(styleKey, styleId);
        if (styleValue) {
          styleData[styleName][styleKey] = styleValue;
        }
      }
    }
  }
  return styleData;
}
