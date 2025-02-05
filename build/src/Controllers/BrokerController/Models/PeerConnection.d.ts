export declare class PeerConnection {
    context: string;
    peerId: string;
    language: string | undefined;
    constructor(context: string, peerId: string);
    setLanguage(language: string): void;
}
