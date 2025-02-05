import 'reflect-metadata';

/**
 * A decorator that attaches metadata to a property indicating whether it can be set or get.
 *
 * @param canSet Boolean indicating if the property can be set.
 * @param canGet Optional boolean indicating if the property can be gotten (defaults to `canSet` if not provided).
 *
 * @returns A function that adds metadata to the property.
 */
export function CanSetGet(canSet: boolean, canGet?: boolean) {
    return function (target: Object, propertyKey: string) {
        // Attach 'canSet' metadata
        Reflect.defineMetadata("canSet", canSet, target, propertyKey);
        
        // Attach 'canGet' metadata, defaulting to 'canSet' if not provided
        Reflect.defineMetadata("canGet", canGet ?? canSet, target, propertyKey);
    };
}
