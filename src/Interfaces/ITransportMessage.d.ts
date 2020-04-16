/// <reference types="node" />
import { TextMessage } from "../Messages/TextMessage";
export interface ITransportMessage {
    toMessage(): TextMessage;
    toBuffer(message?: TextMessage): Buffer;
    binary: boolean;
    data: any;
}
