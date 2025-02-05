import 'reflect-metadata';
/**
 * A decorator to define whether a method can be invoked, with optional alias support.
 *
 * @param state Boolean indicating whether the method can be invoked.
 * @param alias Optional alias for the method.
 *
 * @returns A function that adds metadata to the method.
 */
export declare function CanInvoke(state: boolean, alias?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
