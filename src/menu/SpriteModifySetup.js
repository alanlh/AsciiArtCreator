import StateManager from "../state_management/StateManager.js";
import SpriteEditorSystem from "../state_management/SpriteEditorSystem.js";

import Funcs from "../utils/Funcs.js";

/** @type {SpriteEditorSystem} */
let spriteEditor = undefined;

/**
 * 
 * @param {StateManager} stateManager 
 * @param {AsciiEngine} ae 
 */
export function setupSpriteModify(stateManager, ae) {
    Funcs.addClickListener("spriteModifyButton", (event) => {
        if (spriteEditor) {
            let {
                id, text, position
            } = spriteEditor.compile();
            stateManager.setSpriteText(text, id);
            stateManager.setSpriteCachedPosition(position, id);
            ae.getSystemManager().removeSystem(spriteEditor.name);
            spriteEditor = undefined;
        }
        stateManager.toggleSpriteBeingModified();
        let currentlyModifiedSprite = stateManager.getSpriteBeingModified();
        if (currentlyModifiedSprite) {
            let cachedPosition = stateManager.getSpriteCachedPosition(currentlyModifiedSprite);
            spriteEditor = new SpriteEditorSystem(
                currentlyModifiedSprite,
                stateManager.getSpriteText(currentlyModifiedSprite),
                cachedPosition
            );
            ae.getSystemManager().addSystem(spriteEditor);
            updateSpritePositionDisplay(cachedPosition);
        }
        let modifyButton = document.getElementById("spriteModifyButton");
        let modifyMenu = document.getElementById("spritePositionControls");
        if (currentlyModifiedSprite) {
            let nameOfModifiedSprite = stateManager.getName(currentlyModifiedSprite);
            modifyButton.textContent = `Save ${nameOfModifiedSprite}`;
            modifyMenu.style.display = "block";
            modifyButton.blur();
        } else {
            modifyButton.textContent = "Modify Selected";
            modifyMenu.style.display = "none";
        }
    });

    document.getElementById("spriteXField").addEventListener("change", handleSpritePositionChange);
    document.getElementById("spriteYField").addEventListener("change", handleSpritePositionChange);
    document.getElementById("spriteZField").addEventListener("change", handleSpritePositionChange);
}

function handleSpritePositionChange() {
    let x = parseInt(document.getElementById("spriteXField").value);
    let y = parseInt(document.getElementById("spriteYField").value);
    let z = parseInt(document.getElementById("spriteZField").value);
    spriteEditor.setSpritePosition(x, y, z);
}

function updateSpritePositionDisplay([x, y, z]) {
    document.getElementById("spriteXField").value = x;
    document.getElementById("spriteYField").value = y;
    document.getElementById("spriteZField").value = z;
}