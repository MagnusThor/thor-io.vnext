import { CanInvoke,CanSet,ThorIO,ControllerProperties } from "../../index";

@ControllerProperties("mycontroller")
export class MyController extends ThorIO.Controller {
    
    @CanSet(true)
    size: number;
    constructor(connection: ThorIO.Connection) {
        super(connection);
        this.size = 0; 
    }

    @CanInvoke(true)
    invokeAndReturn(data: any) {
        // will back what sent to callee
        this.invoke(data, "invokeAndReturn");
    }

    @CanInvoke(true)
    invokeAndSendToAll(data: any) {
        // will send what callee passes to all clients connected to 'test' , see @ControllerProperties
        this.invokeToAll(data, "invokeAndSendToAll");
    }

    @CanInvoke(true)
    publishTemperature(temperatue:any){
        this.publishToAll(temperatue, "tempChange");
    }

    @CanInvoke(true)
    invokeAndSendOthers(data: any) {
        // will send what callee passes to all clients connected to 'test' except 'self' , see @ControllerProperties
        this.invokeToOthers(data, "invokeAndSendOthers");
    }


    @CanInvoke(true)
    invokeToExpr(data: any) {
        // create an expression, send just to clients 
        // what has an age >= 10;
        let expr = function (pre: MyController) {
            return pre.size >= 10;
        }
        this.invokeTo(expr, data, "invokeToExpr");
    }

}