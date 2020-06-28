"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const thor_io_client_vnext_1 = require("thor-io.client-vnext");
class TestClient {
    constructor() {
        this.factory = new thor_io_client_vnext_1.Factory("ws://localhost:1337", ["mycontroller"], {});
        this.factory.OnOpen = (controller) => {
            this.controllers = controller;
            console.log(controller);
            controller.Connect();
        };
    }
}
exports.TestClient = TestClient;
document.addEventListener("DOMContentLoaded", () => {
    let testClient = new TestClient();
    window["testClient"] = testClient;
});
