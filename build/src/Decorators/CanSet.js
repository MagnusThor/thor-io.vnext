"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanSetGet = CanSetGet;
require("reflect-metadata");
/**
 * A decorator that attaches metadata to a property indicating whether it can be set or get.
 *
 * @param canSet Boolean indicating if the property can be set.
 * @param canGet Optional boolean indicating if the property can be gotten (defaults to `canSet` if not provided).
 *
 * @returns A function that adds metadata to the property.
 */
function CanSetGet(canSet, canGet) {
    return function (target, propertyKey) {
        // Attach 'canSet' metadata
        Reflect.defineMetadata("canSet", canSet, target, propertyKey);
        // Attach 'canGet' metadata, defaulting to 'canSet' if not provided
        Reflect.defineMetadata("canGet", canGet !== null && canGet !== void 0 ? canGet : canSet, target, propertyKey);
    };
}
