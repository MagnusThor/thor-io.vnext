/// <reference types="node" />
import { TextMessage } from './TextMessage';
import { ITransportMessage } from '../Interfaces/ITransportMessage';
export declare class WebSocketMessage implements ITransportMessage {
    data: string;
    binary: any;
    constructor(data: string, binary: any);
    toBuffer(): Buffer;
    toMessage(): TextMessage;
}
