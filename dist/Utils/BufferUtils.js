"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferUtils = void 0;
class BufferUtils {
    static stingToBuffer(str) {
        let len = str.length;
        let arr = new Array(len);
        for (let i = 0; i < len; i++) {
            arr[i] = str.charCodeAt(i) & 0xFF;
        }
        return new Uint8Array(arr);
    }
    static arrayToLong(byteArray) {
        var value = 0;
        for (var i = byteArray.byteLength - 1; i >= 0; i--) {
            value = (value * 256) + byteArray[i];
        }
        return value;
    }
    static longToArray(long) {
        var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
        for (var index = 0; index < byteArray.length; index++) {
            var byte = long & 0xff;
            byteArray[index] = byte;
            long = (long - byte) / 256;
        }
        return byteArray;
    }
}
exports.BufferUtils = BufferUtils;
