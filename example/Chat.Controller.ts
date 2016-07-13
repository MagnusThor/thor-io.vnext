import {
    ThorIO,CanInvoke,CanSet,ControllerProperties
} from "../src/thor-io"






class ChatMessage {
    message: string;
    age: number;
}





@ControllerProperties("chat")
export class ChatController extends ThorIO.Controller {

    gender: string;

    @CanSet(true)
    age: number;

    constructor(client: ThorIO.Connection) {
        super(client);
        this.alias = "chat";
        this.age = 1;
        this.gender = "male";

    }

    @CanInvoke(true)
    sendChatMessage(data: ChatMessage, topic: string, controller: string) {
        var expression = (pre: ChatController) => {
            if (pre.age >= this.age) return pre;
        }
        this.invokeTo(expression, data, "chatMessage", this.alias);
    }
   
}