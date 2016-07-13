import {
    ThorIO,
    CanInvoke,
    CanSet,
    ControllerProperties
} from "../src/thor-io"

class ChatMessage {
    message: string;
    age: number;
}

@ControllerProperties("chat")
export class ChatController extends ThorIO.Controller {

   
    @CanSet(true) // this property can be modified (set) by the clients
    age: number ;

    constructor(client: ThorIO.Connection) {
        super(client);
        this.age = 1;
    }

    @CanInvoke(true) // this method can be called / invoke by clients
    sendChatMessage(data: ChatMessage, topic: string, controller: string) {
       
        var expression = (pre: ChatController) => {
            console.log("-->", pre.age,this.age);
            if (pre.age >= this.age) return pre;
        }
        this.invokeTo(expression, data, "chatMessage", this.alias);
    }

}