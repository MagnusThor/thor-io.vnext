#thor-io.vnext


##about
thor-io offers a variety of opportunities to create real-time applications, ranging from IoT applications to web apps where communication is primarily based on WebSockets for WebRTC (P2P) solutions. thor-io delivers an intuitive programming model which will help you to solve your problems instead of other frameworks which relate to communication and other things which you usually have to be concerned with. The things we have implemented are strongly influenced by the complete framework XSockets.NET.


##vNext
This version of thor-io, called vNext, represents the next generation of thor-io. We have chosen to write it in typescript and to focus on the possibillity of using it inside or outside all of the popular frameworks, such as AngularJS 2 (and one).

##Installation

Install thor-io.vnext using NPM ( you will get Engine, Clients etc )

    npm install https://github.com/MagnusThor/thor-io.vnext.git#npm-module

##Examples
The first examples based on the source found in this repo are deployed on heroku. 

###Simple chat levering state-full controllers

At http://thorio.herokuapp.com/client/chat.html you will find a simple chat based in the controller found in (examples).

###WebRTC example

The latest example is a WebRTC implementation, containig a client and a Signalling Server ( controller ) , see example/Broker.Controller.ts.

   https://thorio.herokuapp.com/client/p2p.html is a simple WebRTC 1-n video-conf.   Enjoy!



For prior versions of thor-io and some basic documentation have a look at https://github.com/MagnusThor/thorio/wiki

## Example controller ( server side )

Below you find an example controller (typescript). This is the WebRTC broker used bu the example presented above.





    @ControllerProperties("broker",false)
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
    }
    onopen(){
        this.Peer = new PeerConnection(this.createId(),this.client.id);
        this.invoke(this.Peer,"contextCreated",this.alias);
    }

    @CanInvoke(true)
    instantMessage(data: any, topic: string, controller: string) {
        var expression = (pre: BrokerController) => {
            return pre.Peer.context >= this.Peer.context
        };
        this.invokeTo(expression, data, "instantMessage", this.alias);
    }
  
    @CanInvoke(true)
    changeContext(change:PeerConnection){
        this.Peer.context = change.context;
        this.invoke(this.Peer,"contextChanged",this.alias);
    }
    @CanInvoke(true)
    contextSignal(signal:Signal){
            let expression = (pre: BrokerController) => {
            return pre.client.id === signal.recipient;
        };
        this.invokeTo(expression,signal,"contextSignal",this.alias);
    }
    @CanInvoke(true)
    connectContext(){
        let connections = this.getPeerConnections(this.Peer).map( (p:BrokerController) => {return p.Peer });
         this.invoke(connections,"connectTo",this.alias);
    }
 
    getPeerConnections(peerConnetion:PeerConnection):Array<BrokerController>{
            let match = this.findOn(this.alias,(pre:BrokerController) => {
                    return pre.Peer.context === this.Peer.context && pre.Peer.peerId !== peerConnetion.peerId
                });
        return match;
    }
    }
    }




Kind regards,

Team Thor-IO
