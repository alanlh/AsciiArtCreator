const Funcs = {
  addTriggerButtonClickOnEnterListener: (inputId, buttonId) => {
    document.getElementById(inputId).addEventListener("keyup", (event) => {
      if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById(buttonId).click();
      }
    });
  },
  // Makes things easier to read slightly?
  addClickListener: (buttonId, callback) => {
    document.getElementById(buttonId).addEventListener("click", callback);
  },
  extractDataComponentName: (dataEntity, typeName) => {
    return dataEntity.getComponent(typeName).name;
  },
  /**
   * Adds a data component to the resource manager.
   * The object to put in the resource manager is created using the construct method in the component.
   * Template-related data components will only add an undefined to reserve the name.
   * If the component's name is already used, then a new name will be created.
   * The component's name will also be set to the name it appears as in the resource manager.
   * 
   * @param {DataComponent} component The component whose name needs to be reserved.
   * @param {ResourceManager} resourceManager The resourceManager to add to
   * @return {Boolean} Whether or not the name was changed.
   */
  addToResourceManager: (component, resourceManager) => {
    let initialName = component.name;
    let usedName = initialName;
    let idx = 0;
    while (resourceManager.has(usedName)) {
      idx ++;
      usedName = initialName + " (" + idx + ")";
    }
    resourceManager.add(usedName, component.createInstance());
    component.name = usedName;
    component.changed = false;
    if (idx > 0) {
      console.warn(
        "The name ", initialName, " has already been taken.",
        "It has been added as ", usedName, " instead."
      );
    }
    return idx > 0;
  },
  checkExistenceThenCallback: (nameRegistry, type) => {
    return (id, callback, ...args) => {
      if (!nameRegistry.hasIdOfType(id, type)) {
        return false;
      }
      let object = nameRegistry.getObjectOfType(id, type);
      return callback(object, ...args);
    }
  },
  callbackWithArgs: (func, ...args) => {
    return () => func(...args);
  },
  /**
   * Gets a free name based off of the requested name.
   * If the name isn't free, will be of the form "<requested name> (n)"
   * 
   * @param {String} base The requested name. Returned if already free.
   * @param {Object} dict The dictionary to search through
   * @return {String} A free name in the dictionary
   */
  getFreeName: (base, dict) => {
    let name = base;
    let idx = 0;
    while (name in dict) {
      name = base + " (" + (++idx) + ")";
    }
    return name;
  },
};

export default Funcs;
