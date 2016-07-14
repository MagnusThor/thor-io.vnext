import {
    ThorIO,
    CanInvoke,
    CanSet,
    ControllerProperties
} from "../src/thor-io"

class ChatMessage {
    message: string;
    age: number;
    constructor(age:number,message:string){
        this.age = age;
        this.message = message;
    }
}

// This controller is seald, and cannot be connected to. A seald controller 
// is created upon start of the ThorIO.Engine. Common use case would be some thing
// that produces data, and passed it to other controllers 

@ControllerProperties("chatMessageProducer",true)
export class SealdController extends ThorIO.Controller{
    constructor(client:ThorIO.Connection){
        super(client);
        setInterval( () => {
            // send a chatMessage event 15 seconds..
            let message = new ChatMessage(1,new Date().toString());
                this.invokeToAll(message,"chatMessage","chat");
        },15000);
    };

}

@ControllerProperties("chat",false)
export class ChatController extends ThorIO.Controller {
   
    @CanSet(true) // this property can be modified (set) by the clients
    age: number = 1;

    constructor(client: ThorIO.Connection) {
        super(client);
    }

    @CanInvoke(true) // this method can be called / invoke by clients
    sendChatMessage(data: ChatMessage, topic: string, controller: string) {
        var expression = (pre: ChatController) => {
            return pre.age >= this.age;
        };
        this.invokeTo(expression, data, "chatMessage", this.alias);
    }

}