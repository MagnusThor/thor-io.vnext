import { ClientFactory, WebRTCFactory, BinaryMessage, TextMessage, Controller } from 'thor-io.client-vnext'

export class TestClient{
    factory: ClientFactory;
    controller: Controller;

        constructor(){         
            this.factory = new ClientFactory("ws://localhost:1337",["example"],{});
            this.factory.onOpen = (controller: Controller) => {    
                this.controller = controller;               
                console.log(`a connection is made to example`,controller);
                controller.connect();
            };               
        
        }

}


document.addEventListener("DOMContentLoaded",() => {
    let testClient = new TestClient()
    window["testClient"] = testClient; // Expose to console 

});