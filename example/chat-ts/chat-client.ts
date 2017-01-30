class ChatMessage {
    age: number;
    message: string
    constructor(age: number, message: string) {
        this.age = age;
        this.message = message;
    }
}

class ChatClient {

    private a: string;

    showMessage(chatMessage: ChatMessage) {
        var el = document.createElement("p");
        el.textContent = chatMessage.message;
        document.querySelector("#chatMessages").appendChild(el);

    }
    setAge(age: number) {
        this.factory.GetProxy("chat").SetProperty("age", age);
    }
    sendMessage(event: KeyboardEvent) {

        if (event.keyCode === 13) {
            this.factory.GetProxy("chat").Invoke("sendChatMessage",
                new ChatMessage(parseInt(this.txtAge.value),this.txtMessage.value)
            );
        }
    }

    private factory: ThorIO.Client.Factory;
    private txtMessage:HTMLInputElement;
    private txtAge:HTMLInputElement;
    

    constructor() {

        this.factory = new ThorIO.Client.Factory(location.origin.replace(/^http/, 'ws'), ["chat"]);

        this.factory.OnOpen = (proxy: ThorIO.Client.Proxy) => {
            proxy.On("chatMessage", (message: ChatMessage) => {
            	this.showMessage(message);
            });
            proxy.Connect();
        };

        this.factory.OnClose = (reason:any) => {
                console.error(reason);
        };

          this.factory.OnError = (err:any) => {
                console.error(err);
        };

        this.txtMessage =  document.querySelector("#chat-message") as HTMLInputElement;
        
        this.txtMessage.addEventListener("keyup", (event: KeyboardEvent) => {
            this.sendMessage(event);
        });

        this.txtAge = document.querySelector("#chat-age") as HTMLInputElement;

        this.txtAge.addEventListener("change", (event: any) => {
            this.setAge(event.target.value)
        });
    }

}