/// <reference types="node" />
import { ITransport } from '../Interfaces/ITransport';
import { ITransportMessage } from '../Interfaces/ITransportMessage';
import { IInterceptor } from '../Interfaces/IInterceptor';
import { IncomingMessage } from 'http';
export declare class WebSocketMessageTransport implements ITransport {
    request: IncomingMessage | Request;
    socket: WebSocket;
    onMessage: (message: ITransportMessage) => void;
    id: string;
    send(data: any): void;
    close(reason: number, message: string): void;
    addEventListener(name: string, fn: any): void;
    constructor(socket: any, req: IncomingMessage);
    interceptors: Map<string, IInterceptor>;
    onClose: (ev: any) => void;
    onOpen: (ev: any) => void;
    get readyState(): number;
    ping(): void;
}
