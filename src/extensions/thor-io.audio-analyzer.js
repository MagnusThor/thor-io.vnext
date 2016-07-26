var AudioAnayzerResult = (function () {
    function AudioAnayzerResult(frequency) {
        this.frequency = frequency;
        this.timeStamp = new Date();
    }
    return AudioAnayzerResult;
}());
var AudioAnayzer = (function () {
    function AudioAnayzer(stream, interval) {
        var _this = this;
        this.stream = stream;
        this.resultBuffer = new Array();
        this.interval = interval || 1000;
        this.audioContext = new AudioContext();
        var mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.smoothingTimeConstant = 0.8;
        this.analyser.fftSize = 4096;
        this.isSpeaking = false;
        mediaStreamSource.connect(this.analyser);
        window.setInterval(function () {
            // self.analyser.getByteTimeDomainData(buffer);
            // autoCorrelate(buffer, self.audioContext.sampleRate);
            // this.resultBuffer.unshift(t)
            _this.autoCorrelate(_this.getFrequencyData(), _this.audioContext.sampleRate);
        }, 1000 / 17);
        window.setInterval(function () {
            if (_this.resultBuffer.length > 5) {
                var now = new Date().getTime();
                var result = _this.resultBuffer[0];
                var lastKnown = _this.resultBuffer[0].timeStamp.getTime();
                if ((now - lastKnown) > 1000) {
                    if (_this.isSpeaking) {
                        console.log("false");
                        result.isSpeaking = false;
                        //  if (self.onanalysis) self.onanalysis(result);
                        _this.resultBuffer = [];
                        console.log("clear");
                    }
                    _this.isSpeaking = false;
                    console.log("false");
                }
                else {
                    if (!_this.isSpeaking) {
                        result.isSpeaking = true;
                        console.log("true");
                    }
                    _this.isSpeaking = true;
                    console.log("true");
                }
            }
        }, 250);
    }
    AudioAnayzer.prototype.getFrequencyData = function () {
        var array = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteTimeDomainData(array);
        return array;
    };
    ;
    AudioAnayzer.prototype.autoCorrelate = function (buf, sampleRate) {
        var minSamples = 4;
        var maxSamples = 1000;
        var size = 1000;
        var bestOffset = -1;
        var bestCorrelation = 0;
        var rms = 0;
        var currentPitch = 0;
        if (buf.length < (size + maxSamples - minSamples)) {
            console.log("// Not enough data", buf.length, size + maxSamples - minSamples);
            return;
        }
        for (var i = 0; i < size; i++) {
            var val = (buf[i] - 128) / 128;
            rms += val * val;
        }
        for (var offset = minSamples; offset <= maxSamples; offset++) {
            var correlation = 0;
            for (var i = 0; i < size; i++) {
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
    };
    AudioAnayzer.prototype.analyze = function (data) {
        var result = data.reduce(function (a, b) {
            return a + b;
        });
        return new AudioAnayzerResult(Math.floor(result / data.length));
    };
    return AudioAnayzer;
}());
//# sourceMappingURL=thor-io.audio-analyzer.js.map