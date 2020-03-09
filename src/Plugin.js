"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StringUtils_1 = require("./Utils/StringUtils");
class Plugin {
    constructor(controller) {
        this.id = StringUtils_1.StringUtils.newGuid();
        this.alias = Reflect.getMetadata("alias", controller);
        this.instance = controller;
    }
}
exports.Plugin = Plugin;
