declare class ChatMessage {
    age: number;
    message: string;
    constructor(age: number, message: string);
}
declare class ChatClient {
    private a;
    showMessage(chatMessage: ChatMessage): void;
    setAge(age: number): void;
    sendMessage(event: KeyboardEvent): void;
    private client;
    private txtMessage;
    private txtAge;
    constructor();
}
