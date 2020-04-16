/// <reference types="node" />
import { TextMessage } from './TextMessage';
import { ITransportMessage } from '../Interfaces/ITransportMessage';
export declare class BufferMessage implements ITransportMessage {
    data: Buffer;
    binary: boolean;
    constructor(data: Buffer, binary: boolean);
    toMessage(): TextMessage;
    toBuffer(): Buffer;
}
