"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const thor_io_client_vnext_1 = require("thor-io.client-vnext");
class TestClient {
    constructor() {
        this.factory = new thor_io_client_vnext_1.ClientFactory("ws://localhost:1337", ["example"], {});
        this.factory.onOpen = (controller) => {
            this.controller = controller;
            console.log(`a connection is made to example`, controller);
            controller.connect();
        };
    }
}
exports.TestClient = TestClient;
document.addEventListener("DOMContentLoaded", () => {
    let testClient = new TestClient();
    window["testClient"] = testClient;
});
