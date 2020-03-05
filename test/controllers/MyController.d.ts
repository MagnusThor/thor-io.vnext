import { ControllerBase } from '../../src/Controller/ControllerBase';
import { Connection } from '../../src/Connection';
export declare class MyController extends ControllerBase {
    size: number;
    constructor(connection: Connection);
    invokeAndReturn(data: any): void;
    invokeAndSendToAll(data: any): void;
    publishTemperature(temperatue: any): void;
    invokeAndSendOthers(data: any): void;
    invokeToExpr(data: any): void;
}
