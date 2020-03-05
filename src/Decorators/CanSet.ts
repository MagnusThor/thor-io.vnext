/**
 *
 *
 * @export
 * @param {boolean} state
 * @returns
 */
export function CanSet(state: boolean) {
    return function (target: Object, propertyKey: string) {
        Reflect.defineMetadata("canInvokeOrSet", state, target, propertyKey);
    };
}
