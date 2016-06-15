import {ThorIO} from "../src/thor-io"

export class Generic extends ThorIO.Controller {
    public alias: string;
    public clientInfo: any;
    public room: string;
    constructor(client: ThorIO.Connection) {
        super(client);
        this.room = "foo";
        this.alias = "example";
    }
    sendMessage(data, controller, topic) {
        this.invoke(data, "invoke", this.alias);
        this.invokeToAll(data, "invokeToAll", this.alias);
        var expression =
            (pre: Generic) => {
                if (pre.room === "foo") return pre;
            };

        this.invokeTo(expression, data, "invokeTo", this.alias);
        this.publishToAll(data, "sub", this.alias);
    }
    onopen() {
        console.log("called on open")
    }
    onclose() {
        console.log("called on close")
    }
}