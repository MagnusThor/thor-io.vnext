import { ThorIO } from "../src/thor-io";
export declare class DataSync extends ThorIO.Controller {
    private Person;
    constructor(client: ThorIO.Connection);
}
export declare class ExampleController extends ThorIO.Controller {
    alias: string;
    clientInfo: any;
    room: string;
    constructor(client: ThorIO.Connection);
    sendMessage(data: any, controller: any, topic: any): void;
    onopen(): void;
    onclose(): void;
}
