"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Listener {
    constructor(topic, fn) {
        this.fn = fn;
        this.topic = topic;
    }
}
exports.Listener = Listener;
