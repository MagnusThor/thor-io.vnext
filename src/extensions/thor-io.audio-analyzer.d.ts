declare class AudioAnayzerResult {
    frequency: number;
    timeStamp: Date;
    isSpeaking: boolean;
    constructor(frequency: number);
}
declare class AudioAnayzer {
    private stream;
    private audioContext;
    private analyser;
    private currentFrequenzy;
    private interval;
    isSpeaking: boolean;
    private getFrequencyData();
    autoCorrelate(buf: Uint8Array, sampleRate: number): void;
    private analyze(data);
    private resultBuffer;
    constructor(stream: MediaStream, interval?: number);
}
