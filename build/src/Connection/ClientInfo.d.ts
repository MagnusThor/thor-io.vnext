export declare class ClientInfo {
    /**
     * The client identifier.
     *
     * @type {string}
     */
    CI: string;
    /**
     * The controller identifier.
     *
     * @type {string}
     */
    C: string;
    /**
     * The timestamp when the instance was created.
     *
     * @type {Date}
     */
    TS: Date;
    /**
     * Creates an instance of ClientInfo.
     *
     * @param {string} ci - The client identifier.
     * @param {string} controller - The controller identifier.
     */
    constructor(ci: string, controller: string);
}
