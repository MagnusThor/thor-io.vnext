import {
    ThorIO,
    CanInvoke,
    CanSet,
    ControllerProperties
} from "../src/thor-io"

class ChatMessageModel {
    message: string;
    age: number;
    constructor(age:number,message:string){
        this.age = age;
        this.message = message;
    }
}

@ControllerProperties("microservice",false)
export class MicroServiceController extends ThorIO.Controller{
        @CanSet(false) 
        minLevel: number = 0;
        @CanSet(false) 
        maxLevel: number = 10;
        constructor(connection:ThorIO.Connection){
            super(connection);
        }
        @CanInvoke(true)
        setThreshold(data:any){
            this.minLevel = data.min;
            this.maxLevel = data.max;
            this.invoke({ min: this.minLevel,max: this.maxLevel},"thresholdChange");
        }
        @CanInvoke(true)
        temperatureUpdate(data:any){
            let expression = (pre:MicroServiceController) =>{
                return data.temp > pre.minLevel && data.temp < pre.maxLevel
            };
            this.invokeTo(expression,data,"temperatureChange");
        }
}

@ControllerProperties("fooController",false)
export class FooController extends ThorIO.Controller {

    constructor(connection:ThorIO.Connection)
    {
        super(connection);
    }
    @CanInvoke(true)
    fooMessage(data:any){
            this.invokeToAll(data,"fooMessage",this.alias);
    }
}


@ControllerProperties("chat",false)
export class ChatController extends ThorIO.Controller {
   
    @CanSet(true) // this property can be modified (set) by the clients
    age: number = 1;

    constructor(connection: ThorIO.Connection) {
        super(connection);
     //   this.alias = "chat";
    }

    @CanInvoke(true) // this method can be called / invoke by clients
    sendChatMessage(data: ChatMessageModel, topic: string, controller: string) {
        var expression = (pre: ChatController) => {
            return pre.age >= this.age;
        };
        this.invokeTo(expression, data, "chatMessage", this.alias);
    }
    @CanInvoke(true)
    fileShare(fileInfo,topic,controlle,blob){
        this.invokeToAll(fileInfo,"fileShare",this.alias,blob);
    }
    
    @CanInvoke(true)
    getFoo(){
        this.publish(new Date(),"foo",this.alias);
    }
}