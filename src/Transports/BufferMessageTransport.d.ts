/// <reference types="node" />
import * as net from 'net';
import { ITransport } from '../Interfaces/ITransport';
import { ITransportMessage } from '../Interfaces/ITransportMessage';
import { IInterceptor } from '../Interfaces/IInterceptor';
import { IncomingMessage } from 'http';
export declare class BufferMessageTransport implements ITransport {
    socket: net.Socket;
    id: string;
    onMessage: (messsage: ITransportMessage) => void;
    constructor(socket: net.Socket);
    request: IncomingMessage | any;
    interceptors: Map<string, IInterceptor>;
    onClose: () => void;
    onOpen: () => void;
    get readyState(): number;
    send(data: string): void;
    addEventListener(name: string, fn: any): void;
    ping(): void;
    close(): void;
}
