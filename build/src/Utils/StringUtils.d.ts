export declare class StringUtils {
    /**
     * Generates a GUID/UUID-like string.
     *
     * @returns {string} A GUID/UUID-like string.
     */
    static newGuid(): string;
    /**
     * Extracts key-value parameters from a query string.
     *
     * @param {string} query - The query string to parse.
     * @returns {Record<string, string>} An object containing the parsed key-value pairs.
     */
    static getParamsFromString(query: string): Record<string, string>;
}
