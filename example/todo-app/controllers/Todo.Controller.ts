import {
    ThorIO,
    CanInvoke,
    CanSet,
    ControllerProperties
} from "../../../src/thor-io"

export namespace TodoApp.Realtime {

    type UUID = string;

    export class ToDo {
        created: Date;
        id: UUID;
        completed: boolean;
        topic:string;
        description:string;
        constructor(topic: string,state:boolean) {
            this.topic = topic;
            this.created = new Date();
            this.id = ThorIO.Utils.newGuid();
            this.completed = state;
        }

    }

    export class Todos {
        public static ListOfToDo: Array<ToDo>;
        constructor() {
            TodoApp.Realtime.Todos.ListOfToDo = new Array<ToDo>();
            Todos.addToDo(new ToDo( "Create some experiments...",false));
            Todos.addToDo(new ToDo( "Have a closer look at this example..",true));
            Todos.addToDo(new ToDo("Have a beer..",false));
        }
        static getAll(): Array<ToDo>{
            return this.ListOfToDo;
        }
        static addToDo(todo: Realtime.ToDo) {
            this.ListOfToDo.push(todo);
        }
        static findToDo(): Array<ToDo>{
            return null;
        }
        static removeTodo(todoId:string) {
            let match = this.ListOfToDo.filter( (pre:ToDo) => {
                
                return pre.id === todoId;
            });
            let index = this.ListOfToDo.indexOf(match[0]);
            if(index >=0) this.ListOfToDo.splice(index,1);
        //    console.log(match,index,todo);
        
        }
        static setCompleted(id: string) {

        }
    }

    @ControllerProperties("TodoController", false)
    export class TodoController extends ThorIO.Controller {

        constructor(connection: ThorIO.Connection) {
            super(connection);
        }

        @CanInvoke(true)
        getToDos(){
            this.invoke(TodoApp.Realtime.Todos.getAll(),"todos",this.alias);
        }
        @CanInvoke(true)
        addToDo(todo:any) {
            let _todo = new Realtime.ToDo(todo.topic,false);
            Realtime.Todos.addToDo(_todo);
            this.invokeToAll(_todo, "todo");
        }
        @CanInvoke(true)
        removeToDo(todo:ToDo) {
            Realtime.Todos.removeTodo(todo.id);
            this.invokeToAll(todo.id,"todoRemoved");
        }

        @CanInvoke(true)
        setCompleted(todo:ToDo) {
           this.invokeToOthers(todo,"stateChange");
        }
        @CanInvoke(true)
        findTodo(query: string) {

        }

    }

}