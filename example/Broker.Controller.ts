import {
    ThorIO
} from "../src/thor-io"

class PeerConnection{
        context:string;
        peerId: string;
}

class Signal {
    recipient:string;
    sender:string;
    message:string
}

export class BrokerController  extends ThorIO.Controller
{
    public Connections:Array<PeerConnection>;
    public Peer:PeerConnection;
    public localPeerId:string;
    private createId():string{
        return Math.random().toString(36).substring(2);
    };
    constructor(client:ThorIO.Connection){
        super(client);
        this.alias = "broker";
        this.Connections = new Array<PeerConnection>();
        this.Peer = new PeerConnection();
    }
    onopen(){
        this.Peer.context = this.createId();
        this.Peer.peerId = this.client.id;
        this.invoke(this.Peer,"contextCreated",this.alias);
    }
    changeContext(change:PeerConnection){
        this.Peer.context = change.context;
        this.invoke(this.Peer,"contextChanged",this.alias);
    }
    contextSignal(signal:Signal){
            var expression = (pre: BrokerController) => {
            if (pre.client.id === signal.recipient) return pre;
        };
        this.invokeTo(expression,signal,"contextSignal",this.alias);
    }
    connectContext(){
        var connections = this.getPeerConnections(this.Peer).map( (p:BrokerController) => {return p.Peer });
         this.invoke(connections,"connectTo",this.alias);

    }
    getPeerConnections(peerConnetion:PeerConnection):Array<BrokerController>{
           var connections = this.getConnections().map((pre:ThorIO.Connection) => {

                if (pre.hasController(this.alias)) return <BrokerController>pre.getController(this.alias);

            }).filter( (pre:BrokerController) => {
                    return pre.Peer.context === this.Peer.context && pre.Peer.peerId !== peerConnetion.peerId
            });
        return connections;
    }
}
