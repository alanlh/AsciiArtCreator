const TypeEnum = {
  Template: "__TemplateType",
  Frame: "__FrameType",
  Fragment: "__FragmentType",
  Sprite: "__SpriteType",
  Style: "__StyleType",
}

const TypeConfig = {
  [TypeEnum.Template]: {
    menuListId: "templateList",
    hasGlobalName: true,
    hasLocalName: false,
    nameFieldId: "templateNameField",
    canBeReferenced: false,
    parentType: undefined,
    containerType: TypeEnum.Template,
  },
  [TypeEnum.Frame]: {
    menuListId: "frameList",
    hasGlobalName: false,
    hasLocalName: true,
    nameFieldId: "frameNameField",
    canBeReferenced: false,
    parentType: TypeEnum.Template,
    containerType: TypeEnum.Template,
  },
  [TypeEnum.Fragment]: {
    menuListId: "fragmentList",
    hasGlobalName: false,
    hasLocalName: false,
    nameFieldId: undefined,
    canBeReferenced: false,
    parentType: TypeEnum.Frame,
    containerType: TypeEnum.Template,
  },
  [TypeEnum.Sprite]: {
    menuListId: "spriteList",
    hasGlobalName: true,
    hasLocalName: false,
    nameFieldId: "spriteNameField",
    canBeReferenced: true,
    parentType: undefined,
    containerType: TypeEnum.Sprite,
  },
  [TypeEnum.Style]: {
    menuListId: "styleList",
    hasGlobalName: true,
    hasLocalName: false,
    nameFieldId: "styleNameField",
    canBeReferenced: true,
    parentType: undefined,
    containerType: TypeEnum.Style,
  },
}

const PropertyTypes = {}

/*
 * Data containing information about how to set up the style modifications
 * Should be updated whenenver there is more supported styles in SpriteStyle.
 * The "key" property should match the key used in SpriteStyle. 
 * The "id" property is used to get the input element.
 */
const SupportedStyles = {
  backgroundColor: {
    label: "Background Color",
    key: "backgroundColor",
    id: "backgroundColorInput"
  }, 
  textColor: {
    label: "Text Color",
    key: "color",
    id: "colorInput"
  }, 
  fontWeight: {
    label: "Font Weight",
    key: "fontWeight",
    id: "fontWeightInput"
  }, 
  fontStyle: {
    label: "Font Style",
    key: "fontStyle",
    id: "fontStyleInput"
  }, 
  textDecoration: {
    label: "Text Decoration",
    key: "textDecoration",
    id: "textDecorationInput"
  }, 
  cursor: {
    label: "Cursor",
    key: "cursor",
    id: "cursorInput"
  }, 
}

const SpriteOptions = {
  setAsBlank: {
    default: "",
  },
  spaceIsTransparent: {
    default: true,
  },
  ignoreLeadingSpaces: {
    default: true,
  }
}

const OperationEnum = {
  New: Symbol("New"),
  Rename: Symbol("Rename"),
  Delete: Symbol("Delete"),
  Modify: Symbol("Modify"),
}

// TODO: Is this necessary?
const ModifyOps = {
  [TypeEnum.Template]: {
    Visible: Symbol("Visible"),
    Position: Symbol("Position"),
  },
  [TypeEnum.Frame]: {
    SetActiveFrame: Symbol("SetActiveFrame"),
  },
  [TypeEnum.Fragment]: {
    Sprite: Symbol("Sprite"),
    Style: Symbol("Style"),
    Position: Symbol("Position"),
  },
  [TypeEnum.Sprite]: {
    menuListId: "spriteList",
    hasGlobalName: true,
    hasLocalName: false,
    canBeReferenced: true,
  },
  [TypeEnum.Style]: {
    menuListId: "styleList",
    hasGlobalName: true,
    hasLocalName: false,
    canBeReferenced: true,
  },
}

export {TypeEnum, TypeConfig, SupportedStyles, SpriteOptions, OperationEnum, ModifyOps};
