"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanInvoke = void 0;
require("reflect-metadata");
function CanInvoke(state, alias) {
    return function (target, propertyKey, descriptor) {
        Reflect.defineMetadata("canInvokeOrSet", state, target, propertyKey);
    };
}
exports.CanInvoke = CanInvoke;
