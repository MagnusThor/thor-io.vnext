import 'reflect-metadata';

/**
 * A decorator to attach custom metadata to a controller class.
 *
 * @param alias The alias for the controller (used for routing or identification).
 * @param heartbeatInterval Optional interval in milliseconds for the heartbeat. Defaults to -1.
 *
 * @returns A function that adds metadata to the target class.
 */
export function ControllerProperties(alias: string, heartbeatInterval?: number) {
    return function (target: Function) {
        // Attach alias to the class
        Reflect.defineMetadata("alias", alias, target);
        
        // Attach heartbeat interval to the class (default to -1 if not provided)
        Reflect.defineMetadata("heartbeatInterval", heartbeatInterval ?? -1, target);
    };
}
