"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var thor_io_1 = require("../../../src/thor-io");
var TodoApp;
(function (TodoApp) {
    var Realtime;
    (function (Realtime) {
        var ToDo = (function () {
            function ToDo(topic, state) {
                this.topic = topic;
                this.created = new Date();
                this.id = thor_io_1.ThorIO.Utils.newGuid();
                this.completed = state;
            }
            return ToDo;
        }());
        Realtime.ToDo = ToDo;
        var Todos = (function () {
            function Todos() {
                TodoApp.Realtime.Todos.ListOfToDo = new Array();
                Todos.addToDo(new ToDo("Create some experiments...", false));
                Todos.addToDo(new ToDo("Have a closer look at this example..", true));
                Todos.addToDo(new ToDo("Have a beer..", false));
            }
            Todos.getAll = function () {
                return this.ListOfToDo;
            };
            Todos.addToDo = function (todo) {
                this.ListOfToDo.push(todo);
            };
            Todos.findToDo = function () {
                return null;
            };
            Todos.removeTodo = function (todoId) {
                var match = this.ListOfToDo.filter(function (pre) {
                    return pre.id === todoId;
                });
                var index = this.ListOfToDo.indexOf(match[0]);
                if (index >= 0)
                    this.ListOfToDo.splice(index, 1);
                //    console.log(match,index,todo);
            };
            Todos.setCompleted = function (id) {
            };
            return Todos;
        }());
        Realtime.Todos = Todos;
        var TodoController = (function (_super) {
            __extends(TodoController, _super);
            function TodoController(connection) {
                _super.call(this, connection);
            }
            TodoController.prototype.getToDos = function () {
                this.invoke(TodoApp.Realtime.Todos.getAll(), "todos", this.alias);
            };
            TodoController.prototype.addToDo = function (todo) {
                var _todo = new Realtime.ToDo(todo.topic, false);
                Realtime.Todos.addToDo(_todo);
                this.invokeToAll(_todo, "todo");
            };
            TodoController.prototype.removeToDo = function (todo) {
                Realtime.Todos.removeTodo(todo.id);
                this.invokeToAll(todo.id, "todoRemoved");
            };
            TodoController.prototype.setCompleted = function (todo) {
                this.invokeToOthers(todo, "stateChange");
            };
            TodoController.prototype.findTodo = function (query) {
            };
            __decorate([
                thor_io_1.CanInvoke(true), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', []), 
                __metadata('design:returntype', void 0)
            ], TodoController.prototype, "getToDos", null);
            __decorate([
                thor_io_1.CanInvoke(true), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [Object]), 
                __metadata('design:returntype', void 0)
            ], TodoController.prototype, "addToDo", null);
            __decorate([
                thor_io_1.CanInvoke(true), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [ToDo]), 
                __metadata('design:returntype', void 0)
            ], TodoController.prototype, "removeToDo", null);
            __decorate([
                thor_io_1.CanInvoke(true), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [ToDo]), 
                __metadata('design:returntype', void 0)
            ], TodoController.prototype, "setCompleted", null);
            __decorate([
                thor_io_1.CanInvoke(true), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [String]), 
                __metadata('design:returntype', void 0)
            ], TodoController.prototype, "findTodo", null);
            TodoController = __decorate([
                thor_io_1.ControllerProperties("TodoController", false), 
                __metadata('design:paramtypes', [thor_io_1.ThorIO.Connection])
            ], TodoController);
            return TodoController;
        }(thor_io_1.ThorIO.Controller));
        Realtime.TodoController = TodoController;
    })(Realtime = TodoApp.Realtime || (TodoApp.Realtime = {}));
})(TodoApp = exports.TodoApp || (exports.TodoApp = {}));
//# sourceMappingURL=Todo.Controller.js.map