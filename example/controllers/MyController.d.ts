import { Connection } from '../../src/Connection';
import { ControllerBase } from "../../src/Controller/ControllerBase";
export declare class MyController extends ControllerBase {
    size: number;
    constructor(connection: Connection);
    onclose(): void;
    onopen(): void;
    invokeAndReturn(data: any): void;
    invokeAndSendToAll(data: any): void;
    publishTemperature(temperatue: any): void;
    invokeAndSendOthers(data: any): void;
    invokeToExpr(data: any): void;
}
