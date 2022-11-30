"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerProperties = void 0;
function ControllerProperties(alias, seald, heartbeatInterval) {
    return function (target) {
        Reflect.defineMetadata("seald", seald || false, target);
        Reflect.defineMetadata("alias", alias, target);
        Reflect.defineMetadata("heartbeatInterval", heartbeatInterval || -1, target);
    };
}
exports.ControllerProperties = ControllerProperties;
