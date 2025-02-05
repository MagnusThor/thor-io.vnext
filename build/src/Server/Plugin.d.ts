/**
 * Describes the structure of a plugin descriptor.
 */
export interface PluginDescriptor {
    name: string;
    methods: string[];
    properties: string[];
}
/**
 * Represents a plugin with a specific type.
 * @template T The type of the plugin instance.
 */
export declare class Plugin<T extends Object> {
    /**
     * The alias of the plugin.
     */
    alias: string;
    /**
     * The instance of the plugin.
     * @private
     */
    private instance;
    /**
     * The unique identifier of the plugin.
     */
    id: string;
    /**
     * Creates an instance of Plugin.
     * @param {T} object The plugin instance.
     */
    constructor(object: T);
    /**
     * Gets the instance of the plugin.
     * @returns {T} The plugin instance.
     */
    getInstance(): T;
}
