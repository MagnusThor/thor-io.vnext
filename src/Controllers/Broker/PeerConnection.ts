/**
 *
 *
 * @export
 * @class PeerConnection
 */
export class PeerConnection {
    /**
     *
     *
     * @type {string}
     * @memberOf PeerConnection
     */
    context: string;
    /**
     *
     *
     * @type {string}
     * @memberOf PeerConnection
     */
    peerId: string;
    /**
     * Creates an instance of PeerConnection.
     *
     * @param {string} [context]
     * @param {string} [peerId]
     *
     * @memberOf PeerConnection
     */
    constructor(context?: string, peerId?: string) {
        this.context = context;
        this.peerId = peerId;
    }
}
