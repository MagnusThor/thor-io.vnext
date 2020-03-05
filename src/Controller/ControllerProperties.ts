/**
 *
 *
 * @export
 * @param {string} alias
 * @param {boolean} [seald]
 * @param {number} [heartbeatInterval]
 * @returns
 */
export function ControllerProperties(alias: string, seald?: boolean, heartbeatInterval?: number) {
    return function (target: Function) {
        Reflect.defineMetadata("seald", seald || false, target);
        Reflect.defineMetadata("alias", alias, target);
        Reflect.defineMetadata("heartbeatInterval", heartbeatInterval || -1, target);
    };
}
