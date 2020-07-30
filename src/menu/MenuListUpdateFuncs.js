import {TypeEnum, TypeConfig} from "../Config.js";
import Funcs from "../utils/Funcs.js";

import * as MenuFieldFuncs from "./MenuFieldUpdateFuncs.js";

export function addListItem(stateManager, id) {
  let listElement = document.createElement("li");
  listElement.id = id;
  let type = stateManager.getType(id);
  let menuListId = TypeConfig[type].menuListId;
  document.getElementById(menuListId).appendChild(listElement);
  
  Funcs.addClickListener(listElement.id, Funcs.callbackWithArgs(
    handleClick, stateManager, id, type
  ));
  
  populateListItemAttributes(stateManager, id);
}

export function populateListItemAttributes(stateManager, id) {
  let listElement = document.getElementById(id);
  if (!listElement) {
    return;
  }
  listElement.textContent = getListLabel(stateManager, id);
  listElement.classList.add("selectorListElement");
  if (stateManager.getUsed(id)) {
    listElement.classList.add("used");
  } else {
    listElement.classList.remove("used");
  }
  let type = stateManager.getType(id);
  if (stateManager.getSelectedId(type) === id) {
    listElement.classList.add("selected");
  } else {
    listElement.classList.remove("selected");
  }
}

export function removeListItem(id) {
  document.getElementById(id).remove();
}

export function refreshList(stateManager, type) {
  let menuListId = TypeConfig[type].menuListId;
  clearList(menuListId);
  let newIds = getIdsInList[type](stateManager);
  if (newIds === undefined) {
    return;
  }
  for (let id of newIds) {
    addListItem(stateManager, id);
  }
}

export let getIdsInList = {
  [TypeEnum.Template]: (stateManager) => {
    return stateManager.getAllIds(TypeEnum.Template);
  },
  [TypeEnum.Frame]: (stateManager) => {
    let selectedTemplate = stateManager.getSelectedId(TypeEnum.Template);
    return stateManager.getTemplateFrameIds(selectedTemplate);
  },
  [TypeEnum.Fragment]: (stateManager) => {
    let selectedFrame = stateManager.getSelectedId(TypeEnum.Frame);
    return stateManager.getFrameFragmentIds(selectedFrame);
  },
  [TypeEnum.Sprite]: (stateManager) => {
    return stateManager.getAllIds(TypeEnum.Sprite);
  },
  [TypeEnum.Style]: (stateManager) => {
    return stateManager.getAllIds(TypeEnum.Style);
  },
}

export function getListLabel(stateManager, id, type) {
  type = type || stateManager.getType(id);
  if (type === TypeEnum.Fragment) {
    let spriteName = stateManager.getFragmentSprite(id) || "[No Sprite]";
    let styleName = stateManager.getFragmentStyle(id) || "[No Style]";
    return spriteName + " | " + 
      styleName + " | " + 
      "[" + stateManager.getFragmentPosition(id) + "]";
  }
  return stateManager.getName(id);
}

export function clearList(menuListId) {
  document.getElementById(menuListId).innerHTML = "";
}

export function refreshListItemName(stateManager, id) {
  let listElement = document.getElementById(id);
  if (!listElement) {
    return;
  }
  listElement.textContent = getListLabel(stateManager, id);
}

export function refreshListItemUsed(stateManager, id) {
  let listElement = document.getElementById(id);
  if (!listElement) {
    return;
  }
  let used = stateManager.getUsed(id);
  if (used) {
    listElement.classList.add("used");
  } else {
    listElement.classList.remove("used");
  }
}

export function refreshListItemSelected(stateManager, id) {
  let listElement = document.getElementById(id);
  if (!listElement) {
    return;
  }
  let type = stateManager.getType(id);
  let selected = id === stateManager.getSelectedId(type);
  if (selected) {
    listElement.classList.add("selected");
  } else {
    listElement.classList.remove("selected");
  }
}

export function markListItemUsed(id, flag) {
  let listElement = document.getElementById(id);
  if (!listElement) {
    return;
  }
  if (flag) {
    listElement.classList.add("used");
  } else {
    listElement.classList.remove("used");
  }
}

export function markListItemSelected(id, flag) {
  let element = document.getElementById(id);
  if (!element) {
    return;
  }
  if (flag) {
    element.classList.add("selected");
  } else {
    element.classList.remove("selected");
  }
}

export function handleClick(stateManager, id, type) {
  let previouslySelected = stateManager.getSelectedId(type);
  stateManager.click(id);
  refreshListItemSelected(stateManager, previouslySelected);
  refreshListItemSelected(stateManager, id);
  handleSelectChange(stateManager, type);
}

export function handleSelectChange(stateManager, type) {
  MenuFieldFuncs.refreshFields[type](stateManager);
  if (type === TypeEnum.Template) {
    MenuFieldFuncs.refreshFields[TypeEnum.Frame](stateManager);
    refreshList(stateManager, TypeEnum.Frame);
    MenuFieldFuncs.refreshFields[TypeEnum.Fragment](stateManager);
    refreshList(stateManager, TypeEnum.Fragment);
  } else if (type === TypeEnum.Frame) {
    MenuFieldFuncs.refreshFields[TypeEnum.Fragment](stateManager);
    refreshList(stateManager, TypeEnum.Fragment);
  }
}
