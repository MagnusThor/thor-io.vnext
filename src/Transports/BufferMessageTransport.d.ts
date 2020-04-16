/// <reference types="node" />
import * as net from 'net';
import { ITransport } from '../Interfaces/ITransport';
import { ITransportMessage } from '../Interfaces/ITransportMessage';
export declare class BufferMessageTransport implements ITransport {
    socket: net.Socket;
    id: string;
    onMessage: (messsage: ITransportMessage) => void;
    constructor(socket: net.Socket);
    onClose: () => void;
    onOpen: () => void;
    readonly readyState: number;
    send(data: string): void;
    addEventListener(name: string, fn: any): void;
    ping(): void;
    close(): void;
}
