"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientInfo = void 0;
class ClientInfo {
    /**
     * Creates an instance of ClientInfo.
     *
     * @param {string} ci - The client identifier.
     * @param {string} controller - The controller identifier.
     */
    constructor(ci, controller) {
        this.CI = ci;
        this.C = controller;
        this.TS = new Date();
    }
}
exports.ClientInfo = ClientInfo;
