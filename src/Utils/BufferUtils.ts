/**
 *
 *
 * @export
 * @class Utils
 */
export class BufferUtils {
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
}
