"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StringUtils {
    static newGuid() {
        const s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }
    static getParamsFromString(query) {
    }
}
exports.StringUtils = StringUtils;
