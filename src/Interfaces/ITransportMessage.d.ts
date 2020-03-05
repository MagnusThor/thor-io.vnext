/// <reference types="node" />
import { Message } from "../Messages/Message";
export interface ITransportMessage {
    toMessage(): Message;
    toBuffer(message?: Message): Buffer;
    binary: boolean;
    data: any;
}
