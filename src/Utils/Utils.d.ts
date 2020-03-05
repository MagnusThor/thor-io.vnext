export declare class Utils {
    static stingToBuffer(str: string): Uint8Array;
    static arrayToLong(byteArray: Uint8Array): number;
    static longToArray(long: number): Array<number>;
    static newGuid(): string;
    static randomString(): string;
}
