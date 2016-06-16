import {
    ThorIO
} from "../src/thor-io"
class ChatMessage {
    message: string;
    age: number;
}
export class ChatController extends ThorIO.Controller {
    private age: number;
    constructor(client: ThorIO.Connection) {
        super(client);
        this.alias = "chat";
        this.age = 1;
    }

    sendChatMessage(data: ChatMessage, topic: string, controller: string) {
        var expression = (pre: ChatController) => {
            if (pre.age >= this.age) return pre;
        }
        this.invokeTo(expression, data, "chatMessage", this.alias);
    }
}