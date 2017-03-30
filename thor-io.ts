import * as net from 'net';

import 'reflect-metadata';

/**
 * 
 * 
 * @export
 * @param {boolean} state
 * @returns
 */
export function CanInvoke(state: boolean) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata("canInvokeOrSet", state, target, propertyKey);
    }
}
/**
 * 
 * 
 * @export
 * @param {boolean} state
 * @returns
 */
export function CanSet(state: boolean) {
    return function (target: Object, propertyKey: string) {
        Reflect.defineMetadata("canInvokeOrSet", state, target, propertyKey);
    }
}
/**
 * 
 * 
 * @export
 * @param {string} alias
 * @param {boolean} [seald]
 * @param {number} [heartbeatInterval]
 * @returns
 */
export function ControllerProperties(alias: string, seald?: boolean, heartbeatInterval?: number) {
    return function (target: Function) {
        Reflect.defineMetadata("seald", seald || false, target);
        Reflect.defineMetadata("alias", alias, target);
        Reflect.defineMetadata("heartbeatInterval", heartbeatInterval || -1, target)
    }
}

export namespace ThorIO {


    /**
     * 
     * 
     * @export
     * @class Utils
     */
    export class Utils {
        /**
         * 
         * 
         * @static
         * @param {string} str
         * @returns {Uint8Array}
         * 
         * @memberOf Utils
         */
        static stingToBuffer(str: string): Uint8Array {
            let len = str.length;
            let arr = new Array(len);
            for (let i = 0; i < len; i++) {
                arr[i] = str.charCodeAt(i) & 0xFF;
            }
            return new Uint8Array(arr);
        }
        /**
         * 
         * 
         * @static
         * @param {Uint8Array} byteArray
         * @returns {number}
         * 
         * @memberOf Utils
         */
        static arrayToLong(byteArray: Uint8Array): number {
            var value = 0;
            for (var i = byteArray.byteLength - 1; i >= 0; i--) {
                value = (value * 256) + byteArray[i];
            }
            return value;
        }
        /**
         * 
         * 
         * @static
         * @param {number} long
         * @returns {Array<number>}
         * 
         * @memberOf Utils
         */
        static longToArray(long: number): Array<number> {
            var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
            for (var index = 0; index < byteArray.length; index++) {
                var byte = long & 0xff;
                byteArray[index] = byte;
                long = (long - byte) / 256;
            }
            return byteArray;
        }
        /**
         * 
         * 
         * @static
         * @returns {string}
         * 
         * @memberOf Utils
         */
        static newGuid(): string {
            /**
             * 
             * 
             * @returns
             */
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
        }
        /**
         * 
         * 
         * @static
         * @returns {string}
         * 
         * @memberOf Utils
         */
        static randomString(): string {
            return Math.random().toString(36).substring(2);
        }
    }

    /**
     * 
     * 
     * @export
     * @class Plugin
     * @template T
     */
    export class Plugin<T> {
        /**
         * 
         * 
         * @type {string}
         * @memberOf Plugin
         */
        public alias: string;
        /**
         * 
         * 
         * @type {T}
         * @memberOf Plugin
         */
        public instance: T;
        /**
         * Creates an instance of Plugin.
         * 
         * @param {T} controller
         * 
         * @memberOf Plugin
         */
        constructor(controller: T) {
            this.alias = Reflect.getMetadata("alias", controller);
            this.instance = controller;
        }
    }

    /**
     * 
     * 
     * @export
     * @class Engine
     */
    export class Engine {

        /**
         * 
         * 
         * @private
         * @type {Array<Plugin<Controller>>}
         * @memberOf Engine
         */
        private controllers: Array<Plugin<Controller>>;
        /**
         * 
         * 
         * @private
         * @type {Array<Connection>}
         * @memberOf Engine
         */
        private connections: Array<Connection>;
        /**
         * 
         * 
         * @private
         * @type {Array<any>}
         * @memberOf Engine
         */
        private endpoints: Array<any>;

        /**
         * Creates an instance of Engine.
         * 
         * @param {Array<any>} controllers
         * 
         * @memberOf Engine
         */
        constructor(controllers: Array<any>) {
            this.endpoints = [];
            this.connections = [];
            this.controllers = [];

            controllers.forEach((ctrl: Controller) => {
                if (!Reflect.hasOwnMetadata("alias", ctrl)) {
                    throw "Faild to register on of the specified ThorIO.Controller's"
                }
                var plugin = new Plugin<Controller>(ctrl);
                this.controllers.push(plugin);

            });
        }

        /**
         * 
         * 
         * @public
         * 
         * @memberOf Engine
         */
        public createSealdControllers() {
            this.controllers.forEach((controller: Plugin<Controller>) => {
                if (Reflect.getMetadata("seald", controller.instance)) {
                    new controller.instance( new ThorIO.Connection(null, this.connections, this.controllers));
                }
            });
        }
        /**
         * 
         * 
         * @param {string} id
         * @param {number} reason
         * 
         * @memberOf Engine
         */
        removeConnection(id: string, reason: number): void {
            try {
                /**
                 * 
                 * 
                 * @param {Connection} pre
                 * @returns
                 */
                let connection = this.connections.find((pre: Connection) => {
                    return pre.id === id;
                });
                let index = this.connections.indexOf(connection);
                if (index >= 0)
                    this.connections.splice(index, 1);
            } catch (error) {
                // todo: do op's
            }
        }
        /**
         * 
         * 
         * @param {{ new (...args: any[]): ITransport; }} typeOfTransport
         * @param {string} host
         * @param {number} port
         * @returns {net.Server}
         * 
         * @memberOf Engine
         */
        addEndpoint(typeOfTransport: { new (...args: any[]): ITransport; }, host: string, port: number): net.Server {
            /**
             * 
             * 
             * @param {net.Socket} socket
             */
            let endpoint = net.createServer((socket: net.Socket) => {
                let transport = new typeOfTransport(socket);
                this.addConnection(transport);
            });
            endpoint.listen(port, host, ((listener: any) => {
                // do op
            }));
            this.endpoints.push(endpoint);
            return endpoint;
        }

        /**
         * 
         * 
         * @param {*} ws
         * @param {*} req
         * 
         * @memberOf Engine
         */
        addWebSocket(ws: any, req: any): void {
            let transport = new WebSocketMessageTransport(ws);
            this.addConnection(transport)
        }

        /**
         * 
         * 
         * @private
         * @param {ITransport} transport
         * 
         * @memberOf Engine
         */
        private addConnection(transport: ITransport): void {

            transport.addEventListener("close", (reason) => {
                this.removeConnection(transport.id, reason);
            });
            this.connections.push(
                new Connection(transport, this.connections, this.controllers)
            );
        }
    }

    /**
     * 
     * 
     * @export
     * @class Message
     */
    export class Message {

        /**
         * 
         * 
         * @type {Buffer}
         * @memberOf Message
         */
        B: Buffer;
        /**
         * 
         * 
         * @type {string}
         * @memberOf Message
         */
        T: string;
        /**
         * 
         * 
         * @type {*}
         * @memberOf Message
         */
        D: any;
        /**
         * 
         * 
         * @type {string}
         * @memberOf Message
         */
        C: string;

        /**
         * 
         * 
         * @type {Boolean}
         * @memberOf Message
         */
        isBinary: Boolean;

        /**
         * 
         * 
         * @readonly
         * @type {*}
         * @memberOf Message
         */
        get JSON(): any {
            return {
                T: this.T,
                D: JSON.stringify(this.D),
                C: this.C
            }
        };
        /**
         * Creates an instance of Message.
         * 
         * @param {string} topic
         * @param {string} data
         * @param {string} controller
         * @param {Buffer} [arrayBuffer]
         * 
         * @memberOf Message
         */
        constructor(topic: string, data: string, controller: string, arrayBuffer?: Buffer) {
            this.D = data;
            this.T = topic;
            this.C = controller;
            this.B = arrayBuffer;
            if (arrayBuffer) this.isBinary = true;
        }
        /**
         * 
         * 
         * @returns
         * 
         * @memberOf Message
         */
        toString() {
            return JSON.stringify(this.JSON);
        }
        /**
         * 
         * 
         * @static
         * @param {Buffer} buffer
         * @returns {Message}
         * 
         * @memberOf Message
         */
        static fromArrayBuffer(buffer: Buffer): Message {
            let headerLen = 8;
            let header = buffer.slice(0, 8);
            let payloadLength = ThorIO.Utils.arrayToLong(header);
            let message = buffer.slice(headerLen, payloadLength + headerLen);
            let blobOffset = headerLen + payloadLength;
            let blob = buffer.slice(blobOffset, buffer.byteLength);
            let data = JSON.parse(message.toString());
            return new Message(data.T, data.D, data.C, blob);
        }
        /**
         * 
         * 
         * @returns {Buffer}
         * 
         * @memberOf Message
         */
        toArrayBuffer(): Buffer {
            let messagePayload = this.toString();
            let payloadLength = messagePayload.length;
            let header = new Buffer(ThorIO.Utils.longToArray(payloadLength));
            let message = new Buffer(payloadLength);
            message.write(messagePayload, 0, payloadLength, "utf-8");
            var blob = new Buffer(this.B);
            var buffer = Buffer.concat([header, message, blob]);
            return buffer;
        }

    }

    /**
     * 
     * 
     * @export
     * @class Listener
     */
    export class Listener {
        /**
         * 
         * 
         * @type {Function}
         * @memberOf Listener
         */
        fn: Function;
        /**
         * 
         * 
         * @type {string}
         * @memberOf Listener
         */
        topic: string;
        /**
         * Creates an instance of Listener.
         * 
         * @param {string} topic
         * @param {Function} fn
         * 
         * @memberOf Listener
         */
        constructor(topic: string, fn: Function) {
            this.fn = fn;
            this.topic = topic;
        }
    }
    // todo: refactor this, implememt PI for a sticky session?
    /**
     * 
     * 
     * @export
     * @class ClientInfo
     */
    export class ClientInfo {
        /**
         * 
         * 
         * @type {string}
         * @memberOf ClientInfo
         */
        public CI: string;
        /**
         * 
         * 
         * @type {string}
         * @memberOf ClientInfo
         */
        public C: string;
        /**
         * 
         * 
         * @type {Date}
         * @memberOf ClientInfo
         */
        public TS: Date;
        /**
         * Creates an instance of ClientInfo.
         * 
         * @param {string} ci
         * @param {string} controller
         * 
         * @memberOf ClientInfo
         */
        constructor(ci: string, controller: string) {
            this.CI = ci;
            this.C = controller;
            this.TS = new Date();
        }
    }

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
        id: string
        /**
         * 
         * 
         * @param {*} data
         * 
         * @memberOf ITransport
         */
        send(data: any)
        /**
         * 
         * 
         * @param {number} reason
         * @param {*} message
         * 
         * @memberOf ITransport
         */
        close(reason: number, message: any)
        /**
         * 
         * 
         * @param {string} topic
         * @param {Function} fn
         * 
         * @memberOf ITransport
         */
        addEventListener(topic: string, fn: Function)
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
        ping()
        /**
         * 
         * 
         * 
         * @memberOf ITransport
         */
        onMessage: (message: ITransportMessage) => void
    }

    /**
     * 
     * 
     * @export
     * @interface ITransportMessage
     */
    export interface ITransportMessage {
        /**
         * 
         * 
         * @returns {ThorIO.Message}
         * 
         * @memberOf ITransportMessage
         */
        toMessage(): ThorIO.Message
        /**
         * 
         * 
         * @param {ThorIO.Message} [message]
         * @returns {Buffer}
         * 
         * @memberOf ITransportMessage
         */
        toBuffer(message?: ThorIO.Message): Buffer
        /**
         * 
         * 
         * @type {boolean}
         * @memberOf ITransportMessage
         */
        binary: boolean
        /**
         * 
         * 
         * @type {*}
         * @memberOf ITransportMessage
         */
        data: any
    }

    /**
     * 
     * 
     * @export
     * @class PipeMessage
     * @implements {ITransportMessage}
     */
    export class PipeMessage implements ITransportMessage {

        /**
         * 
         * 
         * @private
         * @type {Message}
         * @memberOf PipeMessage
         */
        private message: Message;
        /**
         * 
         * 
         * @private
         * @type {Array<string>}
         * @memberOf PipeMessage
         */
        private arr: Array<string>;
        /**
         * Creates an instance of PipeMessage.
         * 
         * @param {*} data
         * @param {boolean} binary
         * 
         * @memberOf PipeMessage
         */
        constructor(public data: any, public binary: boolean) {

            this.message = JSON.parse(this.data) as Message;

            this.arr = new Array<string>();
            this.arr.push(this.message.C);
            this.arr.push(this.message.T);
            this.arr.push(this.message.D);

        }

        /**
         * 
         * 
         * @returns
         * 
         * @memberOf PipeMessage
         */
        toBuffer() {
            return new Buffer(this.arr.join("|"));
        }
        /**
         * 
         * 
         * @returns {Message}
         * 
         * @memberOf PipeMessage
         */
        public toMessage(): Message {
            return this.message;
        }
    }

    /**
     * 
     * 
     * @export
     * @class BufferMessage
     * @implements {ITransportMessage}
     */
    export class BufferMessage implements ITransportMessage {

        /**
         * Creates an instance of BufferMessage.
         * 
         * @param {Buffer} data
         * @param {boolean} binary
         * 
         * @memberOf BufferMessage
         */
        constructor(public data: Buffer, public binary: boolean) {

        }

        /**
         * 
         * 
         * @returns {Message}
         * 
         * @memberOf BufferMessage
         */
        toMessage(): Message {

            const headerLen = 3;

            const tLen = this.data.readUInt8(0);
            const cLen = this.data.readUInt8(1);
            const dLen = this.data.readUInt8(2);

            let offset = headerLen;
            const topic = this.data.toString("utf-8", offset, tLen + offset);

            offset += tLen;
            const controller = this.data.toString("utf-8", offset, offset + cLen);

            offset += cLen;
            const data = this.data.toString("utf-8", offset, offset + dLen)

            let message = new ThorIO.Message(topic, data, controller);

            return message;

        }

        /**
         * 
         * 
         * @returns {Buffer}
         * 
         * @memberOf BufferMessage
         */
        toBuffer(): Buffer {

            let message = JSON.parse(this.data.toString()) as Message;

            const header = 3;
            let offset = 0;

            const tLen = message.T.length;
            const dLen = message.D.length;
            const cLen = message.C.length;

            let bufferSize = header + tLen + dLen + cLen;

            let buffer = new Buffer(bufferSize);

            buffer.writeUInt8(tLen, 0);

            buffer.writeUInt8(cLen, 1)

            buffer.writeInt8(dLen, 2);

            offset = header;
            buffer.write(message.T, offset);
            offset += tLen;
            buffer.write(message.C, offset);
            offset += cLen;
            buffer.write(message.D, offset);

            return buffer;

        }


    }

    /**
     * 
     * 
     * @export
     * @class WebSocketMessage
     * @implements {ITransportMessage}
     */
    export class WebSocketMessage implements ITransportMessage {
        /**
         * Creates an instance of WebSocketMessage.
         * 
         * @param {string} data
         * @param {any} binary
         * 
         * @memberOf WebSocketMessage
         */
        constructor(public data: string, public binary) {

        }
        /**
         * 
         * 
         * @returns {Buffer}
         * 
         * @memberOf WebSocketMessage
         */
        toBuffer(): Buffer {
            throw "not yet implemented";
        }
        /**
         * 
         * 
         * @returns {Message}
         * 
         * @memberOf WebSocketMessage
         */
        toMessage(): Message {
            return JSON.parse(this.data) as Message;
        }
    }

    /**
     * 
     * 
     * @export
     * @class BufferMessageTransport
     * @implements {ITransport}
     */
    export class BufferMessageTransport implements ITransport {
        /**
         * 
         * 
         * @type {string}
         * @memberOf BufferMessageTransport
         */
        id: string;
        /**
         * 
         * 
         * 
         * @memberOf BufferMessageTransport
         */
        onMessage: (messsage: ITransportMessage) => void;
        /**
         * Creates an instance of BufferMessageTransport.
         * 
         * @param {net.Socket} socket
         * 
         * @memberOf BufferMessageTransport
         */
        constructor(public socket: net.Socket) {
            this.id = ThorIO.Utils.newGuid();

            this.socket.addListener("data", (buffer: Buffer) => {

                let bm = new BufferMessage(buffer, false);

                this.onMessage(bm);

            });
        }
        /**
         * 
         * 
         * @readonly
         * 
         * @memberOf BufferMessageTransport
         */
        get readyState() {
            return 1;
        }
        /**
         * 
         * 
         * @param {string} data
         * 
         * @memberOf BufferMessageTransport
         */
        send(data: string) {
            let bm = new BufferMessage(new Buffer(data), false);
            this.socket.write(bm.toBuffer())
        }
        /**
         * 
         * 
         * @param {string} name
         * @param {Function} fn
         * 
         * @memberOf BufferMessageTransport
         */
        addEventListener(name: string, fn: Function) {
            this.socket.addListener(name, fn);

        }
        /**
         * 
         * 
         * @returns
         * 
         * @memberOf BufferMessageTransport
         */
        ping() {
            return;
        }
        /**
         * 
         * 
         * 
         * @memberOf BufferMessageTransport
         */
        close() {
            this.socket.destroy();
        }
    }

    /**
     * 
     * 
     * @export
     * @class PipeMessageTransport
     * @implements {ITransport}
     */
    export class PipeMessageTransport implements ITransport {
        /**
         * 
         * 
         * @type {string}
         * @memberOf PipeMessageTransport
         */
        id: string;
        /**
         * 
         * 
         * 
         * @memberOf PipeMessageTransport
         */
        onMessage: (message: PipeMessage) => void;
        /**
         * 
         * 
         * @param {*} data
         * 
         * @memberOf PipeMessageTransport
         */
        send(data: any) {

            let message = new PipeMessage(data, false);

            this.socket.write(message.toBuffer());
        }
        /**
         * 
         * 
         * @param {number} reason
         * @param {*} message
         * 
         * @memberOf PipeMessageTransport
         */
        close(reason: number, message: any) {
            this.socket.destroy();
        }
        /**
         * 
         * 
         * @param {string} name
         * @param {Function} fn
         * 
         * @memberOf PipeMessageTransport
         */
        addEventListener(name: string, fn: Function) {
            this.socket.addListener(name, fn);
        }
        /**
         * 
         * 
         * @readonly
         * @type {number}
         * @memberOf PipeMessageTransport
         */
        get readyState(): number {
            return 1;
        }
        /**
         * 
         * 
         * @returns
         * 
         * @memberOf PipeMessageTransport
         */
        ping() {
            return;
        }
        /**
         * Creates an instance of PipeMessageTransport.
         * 
         * @param {net.Socket} socket
         * 
         * @memberOf PipeMessageTransport
         */
        constructor(public socket: net.Socket) {
            this.id = ThorIO.Utils.newGuid();
            socket.addListener("data", (buffer: Buffer) => {
                let args = buffer.toString().split("|");
                let message = new Message(args[1], args[2], args[0]);
                this.onMessage(new PipeMessage(message.toString(), false))
            });
        }
    }

    /**
     * 
     * 
     * @export
     * @class WebSocketMessageTransport
     * @implements {ITransport}
     */
    export class WebSocketMessageTransport implements ITransport {
        /**
         * 
         * 
         * @type {WebSocket}
         * @memberOf WebSocketMessageTransport
         */
        socket: WebSocket;
        /**
         * 
         * 
         * 
         * @memberOf WebSocketMessageTransport
         */
        onMessage: (message: ITransportMessage) => void;;
        /**
         * 
         * 
         * @type {string}
         * @memberOf WebSocketMessageTransport
         */
        id: string;
        /**
         * 
         * 
         * @param {*} data
         * 
         * @memberOf WebSocketMessageTransport
         */
        send(data: any) {

            this.socket.send(data)
        }
        /**
         * 
         * 
         * @param {number} reason
         * @param {string} message
         * 
         * @memberOf WebSocketMessageTransport
         */
        close(reason: number, message: string) {
            this.socket.close(reason, message)
        }
        /**
         * 
         * 
         * @param {string} name
         * @param {*} fn
         * 
         * @memberOf WebSocketMessageTransport
         */
        addEventListener(name: string, fn: any) {
            this.socket.addEventListener(name, fn)
        }
        /**
         * Creates an instance of WebSocketMessageTransport.
         * 
         * @param {*} socket
         * 
         * @memberOf WebSocketMessageTransport
         */
        constructor(socket: any) {
            this.id = ThorIO.Utils.newGuid();
            this.socket = socket;
            this.socket.addEventListener("message", (event: any) => {
                this.onMessage(new WebSocketMessage(event.data, event.binary));
            });
        }
        /**
         * 
         * 
         * @readonly
         * 
         * @memberOf WebSocketMessageTransport
         */
        get readyState() {
            return this.socket.readyState;
        }
        /**
         * 
         * 
         * 
         * @memberOf WebSocketMessageTransport
         */
        ping() {
            this.socket["ping"]();
        }
    }

    /**
     * 
     * 
     * @export
     * @class Connection
     */
    export class Connection {
        /**
         * 
         * 
         * @type {Array<any>}
         * @memberOf Connection
         */
        public errors: Array<any>;
        /**
         * 
         * 
         * @type {number}
         * @memberOf Connection
         */
        public pingPongInterval: number;
        /**
         * 
         * 
         * @type {Array<ThorIO.Controller>}
         * @memberOf Connection
         */
        public controllerInstances: Array<ThorIO.Controller>;
        /**
         * 
         * 
         * @type {ThorIO.ClientInfo}
         * @memberOf Connection
         */
        public clientInfo: ThorIO.ClientInfo;
        /**
         * 
         * 
         * @private
         * @param {Controller} controller
         * @param {string} method
         * @param {string} data
         * @param {*} [buffer]
         * 
         * @memberOf Connection
         */
        private methodInvoker(controller: Controller, method: string, data: string, buffer?: any) {
            try {
                if (!controller.canInvokeMethod(method))
                    throw "method '" + method + "' cant be invoked.";
                if (typeof (controller[method]) === "function") {
                    controller[method].apply(
                        controller, [JSON.parse(data), method,
                        controller.alias, buffer]);
                } else {
                    let prop = method;
                    let propValue = JSON.parse(data);
                    if (typeof (controller[prop]) === typeof (propValue))
                        controller[prop] = propValue;
                }
            } catch (ex) {
                controller.invokeError(ex);
            }
        }

        /**
         * 
         * 
         * @readonly
         * @type {string}
         * @memberOf Connection
         */
        get id(): string {
            return this.transport.id;
        }
        /**
         * Creates an instance of Connection.
         * 
         * @param {ITransport} transport
         * @param {Array<Connection>} connections
         * @param {Array<Plugin<Controller>>} controllers
         * 
         * @memberOf Connection
         */
        constructor(public transport: ITransport, public connections: Array<Connection>, private controllers: Array<Plugin<Controller>>) {
            this.connections = connections;
            this.controllerInstances = [];
            this.errors = [];
            if (transport) {
                /**
                 * 
                 * 
                 * @param {ITransportMessage} event
                 */
                this.transport.onMessage = (event: ITransportMessage) => {
                    try {
                        if (!event.binary) {

                            let message = event.toMessage();

                            let controller = this.locateController(message.C);
                            if (controller)
                                this.methodInvoker(controller, message.T, message.D);
                        } else {
                            let message = Message.fromArrayBuffer(event.data);
                            let controller = this.locateController(message.C);
                            if (controller)
                                this.methodInvoker(controller, message.T, message.D, message.B)
                        }
                    } catch (error) {

                        this.addError(error);
                    }
                };
            }

        }

        /**
         * 
         * 
         * @private
         * @param {*} error
         * 
         * @memberOf Connection
         */
        private addError(error: any) {
            this.errors.push(error);
        }

        /**
         * 
         * 
         * @param {string} alias
         * @returns {boolean}
         * 
         * @memberOf Connection
         */
        hasController(alias: string): boolean {
            /**
             * 
             * 
             * @param {Controller} pre
             * @returns
             */
            let match = this.controllerInstances.filter((pre: Controller) => {
                return pre.alias == alias;
            });
            return match.length >= 0;
        }
        /**
         * 
         * 
         * @param {string} alias
         * 
         * @memberOf Connection
         */
        removeController(alias: string) {
            let index = this.controllerInstances.indexOf(this.getController(alias));
            if (index > -1)
                this.controllerInstances.splice(index, 1);
        }
        /**
         * 
         * 
         * @param {string} alias
         * @returns {Controller}
         * 
         * @memberOf Connection
         */
        getController(alias: string): Controller {
            try {
                /**
                 * 
                 * 
                 * @param {Controller} pre
                 * @returns
                 */
                let match = this.controllerInstances.filter((pre: Controller) => {
                    return pre.alias == alias;
                });
                return match[0];
            } catch (error) {
                return null
            }
        }
        /**
         * 
         * 
         * @private
         * @param {Controller} controller
         * @returns {Controller}
         * 
         * @memberOf Connection
         */
        private addControllerInstance(controller: Controller): Controller {
            this.controllerInstances.push(controller);
            return controller;
        }
        /**
         * 
         * 
         * @private
         * 
         * @memberOf Connection
         */
        private registerSealdController() {
            throw "not yet implemented";
        }
        /**
         * 
         * 
         * @param {string} alias
         * @returns {Controller}
         * 
         * @memberOf Connection
         */
        locateController(alias: string): Controller {
            try {

                /**
                 * 
                 * 
                 * @param {Controller} pre
                 * @returns
                 */
                let match = this.controllerInstances.find((pre: Controller) => {
                    return pre.alias === alias && Reflect.getMetadata("seald", pre.constructor) === false;
                });
                if (match) {
                    return match;
                } else {
                    /**
                     * 
                     * 
                     * @param {Plugin<Controller>} resolve
                     * @returns
                     */
                    let resolvedController = this.controllers.filter((resolve: Plugin<Controller>) => {
                        return resolve.alias === alias && Reflect.getMetadata("seald", resolve.instance) === false;
                    })[0].instance;

                    let controllerInstance = new resolvedController(this);

                    this.addControllerInstance(controllerInstance);

                    controllerInstance.invoke(new ClientInfo(this.id, controllerInstance.alias), "___open", controllerInstance.alias);

                    controllerInstance.onopen();

                    return controllerInstance as Controller;
                }
            } catch (error) {
                this.transport.close(1011, "Cannot locate the specified controller,it may be seald or the the alias in unknown '" + alias + "'. connection closed");
                return null;
            }
        }
    }

    /**
     * 
     * 
     * @export
     * @class Subscription
     */
    export class Subscription {
        /**
         * 
         * 
         * @type {string}
         * @memberOf Subscription
         */
        public topic: string;
        /**
         * 
         * 
         * @type {string}
         * @memberOf Subscription
         */
        public controller: string;
        /**
         * Creates an instance of Subscription.
         * 
         * @param {string} topic
         * @param {string} controller
         * 
         * @memberOf Subscription
         */
        constructor(topic: string, controller: string) {
            this.topic = topic;
            this.controller = controller;
        }
    }
   
   

    
    
    /**
     * 
     * 
     * @export
     * @interface INewable
     * @template T
     */
    export interface Controller {
            new(connection:ThorIO.Connection): ThorIO.Controller
    }

    /**
     * 
     * 
     * @export
     * @class Controller
     * @implements {Controller}
     */
    export class Controller implements Controller  {

        /**
         * 
         * 
         * @type {string}
         * @memberOf Controller
         */
        @CanSet(false)
        public alias: string;
        /**
         * 
         * 
         * @type {Array<Subscription>}
         * @memberOf Controller
         */
        @CanSet(false)
        public subscriptions: Array<Subscription>;
        /**
         * 
         * 
         * @type {Connection}
         * @memberOf Controller
         */
        @CanSet(false)
        public connection: Connection;
        /**
         * 
         * 
         * @private
         * @type {Date}
         * @memberOf Controller
         */
        @CanSet(false)
        private lastPong: Date;
        /**
         * 
         * 
         * @private
         * @type {Date}
         * @memberOf Controller
         */
        @CanSet(false)
        private lastPing: Date;
        /**
         * 
         * 
         * @private
         * @type {number}
         * @memberOf Controller
         */
        @CanSet(false)
        private heartbeatInterval: number;

        /**
         * Creates an instance of Controller.
         * 
         * @param {Connection} connection
         * 
         * @memberOf Controller
         */
        constructor(connection: Connection) {
            this.connection = connection;
            this.subscriptions = [];
            this.alias = Reflect.getMetadata("alias", this.constructor);

            this.heartbeatInterval = Reflect.getMetadata("heartbeatInterval", this.constructor);
            if (this.heartbeatInterval >= 1000) this.enableHeartbeat();
        }
        /**
         * 
         * 
         * @private
         * 
         * @memberOf Controller
         */
        @CanInvoke(false)
        private enableHeartbeat() {
            this.connection.transport.addEventListener("pong", () => {
                this.lastPong = new Date();
            });
            /**
             * 
             */
            let interval = setInterval(() => {
                this.lastPing = new Date();
                if (this.connection.transport.readyState === 1)
                    this.connection.transport.ping();
            }, this.heartbeatInterval);
        }
        /**
         * 
         * 
         * @param {string} method
         * @returns {boolean}
         * 
         * @memberOf Controller
         */
        @CanInvoke(false)
        public canInvokeMethod(method: string): boolean {
            return Reflect.getMetadata("canInvokeOrSet", this, method);
        }
        /**
         * 
         * 
         * @template T
         * @param {string} alias
         * @param {(item: any) => boolean} predicate
         * @returns {Array<any>}
         * 
         * @memberOf Controller
         */
        @CanInvoke(false)
        findOn<T>(alias: string, predicate: (item: any) => boolean): Array<any> {
            /**
             * 
             * 
             * @param {Connection} p
             * @returns
             */
            let connections = this.getConnections(alias).map((p: Connection) => {
                return p.getController(alias);
            });
            return connections.filter(predicate);
        }
        /**
         * 
         * 
         * @param {string} [alias]
         * @returns {Array<Connection>}
         * 
         * @memberOf Controller
         */
        @CanInvoke(false)
        getConnections(alias?: string): Array<Connection> {
            if (!alias) {
                return this.connection.connections;
            } else {
                return this.connection.connections.map((conn: Connection) => {
                    if (conn.hasController(this.alias))
                        return conn;
                })
            }
        }
        /**
         * 
         * 
         * 
         * @memberOf Controller
         */
        @CanInvoke(false)
        onopen() { }

        /**
         * 
         * 
         * 
         * @memberOf Controller
         */
        @CanInvoke(false)
        onclose() { }

        /**
         * 
         * 
         * @template T
         * @template U
         * @param {T[]} array
         * @param {(item: any) => boolean} predicate
         * @param {(item: T) => U} [selector=(x: T) => <U><any>x]
         * @returns {U[]}
         * 
         * @memberOf Controller
         */
        @CanInvoke(false)
        find<T, U>(array: T[], predicate: (item: any) => boolean, selector: (item: T) => U = (x: T) => <U><any>x): U[] {
            return array.filter(predicate).map(selector);
        }
        /**
         * 
         * 
         * @param {*} error
         * 
         * @memberOf Controller
         */
        @CanInvoke(false)
        invokeError(error: any) {
            let msg = new Message("___error", error, this.alias).toString();
            this.invoke(error, "___error", this.alias);
        }
        /**
         * 
         * 
         * @param {*} data
         * @param {string} topic
         * @param {string} [controller]
         * @param {*} [buffer]
         * @returns {Controller}
         * 
         * @memberOf Controller
         */
        @CanInvoke(false)
        invokeToOthers(data: any, topic: string, controller?: string, buffer?: any): Controller {
            this.getConnections().filter((pre: Connection) => {
                return pre.id !== this.connection.id
            })
                .forEach((connection: Connection) => {
                    connection.getController(controller || this.alias).invoke(data, topic, controller || this.alias, buffer);
                });
            return this;
        }
        /**
         * 
         * 
         * @param {*} data
         * @param {string} topic
         * @param {string} [controller]
         * @param {*} [buffer]
         * @returns {Controller}
         * 
         * @memberOf Controller
         */
        @CanInvoke(false)
        invokeToAll(data: any, topic: string, controller?: string, buffer?: any): Controller {
            this.getConnections().forEach((connection: Connection) => {
                connection.getController(controller || this.alias).invoke(data, topic, controller || this.alias, buffer);

            });
            return this;
        }
        /**
         * 
         * 
         * @param {(item: Controller) => boolean} predicate
         * @param {*} data
         * @param {string} topic
         * @param {string} [controller]
         * @param {*} [buffer]
         * @returns {Controller}
         * 
         * @memberOf Controller
         */
        @CanInvoke(false)
        invokeTo(predicate: (item: Controller) => boolean, data: any, topic: string, controller?: string, buffer?: any): Controller {
            let connections = this.findOn(controller || this.alias, predicate);
            connections.forEach((ctrl: Controller) => {
                ctrl.invoke(data, topic, controller || this.alias, buffer);
            });
            return this;
        }
        /**
         * 
         * 
         * @param {*} data
         * @param {string} topic
         * @param {string} [controller]
         * @param {*} [buffer]
         * @returns {Controller}
         * 
         * @memberOf Controller
         */
        @CanInvoke(false)
        invoke(data: any, topic: string, controller?: string, buffer?: any): Controller {
            let msg = new Message(topic, data, controller || this.alias, buffer);
            if (this.connection.transport)
                this.connection.transport.send(!msg.isBinary ? msg.toString() : msg.toArrayBuffer());
            return this;
        }
        /**
         * 
         * 
         * @param {*} data
         * @param {string} topic
         * @param {string} [controller]
         * @returns {Controller}
         * 
         * @memberOf Controller
         */
        @CanInvoke(false)
        publish(data: any, topic: string, controller?: string): Controller {
            if (!this.hasSubscription(topic)) return;
            return this.invoke(data, topic, controller || this.alias);

        }
        /**
         * 
         * 
         * @param {*} data
         * @param {string} topic
         * @param {string} [controller]
         * @returns {Controller}
         * 
         * @memberOf Controller
         */
        @CanInvoke(false)
        publishToAll(data: any, topic: string, controller?: string): Controller {
            let msg = new Message(topic, data, this.alias);
            this.getConnections().forEach((connection: Connection) => {
                let ctrl = connection.getController(controller || this.alias);
                if (ctrl.getSubscription(topic)) {
                    connection.transport.send(msg.toString());
                }
            });
            return this;
        }
        /**
         * 
         * 
         * @param {string} topic
         * @returns {boolean}
         * 
         * @memberOf Controller
         */
        @CanInvoke(false)
        hasSubscription(topic: string): boolean {
            /**
             * 
             * 
             * @param {Subscription} pre
             * @returns
             */
            let p = this.subscriptions.filter(
                (pre: Subscription) => {
                    return pre.topic === topic
                }
            );
            return !(p.length === 0);
        }
        /**
         * 
         * 
         * @param {string} topic
         * @returns {Subscription}
         * 
         * @memberOf Controller
         */
        @CanInvoke(false)
        addSubscription(topic: string): Subscription {
            let subscription = new Subscription(topic, this.alias);
            return this.___subscribe(subscription, topic, this.alias);
        }

        /**
         * 
         * 
         * @param {string} topic
         * @returns
         * 
         * @memberOf Controller
         */
        @CanInvoke(false)
        removeSubscription(topic: string) {
            return this.___unsubscribe(this.getSubscription(topic));
        }

        /**
         * 
         * 
         * @param {string} topic
         * @returns {Subscription}
         * 
         * @memberOf Controller
         */
        @CanInvoke(false)
        getSubscription(topic: string): Subscription {
            /**
             * 
             * 
             * @param {Subscription} pre
             * @returns
             */
            let subscription = this.subscriptions.find(
                (pre: Subscription) => {
                    return pre.topic === topic;
                }
            );
            return subscription;
        }

        /**
         * 
         * 
         * 
         * @memberOf Controller
         */
        @CanInvoke(true)
        ___connect() {
            // todo: remove this method
        }

        /**
         * 
         * 
         * 
         * @memberOf Controller
         */
        @CanInvoke(true)
        ___close() {
            this.connection.removeController(this.alias);
            this.invoke({}, " ___close", this.alias);
        }
        /**
         * 
         * 
         * @param {Subscription} subscription
         * @param {string} topic
         * @param {string} controller
         * @returns {Subscription}
         * 
         * @memberOf Controller
         */
        @CanInvoke(true)
        ___subscribe(subscription: Subscription, topic: string, controller: string): Subscription {
            if (this.hasSubscription(subscription.topic)) {
                return;
            }
            this.subscriptions.push(subscription);
            return subscription;
        };
        /**
         * 
         * 
         * @param {Subscription} subscription
         * @returns {boolean}
         * 
         * @memberOf Controller
         */
        @CanInvoke(true)
        ___unsubscribe(subscription: Subscription): boolean {
            let index = this.subscriptions.indexOf(this.getSubscription(subscription.topic));

            if (index >= 0) {
                let result = this.subscriptions.splice(index, 1);
                return true;
            } else
                return false;
        };
    }

    export namespace Controllers {

        /**
         * 
         * 
         * @export
         * @class InstantMessage
         */
        export class InstantMessage {
            /**
             * 
             * 
             * @type {string}
             * @memberOf InstantMessage
             */
            text: string;
        }

        /**
         * 
         * 
         * @export
         * @class PeerConnection
         */
        export class PeerConnection {
            /**
             * 
             * 
             * @type {string}
             * @memberOf PeerConnection
             */
            context: string;
            /**
             * 
             * 
             * @type {string}
             * @memberOf PeerConnection
             */
            peerId: string;
            /**
             * Creates an instance of PeerConnection.
             * 
             * @param {string} [context]
             * @param {string} [peerId]
             * 
             * @memberOf PeerConnection
             */
            constructor(context?: string, peerId?: string) {
                this.context = context;
                this.peerId = peerId;
            }
        }
        /**
         * 
         * 
         * @export
         * @class Signal
         */
        export class Signal {
            /**
             * 
             * 
             * @type {string}
             * @memberOf Signal
             */
            recipient: string;
            /**
             * 
             * 
             * @type {string}
             * @memberOf Signal
             */
            sender: string;
            /**
             * 
             * 
             * @type {string}
             * @memberOf Signal
             */
            message: string;
            /**
             * Creates an instance of Signal.
             * 
             * @param {string} recipient
             * @param {string} sender
             * @param {string} message
             * 
             * @memberOf Signal
             */
            constructor(recipient: string, sender: string, message: string) {
                this.recipient = recipient;
                this.sender = sender;
                this.message = message;
            }
        }
        /**
         * 
         * 
         * @export
         * @class BrokerController
         * @extends {ThorIO.Controller}
         */
        @ControllerProperties("contextBroker", false, 7500)
        export class BrokerController extends ThorIO.Controller {
            /**
             * 
             * 
             * @type {Array<PeerConnection>}
             * @memberOf BrokerController
             */
            public Connections: Array<PeerConnection>;
            /**
             * 
             * 
             * @type {PeerConnection}
             * @memberOf BrokerController
             */
            public Peer: PeerConnection;
            /**
             * 
             * 
             * @type {string}
             * @memberOf BrokerController
             */
            public localPeerId: string;

            /**
             * Creates an instance of BrokerController.
             * 
             * @param {ThorIO.Connection} connection
             * 
             * @memberOf BrokerController
             */
            constructor(connection: ThorIO.Connection) {
                super(connection);
                this.Connections = [];
            }

            /**
             * 
             * 
             * 
             * @memberOf BrokerController
             */
            onopen() {
                this.Peer = new PeerConnection(ThorIO.Utils.newGuid(), this.connection.id);
                this.invoke(this.Peer, "contextCreated", this.alias);
            }
            /**
             * 
             * 
             * @param {*} data
             * @param {string} topic
             * @param {string} controller
             * 
             * @memberOf BrokerController
             */
            @CanInvoke(true)
            instantMessage(data: any, topic: string, controller: string) {
                /**
                 * 
                 * 
                 * @param {BrokerController} pre
                 * @returns
                 */
                var expression = (pre: BrokerController) => {
                    return pre.Peer.context >= this.Peer.context
                };
                this.invokeTo(expression, data, "instantMessage", this.alias);
            }

            /**
             * 
             * 
             * @param {PeerConnection} change
             * 
             * @memberOf BrokerController
             */
            @CanInvoke(true)
            changeContext(change: PeerConnection) {
                this.Peer.context = change.context;
                this.invoke(this.Peer, "contextChanged", this.alias);
            }
            /**
             * 
             * 
             * @param {Signal} signal
             * 
             * @memberOf BrokerController
             */
            @CanInvoke(true)
            contextSignal(signal: Signal) {
                /**
                 * 
                 * 
                 * @param {BrokerController} pre
                 * @returns
                 */
                let expression = (pre: BrokerController) => {
                    return pre.connection.id === signal.recipient;
                };
                this.invokeTo(expression, signal, "contextSignal", this.alias);
            }
            /**
             * 
             * 
             * 
             * @memberOf BrokerController
             */
            @CanInvoke(true)
            connectContext() {
                /**
                 * 
                 * 
                 * @param {BrokerController} p
                 * @returns
                 */
                let connections = this.getPeerConnections(this.Peer).map((p: BrokerController) => {
                    return p.Peer
                });
                this.invoke(connections, "connectTo", this.alias);
            }
            /**
             * 
             * 
             * @param {PeerConnection} peerConnetion
             * @returns {Array<BrokerController>}
             * 
             * @memberOf BrokerController
             */
            getPeerConnections(peerConnetion: PeerConnection): Array<BrokerController> {
                /**
                 * 
                 * 
                 * @param {BrokerController} pre
                 * @returns
                 */
                let match = this.findOn(this.alias, (pre: BrokerController) => {
                    return pre.Peer.context === this.Peer.context && pre.Peer.peerId !== peerConnetion.peerId
                });
                return match;
            }
        }


    }


}