"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
function CanInvoke(state, alias) {
    return function (target, propertyKey, descriptor) {
        Reflect.defineMetadata("canInvokeOrSet", state, target, propertyKey);
    };
}
exports.CanInvoke = CanInvoke;
