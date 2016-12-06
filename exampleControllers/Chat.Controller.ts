import {
    ThorIO,
    CanInvoke,
    CanSet,
    ControllerProperties
} from "../src/thor-io"

class ChatMessage {
    message: string;
    age: number;
    constructor(age:number,message:string){
        this.age = age;
        this.message = message;
    }
}

@ControllerProperties("fooController")
export class FooController extends ThorIO.Controller {

    constructor(connection:ThorIO.Connection)
    {
        super(connection);
    }

    onopen(){
         //   this.invoke({src:'open'},"fooMessage");
    }

    onclose() {

    }
    @CanInvoke(true)
    fooMessage(data:any){
      
            this.invokeToAll(data,"fooMessage",this.alias);
    }

}


@ControllerProperties("chat")
export class ChatController extends ThorIO.Controller {
   
    @CanSet(true) // this property can be modified (set) by the clients
    age: number = 1;

    constructor(connection: ThorIO.Connection) {
        super(connection);
        this.alias = "chat";
    }

    @CanInvoke(true) // this method can be called / invoke by clients
    sendChatMessage(data: ChatMessage, topic: string, controller: string) {
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

    @CanInvoke(true)
    regExpMethod(size:number,age:number){
     //   console.log(arguments);
    }

}