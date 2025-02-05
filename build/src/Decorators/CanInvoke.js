"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanInvoke = CanInvoke;
require("reflect-metadata");
/**
 * A decorator to define whether a method can be invoked, with optional alias support.
 *
 * @param state Boolean indicating whether the method can be invoked.
 * @param alias Optional alias for the method.
 *
 * @returns A function that adds metadata to the method.
 */
function CanInvoke(state, alias) {
    return (target, propertyKey, descriptor) => {
        // Define metadata for whether the method can be invoked
        Reflect.defineMetadata("canInvoke", state, target, propertyKey);
        // Optionally add an alias if provided
        if (alias) {
            Reflect.defineMetadata("alias", alias, target, propertyKey);
        }
    };
}
