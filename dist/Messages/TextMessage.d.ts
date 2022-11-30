/// <reference types="node" />
export declare class TextMessage {
    B: Buffer;
    T: string;
    D: any;
    C: string;
    isBinary: Boolean;
    I: string;
    F: boolean;
    get JSON(): any;
    constructor(topic: string, data: any, controller: string, arrayBuffer?: Buffer, uuid?: string, isFinal?: boolean);
    toString(): string;
    static fromArrayBuffer(buffer: Buffer): TextMessage;
    toArrayBuffer(): Buffer;
}
