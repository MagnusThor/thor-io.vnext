import {
    ThorIO,CanInvoke,CanSet,ControllerProperties
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

@ControllerProperties("broker")
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
  
    @CanInvoke(true)
    changeContext(change:PeerConnection){
        this.Peer.context = change.context;
        this.invoke(this.Peer,"contextChanged",this.alias);
    }
    @CanInvoke(true)
    contextSignal(signal:Signal){
            var expression = (pre: BrokerController) => {
            return pre.client.id === signal.recipient;
        };
        this.invokeTo(expression,signal,"contextSignal",this.alias);
    }
    @CanInvoke(true)
    connectContext(){
        var connections = this.getPeerConnections(this.Peer).map( (p:BrokerController) => {return p.Peer });
         this.invoke(connections,"connectTo",this.alias);
    }
 
    getPeerConnections(peerConnetion:PeerConnection):Array<BrokerController>{
            var connections = this.getConnections().map((connection:ThorIO.Connection) => {
            if (connection.hasController(this.alias)) return <BrokerController>connection.getController(this.alias);
            }).filter( (pre:BrokerController) => {
                    return pre.Peer.context === this.Peer.context && pre.Peer.peerId !== peerConnetion.peerId
            });
        return connections;
    }
}
