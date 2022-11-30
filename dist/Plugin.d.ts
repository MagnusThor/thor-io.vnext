export declare class Plugin<T> {
    alias: string;
    instance: T;
    id: string;
    constructor(controller: T);
}
