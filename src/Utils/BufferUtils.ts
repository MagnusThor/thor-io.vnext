/**
 * Utility class for buffer and binary operations.
 *
 * @export
 * @class BufferUtils
 */
export class BufferUtils {
    /**
     * Converts a string into a `Uint8Array` buffer.
     *
     * @static
     * @param {string} str - The input string to convert.
     * @returns {Uint8Array} The resulting buffer as a `Uint8Array`.
     */
    static stringToBuffer(str: string): Uint8Array {
        let len = str.length;
        let arr = new Array(len);
        for (let i = 0; i < len; i++) {
            arr[i] = str.charCodeAt(i) & 0xFF;
        }
        return new Uint8Array(arr);
    }

    /**
     * Converts a `Uint8Array` to a long integer.
     *
     * @static
     * @param {Uint8Array} byteArray - The input byte array.
     * @returns {number} The resulting long integer.
     */
    static arrayToLong(byteArray: Uint8Array): number {
        let value = 0;
        for (let i = byteArray.byteLength - 1; i >= 0; i--) {
            value = (value * 256) + byteArray[i];
        }
        return value;
    }

    /**
     * Converts a long integer to an array of bytes.
     *
     * @static
     * @param {number} long - The long integer to convert.
     * @returns {Array<number>} The resulting array of bytes.
     */
    static longToArray(long: number): Array<number> {
        const byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
        for (let index = 0; index < byteArray.length; index++) {
            const byte = long & 0xff;
            byteArray[index] = byte;
            long = (long - byte) / 256;
        }
        return byteArray;
    }
}
