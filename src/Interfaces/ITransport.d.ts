import { ITransportMessage } from "./ITransportMessage";
export interface ITransport {
    id: string;
    send(data: any): any;
    close(reason: number, message: any): any;
    addEventListener(topic: string, fn: Function): any;
    socket: any;
    readyState: number;
    ping(): any;
    onMessage: (message: ITransportMessage) => void;
}
