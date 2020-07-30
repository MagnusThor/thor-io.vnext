
export class ClientInfo {
    /**
     *
     *
     * @type {string}
     * @memberOf ClientInfo
     */
    public CI: string;
    /**
     *
     *
     * @type {string}
     * @memberOf ClientInfo
     */
    public C: string;
    /**
     *
     *
     * @type {Date}
     * @memberOf ClientInfo
     */
    public TS: Date;
    /**
     * Creates an instance of ClientInfo.
     *
     * @param {string} ci
     * @param {string} controller
     *
     * @memberOf ClientInfo
     */
    constructor(ci: string, controller: string) {
        this.CI = ci;
        this.C = controller;
        this.TS = new Date();
    }
}
