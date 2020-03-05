/// <reference types="node" />
export declare class Message {
    B: Buffer;
    T: string;
    D: any;
    C: string;
    isBinary: Boolean;
    readonly JSON: any;
    constructor(topic: string, data: any, controller: string, arrayBuffer?: Buffer);
    toString(): string;
    static fromArrayBuffer(buffer: Buffer): Message;
    toArrayBuffer(): Buffer;
}
