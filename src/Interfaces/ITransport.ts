import { ITransportMessage } from "./ITransportMessage";
/**
 *
 *
 * @export
 * @interface ITransport
 */
export interface ITransport {
    /**
     *
     *
     * @type {string}
     * @memberOf ITransport
     */
    id: string;
    /**
     *
     *
     * @param {*} data
     *
     * @memberOf ITransport
     */
    send(data: any);
    /**
     *
     *
     * @param {number} reason
     * @param {*} message
     *
     * @memberOf ITransport
     */
    close(reason: number, message: any);
    /**
     *
     *
     * @param {string} topic
     * @param {Function} fn
     *
     * @memberOf ITransport
     */
    addEventListener(topic: string, fn: Function);
    /**
     *
     *
     * @type {*}
     * @memberOf ITransport
     */
    socket: any;
    /**
     *
     *
     * @type {number}
     * @memberOf ITransport
     */
    readyState: number;
    /**
     *
     *
     *
     * @memberOf ITransport
     */
    ping();
    /**
     *
     *
     *
     * @memberOf ITransport
     */
    onMessage: (message: ITransportMessage) => void;
}
