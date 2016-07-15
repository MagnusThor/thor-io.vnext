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
        this.client.GetChannel("chat").SetProperty("age", age);
    }
    sendMessage(event: KeyboardEvent) {

        if (event.keyCode === 13) {
            this.client.GetChannel("chat").Invoke("sendChatMessage",
                new ChatMessage(parseInt(this.txtAge.value),this.txtMessage.value)
            );
        }
    }

    private client: ThorIOClient.Factory;
    private txtMessage:HTMLInputElement;
    private txtAge:HTMLInputElement;
    

    constructor() {

        this.client = new ThorIOClient.Factory(location.origin.replace(/^http/, 'ws'), ["chat"]);

        this.client.OnOpen = (channel: ThorIOClient.Channel) => {
            channel.On("chatMessage", (message: ChatMessage) => {
            	this.showMessage(message);
            });
            channel.Connect();
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