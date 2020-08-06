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
            let text = spriteEditor.getText();
            stateManager.setSpriteText(text, spriteEditor.getSpriteId());
            ae.getSystemManager().removeSystem(spriteEditor.name);
        }
        stateManager.toggleSpriteBeingModified();
        let currentlyModifiedSprite = stateManager.getSpriteBeingModified();
        if (currentlyModifiedSprite) {
            spriteEditor = new SpriteEditorSystem(
                currentlyModifiedSprite,
                stateManager.getSpriteText(currentlyModifiedSprite),
                [0, 0, 0]
            );
            ae.getSystemManager().addSystem(spriteEditor);
        }
        let modifyButton = document.getElementById("spriteModifyButton");
        let modifyMenu = document.getElementById("spritePositionControls");    
        if (currentlyModifiedSprite) {
            let nameOfModifiedSprite = stateManager.getName(currentlyModifiedSprite);
            modifyButton.textContent = `Save ${nameOfModifiedSprite}`;
            modifyMenu.style.display = "block";
        } else {
            modifyButton.textContent = "Modify Selected";
            modifyMenu.style.display = "none";    
        }
    });
}