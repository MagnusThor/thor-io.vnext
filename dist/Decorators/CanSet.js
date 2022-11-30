"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanSet = void 0;
function CanSet(state) {
    return function (target, propertyKey) {
        Reflect.defineMetadata("canInvokeOrSet", state, target, propertyKey);
    };
}
exports.CanSet = CanSet;
