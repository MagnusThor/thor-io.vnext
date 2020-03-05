"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Plugin {
    constructor(controller) {
        this.alias = Reflect.getMetadata("alias", controller);
        this.instance = controller;
    }
}
exports.Plugin = Plugin;
