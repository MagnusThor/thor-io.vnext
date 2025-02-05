"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtils = void 0;
class StringUtils {
    /**
     * Generates a GUID/UUID-like string.
     *
     * @returns {string} A GUID/UUID-like string.
     */
    static newGuid() {
        const s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }
    /**
     * Extracts key-value parameters from a query string.
     *
     * @param {string} query - The query string to parse.
     * @returns {Record<string, string>} An object containing the parsed key-value pairs.
     */
    static getParamsFromString(query) {
        const params = {};
        query.replace(/^\?/, '').split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
        return params;
    }
}
exports.StringUtils = StringUtils;
