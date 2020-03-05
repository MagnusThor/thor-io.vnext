"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ClientInfo {
    constructor(ci, controller) {
        this.CI = ci;
        this.C = controller;
        this.TS = new Date();
    }
}
exports.ClientInfo = ClientInfo;
