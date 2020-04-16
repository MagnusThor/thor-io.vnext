/// <reference types="node" />
import { TextMessage } from './TextMessage';
import { ITransportMessage } from '../Interfaces/ITransportMessage';
export declare class PipeMessage implements ITransportMessage {
    data: any;
    binary: boolean;
    private message;
    private arr;
    constructor(data: any, binary: boolean);
    toBuffer(): Buffer;
    toMessage(): TextMessage;
}
