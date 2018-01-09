import { ThorIO } from "../../index";
export declare class MyController extends ThorIO.Controller {
    size: number;
    constructor(connection: ThorIO.Connection);
    invokeAndReturn(data: any): void;
    invokeAndSendToAll(data: any): void;
    publishTemperature(temperatue: any): void;
    invokeAndSendOthers(data: any): void;
    invokeToExpr(data: any): void;
}
