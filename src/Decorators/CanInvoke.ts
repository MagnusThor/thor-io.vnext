import 'reflect-metadata';
/**
 *
 *
 * @export
 * @param {boolean} state
 * @returns
 */
export function CanInvoke(state: boolean, alias?: string) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata("canInvokeOrSet", state, target, propertyKey);
    };
}
