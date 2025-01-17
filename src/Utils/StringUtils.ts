export class StringUtils {
    /**
     * Generates a GUID/UUID-like string.
     *
     * @returns {string} A GUID/UUID-like string.
     */
    static newGuid(): string {
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
    static getParamsFromString(query: string): Record<string, string> {
        const params: Record<string, string> = {};
        query.replace(/^\?/, '').split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
        return params;
    }
}
