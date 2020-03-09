import { StringUtils } from './Utils/StringUtils';
/**
 *
 *
 * @export
 * @class Plugin
 * @template T
 */
export class Plugin<T> {
    /**
     *
     *
     * @type {string}
     * @memberOf Plugin
     */
    public alias: string;
    /**
     *
     *
     * @type {T}
     * @memberOf Plugin
     */
    public instance: T;
    id: string;
    /**
     * Creates an instance of Plugin.
     *
     * @param {T} controller
     *
     * @memberOf Plugin
     */
    constructor(controller: T) {
        this.id = StringUtils.newGuid()
        this.alias = Reflect.getMetadata("alias", controller);
        this.instance = controller;
    }
}
