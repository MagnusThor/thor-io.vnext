import 'reflect-metadata';

/**
 * A decorator to define whether a method can be invoked, with optional alias support.
 *
 * @param state Boolean indicating whether the method can be invoked.
 * @param alias Optional alias for the method.
 *
 * @returns A function that adds metadata to the method.
 */
export function CanInvoke(state: boolean, alias?: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // Define metadata for whether the method can be invoked
    Reflect.defineMetadata("canInvoke", state, target, propertyKey);
    
    // Optionally add an alias if provided
    if (alias) {
      Reflect.defineMetadata("alias", alias, target, propertyKey);
    }
  };
}
