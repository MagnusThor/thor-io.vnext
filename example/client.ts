import { Factory, WebRTC, BinaryMessage, Message } from 'thor-io.client-vnext'
import { Controller } from 'thor-io.client-vnext/src/Controller';

export class TestClient{
    factory: any;
    controllers: Controller;

    
        constructor(){         
            this.factory = new Factory("ws://localhost:1337",["mycontroller"],{});
            
            this.factory.OnOpen = (controller: Controller) => {    
                this.controllers = controller;               

                console.log(controller);

                controller.Connect();

            };                
        


        }

}


document.addEventListener("DOMContentLoaded",() => {

    let testClient = new TestClient()

    window["testClient"] = testClient; // expose API to console 

});