import {
    ThorIO, CanInvoke, ControllerProperties
} from "../dist/thor-io";

@ControllerProperties("testController", false)
export class TestController extends ThorIO.Controller {

    constructor(client: ThorIO.Connection) {
        super(client);
    }

    @CanInvoke(true)
    public sendHello(data: any, topic: string, controller: string) {
        this.invoke(data, topic, controller);
    }
}


