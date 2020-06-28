export class StringUtils {
    /**
     * Generate a GUID/UUID like string
     *
     * @returns
     * @memberof StringUtils
     */
    static newGuid() {
        const s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }
    static getParamsFromString(query:string){

    }
}
