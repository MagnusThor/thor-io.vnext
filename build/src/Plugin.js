"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = void 0;
const StringUtils_1 = require("./Utils/StringUtils");
/**
 * Represents a plugin with a specific type.
 * @template T The type of the plugin instance.
 */
class Plugin {
    /**
     * Creates an instance of Plugin.
     * @param {T} object The plugin instance.
     */
    constructor(object) {
        this.id = StringUtils_1.StringUtils.newGuid();
        this.alias = Reflect.getMetadata("alias", object);
        this.instance = object;
        const metaData = Reflect.getMetadataKeys(object);
        metaData.forEach(metaDataKey => {
            console.info(`Controller settings  ${metaDataKey} = `, Reflect.getOwnMetadata(metaDataKey, object));
        });
        console.info(`Created the plugin with an id of ${this.id}`);
    }
    /**
     * Gets the instance of the plugin.
     * @returns {T} The plugin instance.
     */
    getInstance() {
        return this.instance;
    }
}
exports.Plugin = Plugin;
