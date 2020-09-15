import { TypeEnum, TypeConfig, SupportedStyles } from "../Config.js";
import Funcs from "../utils/Funcs.js";

import * as MenuFieldFuncs from "./MenuFieldUpdateFuncs.js";
import * as MenuListFuncs from "./MenuListUpdateFuncs.js";

const MenuSetup = {
  [TypeEnum.Template]: function setupTemplateFields(stateManager) {
    Funcs.addClickListener("templateNewButton", Funcs.callbackWithArgs(
      handleNew, stateManager, TypeEnum.Template
    ));
    Funcs.addClickListener("templateDeleteButton", Funcs.callbackWithArgs(
      handleDelete, stateManager, TypeEnum.Template
    ));

    Funcs.addTriggerButtonClickOnEnterListener(
      "templateNameField", "templateRenameButton"
    );

    Funcs.addClickListener("templateRenameButton", Funcs.callbackWithArgs(
      handleRename, stateManager, TypeEnum.Template
    ));

    document.getElementById("templateVisibleCheckbox").addEventListener("change", Funcs.callbackWithArgs(
      handleTemplateVisibilityChange, stateManager
    ));

    document.getElementById("templateXField").addEventListener("change", Funcs.callbackWithArgs(
      handleTemplatePositionChange, stateManager
    ));
    document.getElementById("templateYField").addEventListener("change", Funcs.callbackWithArgs(
      handleTemplatePositionChange, stateManager
    ));
    document.getElementById("templateZField").addEventListener("change", Funcs.callbackWithArgs(
      handleTemplatePositionChange, stateManager
    ));

    MenuListFuncs.refreshList(stateManager, TypeEnum.Template);
    MenuFieldFuncs.refreshFields[TypeEnum.Template](stateManager);
  },

  [TypeEnum.Frame]: function setupFrameFields(stateManager) {
    Funcs.addClickListener("frameNewButton", Funcs.callbackWithArgs(
      handleNew, stateManager, TypeEnum.Frame
    ));

    Funcs.addClickListener("frameDeleteButton", Funcs.callbackWithArgs(
      handleDelete, stateManager, TypeEnum.Frame
    ));

    Funcs.addTriggerButtonClickOnEnterListener(
      "frameNameField", "frameRenameButton"
    );

    Funcs.addClickListener("frameRenameButton", Funcs.callbackWithArgs(
      handleRename, stateManager, TypeEnum.Frame
    ));

    Funcs.addClickListener("frameActiveButton", Funcs.callbackWithArgs(
      handleFrameSetActive, stateManager
    ));

    MenuListFuncs.refreshList(stateManager, TypeEnum.Frame);
    MenuFieldFuncs.refreshFields[TypeEnum.Frame](stateManager);
  },

  [TypeEnum.Fragment]: function setupFragmentFields(stateManager) {
    Funcs.addClickListener("fragmentNewButton", Funcs.callbackWithArgs(
      handleNew, stateManager, TypeEnum.Fragment
    ));

    Funcs.addClickListener("fragmentDeleteButton", Funcs.callbackWithArgs(
      handleDelete, stateManager, TypeEnum.Fragment
    ));

    Funcs.addTriggerButtonClickOnEnterListener(
      "fragmentSpriteNameField", "fragmentChangeSpriteButton"
    );

    Funcs.addClickListener("fragmentChangeSpriteButton", Funcs.callbackWithArgs(
      handleFragmentSpriteChange, stateManager
    ));

    Funcs.addTriggerButtonClickOnEnterListener(
      "fragmentStyleNameField", "fragmentChangeStyleButton"
    );

    Funcs.addClickListener("fragmentChangeStyleButton", Funcs.callbackWithArgs(
      handleFragmentStyleChange, stateManager
    ));

    document.getElementById("fragmentXField").addEventListener("change", Funcs.callbackWithArgs(
      handleFragmentPositionChange, stateManager
    ));
    document.getElementById("fragmentYField").addEventListener("change", Funcs.callbackWithArgs(
      handleFragmentPositionChange, stateManager
    ));
    document.getElementById("fragmentZField").addEventListener("change", Funcs.callbackWithArgs(
      handleFragmentPositionChange, stateManager
    ));


    MenuListFuncs.refreshList(stateManager, TypeEnum.Fragment);
    MenuFieldFuncs.refreshFields[TypeEnum.Fragment](stateManager);
  },

  [TypeEnum.Sprite]: function setupSpriteFields(stateManager) {
    Funcs.addClickListener("spriteNewButton", Funcs.callbackWithArgs(
      handleNew, stateManager, TypeEnum.Sprite
    ));

    Funcs.addClickListener("spriteDeleteButton", Funcs.callbackWithArgs(
      handleDelete, stateManager, TypeEnum.Sprite
    ));

    Funcs.addTriggerButtonClickOnEnterListener(
      "spriteNameField", "spriteRenameButton"
    );

    Funcs.addClickListener("spriteRenameButton", Funcs.callbackWithArgs(
      handleRename, stateManager, TypeEnum.Sprite
    ));

    Funcs.addTriggerButtonClickOnEnterListener(
      "spriteReplaceBlankField", "spriteReplaceBlankButton"
    );

    Funcs.addClickListener("spriteReplaceBlankButton", Funcs.callbackWithArgs(
      handleSpriteReplaceBlank, stateManager
    ));

    Funcs.addClickListener("spriteIgnoreLeadingSpacesCheckbox", Funcs.callbackWithArgs(
      handleSpriteIgnoreLeadingSpaces, stateManager
    ));

    Funcs.addClickListener("spriteSpaceIsTransparentCheckbox", Funcs.callbackWithArgs(
      handleSpriteSpaceIsTransparent, stateManager
    ));

    Funcs.addClickListener("spriteSpaceHasFormattingCheckbox", Funcs.callbackWithArgs(
      handleSpriteSpaceHasFormatting, stateManager
    ));

    MenuListFuncs.refreshList(stateManager, TypeEnum.Sprite);
    MenuFieldFuncs.refreshFields[TypeEnum.Sprite](stateManager);
  },

  [TypeEnum.Style]: function setupStyleFields(stateManager) {
    Funcs.addClickListener("styleNewButton", Funcs.callbackWithArgs(
      handleNew, stateManager, TypeEnum.Style
    ));

    Funcs.addClickListener("styleDeleteButton", Funcs.callbackWithArgs(
      handleDelete, stateManager, TypeEnum.Style
    ));

    Funcs.addTriggerButtonClickOnEnterListener(
      "styleNameField", "styleRenameButton"
    );

    Funcs.addClickListener("styleRenameButton", Funcs.callbackWithArgs(
      handleRename, stateManager, TypeEnum.Style
    ));

    let styleFormContainer = document.getElementById("styleUpdateFormFields");

    for (let styleType in SupportedStyles) {
      let styleId = SupportedStyles[styleType].id;

      let domElement = document.createElement("div");
      domElement.classList.add("styleOption");

      let label = document.createElement("label");
      label.textContent = SupportedStyles[styleType].label;
      label.htmlFor = SupportedStyles[styleType].key;
      domElement.appendChild(label);

      let input = document.createElement("input");
      input.setAttribute("name", SupportedStyles[styleType].key)
      input.setAttribute("type", "text");
      input.style.display = "block";
      input.id = SupportedStyles[styleType].id;
      domElement.appendChild(input);

      styleFormContainer.appendChild(domElement);

      Funcs.addTriggerButtonClickOnEnterListener(
        styleId, "styleUpdateButton"
      );
    }

    Funcs.addClickListener("styleUpdateButton", Funcs.callbackWithArgs(
      handleStyleModify, stateManager
    ));

    MenuListFuncs.refreshList(stateManager, TypeEnum.Style);
    MenuFieldFuncs.refreshFields[TypeEnum.Style](stateManager);
  },
};

export default MenuSetup;

/*************************** SHARED ***************************/

function handleNew(stateManager, type) {
  let id;
  if (TypeConfig[type].nameFieldId !== undefined) {
    let name = document.getElementById(TypeConfig[type].nameFieldId).value;
    id = stateManager.create(type, name, true);
  } else {
    id = stateManager.create(type);
  }
  if (id === undefined) {
    return;
  }
  MenuListFuncs.addListItem(stateManager, id);
  MenuListFuncs.handleClick(stateManager, id, type);
}

function handleDelete(stateManager, type) {
  let removedId = stateManager.deleteSelected(type);
  if (removedId === undefined) {
    return;
  }
  MenuListFuncs.removeListItem(removedId);
  MenuListFuncs.handleSelectChange(stateManager, type);
  if (type === TypeEnum.Sprite || type === TypeEnum.Style) {
    MenuFieldFuncs.refreshFields[TypeEnum.Fragment](stateManager);
    MenuListFuncs.refreshList(stateManager, TypeEnum.Fragment);
  } else if (type === TypeEnum.Fragment) {
    MenuListFuncs.refreshList(stateManager, TypeEnum.Sprite);
    MenuListFuncs.refreshList(stateManager, TypeEnum.Style);
  }
}

function handleRename(stateManager, type) {
  let nameFieldId = TypeConfig[type].nameFieldId;
  let name = document.getElementById(nameFieldId).value;
  stateManager.renameSelected(type, name);
  MenuListFuncs.refreshListItemName(stateManager, stateManager.getSelectedId(type), true);
  MenuFieldFuncs.refreshFields[type](stateManager);
  if (type === TypeEnum.Sprite || type === TypeEnum.Style) {
    MenuFieldFuncs.refreshFields[TypeEnum.Fragment](stateManager);
    MenuListFuncs.refreshList(stateManager, TypeEnum.Fragment);
  }
}

/*************************** TEMPLATE ***************************/

function handleTemplateVisibilityChange(stateManager) {
  let checked = document.getElementById("templateVisibleCheckbox").checked;
  stateManager.setTemplateVisibility(checked);
  MenuFieldFuncs.refreshFields[TypeEnum.Template](stateManager);
  MenuListFuncs.refreshListItemUsed(stateManager,
    stateManager.getSelectedId(TypeEnum.Template));
}

function handleTemplatePositionChange(stateManager) {
  let x = parseInt(document.getElementById("templateXField").value);
  let y = parseInt(document.getElementById("templateYField").value);
  let z = parseInt(document.getElementById("templateZField").value);
  stateManager.setTemplatePosition([x, y, z]);
  MenuFieldFuncs.refreshFields[TypeEnum.Template](stateManager);
}

/*************************** FRAME ***************************/

function handleFrameSetActive(stateManager) {
  let previousActiveId = stateManager.getTemplateActiveFrame();
  stateManager.setTemplateActiveFrame();
  let currentActiveId = stateManager.getTemplateActiveFrame();
  if (currentActiveId === previousActiveId) {
    return;
  }
  MenuListFuncs.refreshListItemUsed(stateManager, previousActiveId);
  MenuListFuncs.refreshListItemUsed(stateManager, currentActiveId);
  MenuFieldFuncs.refreshFields[TypeEnum.Template](stateManager);
}

/*************************** FRAGMENT ***************************/

function handleFragmentSpriteChange(stateManager) {
  let spriteName = document.getElementById("fragmentSpriteNameField").value || undefined;
  stateManager.setFragmentSprite(spriteName);
  MenuFieldFuncs.refreshFields[TypeEnum.Fragment](stateManager);
  MenuListFuncs.populateListItemAttributes(stateManager,
    stateManager.getSelectedId(TypeEnum.Fragment));
  MenuListFuncs.refreshList(stateManager, TypeEnum.Sprite);
}

function handleFragmentStyleChange(stateManager) {
  let styleName = document.getElementById("fragmentStyleNameField").value || undefined;
  stateManager.setFragmentStyle(styleName);
  MenuFieldFuncs.refreshFields[TypeEnum.Fragment](stateManager);
  MenuListFuncs.populateListItemAttributes(stateManager,
    stateManager.getSelectedId(TypeEnum.Fragment));
  MenuListFuncs.refreshList(stateManager, TypeEnum.Style);
}

function handleFragmentPositionChange(stateManager) {
  let x = parseInt(document.getElementById("fragmentXField").value);
  let y = parseInt(document.getElementById("fragmentYField").value);
  let z = parseInt(document.getElementById("fragmentZField").value);
  stateManager.setFragmentPosition([x, y, z]);
  MenuListFuncs.refreshListItemName(stateManager,
    stateManager.getSelectedId(TypeEnum.Fragment));
  MenuFieldFuncs.refreshFields[TypeEnum.Fragment](stateManager);
}

/*************************** SPRITE ***************************/

function handleSpriteReplaceBlank(stateManager) {
  let blankChars = document.getElementById("spriteReplaceBlankField").value;
  stateManager.setSpriteSetAsBlank(blankChars);
  MenuFieldFuncs.refreshFields[TypeEnum.Sprite](stateManager);
}

function handleSpriteIgnoreLeadingSpaces(stateManager) {
  let checked = document.getElementById("spriteIgnoreLeadingSpacesCheckbox").checked;
  stateManager.setSpriteIgnoreLeadingSpaces(checked);
  MenuFieldFuncs.refreshFields[TypeEnum.Sprite](stateManager);
}

function handleSpriteSpaceIsTransparent(stateManager) {
  let checked = document.getElementById("spriteSpaceIsTransparentCheckbox").checked;
  stateManager.setSpriteSpaceIsTransparent(checked);
  MenuFieldFuncs.refreshFields[TypeEnum.Sprite](stateManager);
}

function handleSpriteSpaceHasFormatting(stateManager) {
  let checked = document.getElementById("spriteSpaceHasFormattingCheckbox").checked;
  stateManager.setSpriteSpaceHasFormatting(checked);
  MenuFieldFuncs.refreshFields[TypeEnum.Sprite](stateManager);
}

/*************************** STYLE ***************************/

function handleStyleModify(stateManager) {
  for (let styleType in SupportedStyles) {
    let styleFieldId = SupportedStyles[styleType].id;
    let styleKey = SupportedStyles[styleType].key;
    let styleValue = document.getElementById(styleFieldId).value;
    if (styleValue) {
      stateManager.setStyleProperty(styleKey, styleValue);
    } else {
      stateManager.setStyleProperty(styleKey, "");
    }
  }
  MenuFieldFuncs.refreshFields[TypeEnum.Style](stateManager);
}
