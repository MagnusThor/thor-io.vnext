/**
 * Utility class for buffer and binary operations.
 *
 * @export
 * @class BufferUtils
 */
export declare class BufferUtils {
    /**
     * Converts a string into a `Uint8Array` buffer.
     *
     * @static
     * @param {string} str - The input string to convert.
     * @returns {Uint8Array} The resulting buffer as a `Uint8Array`.
     */
    static stringToBuffer(str: string): Uint8Array;
    /**
     * Converts a `Uint8Array` to a long integer.
     *
     * @static
     * @param {Uint8Array} byteArray - The input byte array.
     * @returns {number} The resulting long integer.
     */
    static arrayToLong(byteArray: Uint8Array): number;
    /**
     * Converts a long integer to an array of bytes.
     *
     * @static
     * @param {number} long - The long integer to convert.
     * @returns {Array<number>} The resulting array of bytes.
     */
    static longToArray(long: number): Array<number>;
}
