class AudioAnayzerResult{
    frequency:number;
    timeStamp:Date;
    isSpeaking:boolean;
    constructor(frequency:number){
        this.frequency = frequency;
        this.timeStamp = new Date();
    }
}

class AudioAnayzer{

    private audioContext:any;
    private analyser:any;
    private currentFrequenzy: number;

    private interval: number;

    isSpeaking:boolean;

    private getFrequencyData():Uint8Array {
            let array = new Uint8Array(this.analyser.frequencyBinCount);
            this.analyser.getByteTimeDomainData(array);
            return array;
    };

    autoCorrelate(buf:Uint8Array, sampleRate:number) {
        
            let minSamples = 4;
            let maxSamples = 1000;
            let size = 1000;
            let bestOffset = -1;
            let bestCorrelation = 0;
            let rms = 0;
            let currentPitch = 0;
            if (buf.length < (size + maxSamples - minSamples)) {
                console.log("// Not enough data",buf.length,size + maxSamples - minSamples);
                return; 
            }
          
            for (let i = 0; i < size; i++) {
                let val = (buf[i] - 128) / 128;
                rms += val * val;
            }
            
            for (let offset = minSamples; offset <= maxSamples; offset++) {
                let correlation = 0;
                for (let i = 0; i < size; i++) {
                    correlation += Math.abs(((buf[i] - 128) / 128) - ((buf[i + offset] - 128) / 128));
                }
                correlation = 1 - (correlation / size);
                if (correlation > bestCorrelation) {
                    bestCorrelation = correlation;
                    bestOffset = offset;
                }
            }
            rms = Math.sqrt(rms / size);
          
            if ((rms > 0.01) && (bestCorrelation > 0.01)) {
                
                currentPitch = sampleRate / bestOffset;
                // let result = {
                //     confidence: bestCorrelation,
                //     currentPitch: currentPitch,
                //     fequency: sampleRate / bestOffset,
                //     rms: rms,
                //     timeStamp: new Date()
                // };
              //  if (self.onresult) self.onresult(result);
                this.resultBuffer.unshift(new AudioAnayzerResult(sampleRate / bestOffset));
            }
        }

    private analyze(data:Uint8Array):AudioAnayzerResult{
        let result = data.reduce( (a,b) =>
        {
            return a + b;
        });

        return new AudioAnayzerResult(Math.floor(result / data.length));
    }


    private resultBuffer:Array<AudioAnayzerResult>;

    constructor(private stream:MediaStream,interval?:number){
        this.resultBuffer = new Array<AudioAnayzerResult>();
        this.interval = interval || 1000;
        this.audioContext = new AudioContext();
        let mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.smoothingTimeConstant = 0.8;
        this.analyser.fftSize = 4096;
        this.isSpeaking = false;

        mediaStreamSource.connect(this.analyser);

        window.setInterval (() => {
        // self.analyser.getByteTimeDomainData(buffer);
           // autoCorrelate(buffer, self.audioContext.sampleRate);

           // this.resultBuffer.unshift(t)

           this.autoCorrelate(this.getFrequencyData(),this.audioContext.sampleRate)


        },1000 / 17);

        window.setInterval ( () => {


            if (this.resultBuffer.length > 5) {
            
                    let now = new Date().getTime();
                    let result = this.resultBuffer[0];
                    let lastKnown = this.resultBuffer[0].timeStamp.getTime();


                    
                 if ((now - lastKnown) > 1000) {
                        if (this.isSpeaking) {
                            console.log("false");
                            result.isSpeaking = false;
                          //  if (self.onanalysis) self.onanalysis(result);
                            this.resultBuffer = [];
                            console.log("clear");
                        }
                        this.isSpeaking = false;
                          console.log("false");
                    }
                    else {
                        if (!this.isSpeaking) {
                            result.isSpeaking = true;
                              console.log("true");
                           // if (self.onanalysis) self.onanalysis(result);
                        }
                        this.isSpeaking = true;
                          console.log("true");
                    }
                   
                }


        },250)
      
    }


}