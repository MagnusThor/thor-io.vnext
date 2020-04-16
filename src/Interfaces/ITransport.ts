import { ITransportMessage } from "./ITransportMessage";
import { IInterceptor } from "./IInterceptor";

/**
 *
 *
 * @export
 * @interface ITransport
 */
export interface ITransport {
    id: string;
    socket: any;
    readyState: number;
    send(data: any);
    close(reason: number, message: any);
    addEventListener(topic: string, fn: Function);
    ping();
    onMessage: (message: ITransportMessage) => void;
    onClose: (e: any) => void;
    onOpen: (e: any) => void;
    interceptors: Map<string,IInterceptor>;
}
