import {TypeEnum, SupportedStyles} from "../Config.js";

export let menuFieldPopulators = {
  [TypeEnum.Template]: function populateTemplateFields(params = {
    name: "",
    visible: false,
    position: ["", "", ""],
  }) {
    document.getElementById("templateNameField").value = params.name;
    document.getElementById("templateVisibleCheckbox").checked = !!params.visible;
    document.getElementById("templateXField").value = params.position[0];
    document.getElementById("templateYField").value = params.position[1];
    document.getElementById("templateZField").value = params.position[2];
  },
  [TypeEnum.Frame]: function populateTemplateFields(params = {
    name: "",
  }) {
    document.getElementById("frameNameField").value = params.name;
  },
  [TypeEnum.Fragment]: function populateFragmentFields(params = {
    spriteName: "",
    styleName: "",
    position: ["", "", ""],
  }) {
    document.getElementById("fragmentSpriteNameField").value = params.spriteName;
    document.getElementById("fragmentStyleNameField").value = params.styleName;
    document.getElementById("fragmentXField").value = params.position[0];
    document.getElementById("fragmentYField").value = params.position[1];
    document.getElementById("fragmentZField").value = params.position[2];
  },
  [TypeEnum.Sprite]: function populateSpriteFields(params = {
    name: "",
    setAsBlank: "",
    ignoreLeadingSpaces: false,
    spaceIsTransparent: false,
  }) {
    document.getElementById("spriteNameField").value = params.name;
    document.getElementById("spriteReplaceBlankField").value = params.setAsBlank;
    document.getElementById("spriteIgnoreLeadingSpacesCheckbox").checked = params.ignoreLeadingSpaces;
    document.getElementById("spriteSpaceIsTransparentCheckbox").checked = params.spaceIsTransparent;
  },
  [TypeEnum.Style]: function populateStyleFields(params = {
    name: "",
    styles: {},
  }) {
    document.getElementById("styleNameField").value = params.name;
    for (let styleName in SupportedStyles) {
      let styleConfig = SupportedStyles[styleName];
      if (styleConfig.key in params.styles && params.styles[styleConfig.key]) {
        document.getElementById(styleConfig.id).value = params.styles[styleConfig.key];
      } else {
        document.getElementById(styleConfig.id).value = "";
      }
    }
  },
}
Object.freeze(menuFieldPopulators);

function createFieldRefresher(type, dataRetriever) {
  return (stateManager) => {
    let selected = stateManager.getSelectedId(type);
    if (selected === undefined) {
      menuFieldPopulators[type]();
    } else {
      menuFieldPopulators[type](dataRetriever(stateManager, selected));
    }
  }
}

export let refreshFields = {
  [TypeEnum.Template]: createFieldRefresher(TypeEnum.Template, (stateManager, selected) => {
    return {
      name: stateManager.getName(selected),
      visible: stateManager.getTemplateVisibility(selected),
      position: stateManager.getTemplatePosition(selected),
    };
  }),
  [TypeEnum.Frame]: createFieldRefresher(TypeEnum.Frame, (stateManager, selected) => {
    return {
      name: stateManager.getName(selected),
    };
  }),
  [TypeEnum.Fragment]: createFieldRefresher(TypeEnum.Fragment, (stateManager, selected) => {
    return {
      spriteName: stateManager.getFragmentSprite(selected) || "",
      styleName: stateManager.getFragmentStyle(selected) || "",
      position: stateManager.getFragmentPosition(selected),
    };
  }),
  [TypeEnum.Sprite]: createFieldRefresher(TypeEnum.Sprite, (stateManager, selected) => {
    return {
      name: stateManager.getName(selected),
      setAsBlank: stateManager.getSpriteSetAsBlank(selected) || "",
      ignoreLeadingSpaces: stateManager.getSpriteIgnoreLeadingSpaces(selected),
      spaceIsTransparent: stateManager.getSpriteSpaceIsTransparent(selected),
    };
  }),
  [TypeEnum.Style]: createFieldRefresher(TypeEnum.Style, (stateManager, selected) => {
    let styles = {};
    for (let key in SupportedStyles) {
      let styleConfig = SupportedStyles[key];
      styles[styleConfig.key] = stateManager.getStyleProperty(styleConfig.key, selected) || "";
    }
    return {
      name: stateManager.getName(selected),
      styles: styles,
    };
  }),
}

Object.freeze(refreshFields);

export function refreshAll(stateManager) {
  for (let type in refreshFields) {
    refreshFields[type](stateManager);
  }
}
