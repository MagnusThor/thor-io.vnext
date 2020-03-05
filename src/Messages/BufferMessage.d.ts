/// <reference types="node" />
import { Message } from './Message';
import { ITransportMessage } from '../Interfaces/ITransportMessage';
export declare class BufferMessage implements ITransportMessage {
    data: Buffer;
    binary: boolean;
    constructor(data: Buffer, binary: boolean);
    toMessage(): Message;
    toBuffer(): Buffer;
}
