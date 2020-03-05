
import { ControllerBase } from '../../src/Controller/ControllerBase';

import { CanSet } from '../../src/Decorators/CanSet';
import { CanInvoke } from '../../src/Decorators/CanInvoke';
import { Connection } from '../../src/Connection';
import { ControllerProperties } from '../../src/Decorators/ControllerProperties';

@ControllerProperties("mycontroller")
export class MyController extends ControllerBase {
    
    @CanSet(true)
    size: number;
    constructor(connection: Connection) {
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