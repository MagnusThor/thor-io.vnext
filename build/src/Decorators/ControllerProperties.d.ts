import 'reflect-metadata';
/**
 * A decorator to attach custom metadata to a controller class.
 *
 * @param alias The alias for the controller (used for routing or identification).
 * @param heartbeatInterval Optional interval in milliseconds for the heartbeat. Defaults to -1.
 *
 * @returns A function that adds metadata to the target class.
 */
export declare function ControllerProperties(alias: string, heartbeatInterval?: number): (target: Function) => void;
