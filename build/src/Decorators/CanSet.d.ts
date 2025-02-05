import 'reflect-metadata';
/**
 * A decorator that attaches metadata to a property indicating whether it can be set or get.
 *
 * @param canSet Boolean indicating if the property can be set.
 * @param canGet Optional boolean indicating if the property can be gotten (defaults to `canSet` if not provided).
 *
 * @returns A function that adds metadata to the property.
 */
export declare function CanSetGet(canSet: boolean, canGet?: boolean): (target: Object, propertyKey: string) => void;
