"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerProperties = ControllerProperties;
require("reflect-metadata");
/**
 * A decorator to attach custom metadata to a controller class.
 *
 * @param alias The alias for the controller (used for routing or identification).
 * @param heartbeatInterval Optional interval in milliseconds for the heartbeat. Defaults to -1.
 *
 * @returns A function that adds metadata to the target class.
 */
function ControllerProperties(alias, heartbeatInterval) {
    return function (target) {
        // Attach alias to the class
        Reflect.defineMetadata("alias", alias, target);
        // Attach heartbeat interval to the class (default to -1 if not provided)
        Reflect.defineMetadata("heartbeatInterval", heartbeatInterval !== null && heartbeatInterval !== void 0 ? heartbeatInterval : -1, target);
    };
}
