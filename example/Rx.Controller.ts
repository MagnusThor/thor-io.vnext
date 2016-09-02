
import {ThorIO, ControllerProperties, CanInvoke, CanSet} from '../src/thor-io'
import Proxy = require('harmony-proxy');


export class PersonModel {
    firstName: string;
    lastName: string;
    age: number;
    constructor(firstName:string,lastName:string,age:number) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
    }
}
@ControllerProperties("rx", false, 5000)

export class RxController extends ThorIO.Controller {
    Person: PersonModel;

    @CanInvoke(true)
    SetAge(age:number){
        this.Person.age = age;
    };

    private handler:harmonyProxy.ProxyHandler<PersonModel>;

    constructor(connection: ThorIO.Connection) {
        super(connection);
        this.Person = new PersonModel("John","Doe",10);
        
        let p  = new Proxy(this.Person,this.handler);
        
    }


    
}