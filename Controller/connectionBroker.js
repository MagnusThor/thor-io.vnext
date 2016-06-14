// namespace ThorIO.Models {
//     export class PeerConnection {
//         public Context: string
//         public PeerId: string;
//         constructor(peerId: string, context: string) {
//             this.PeerId = peerId;
//             this.Context = context;
//         }
//     }
//     export class SignalingModel {
//         public Message: string;
//         public Recipient: string;
//         public Sender: string;
//         constructor() {
//         }
//     }
// }
//  export class ConnectionBrokerController extends
//         ThorIO.ThorController
//      {
//         private uuid(): string {
//             return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
//         }
//         private client: any;
//         public alias: string;
//         private Connections: Array < ThorIO.Models.PeerConnection > ;
//         public Peer: ThorIO.Models.PeerConnection;
//         constructor(client ? : string) {
//             super(client);
//             this.Connections = new Array < ThorIO.Models.PeerConnection > ();
//             this.client = client;
//             this.alias = "broker";
//         }
//         onopen() {
//             var context = this.uuid();
//             // todo: check params
//             this.Peer = new ThorIO.Models.PeerConnection(this.client.id,
//                 context
//             );
//         // pass Peer as data, topic is ContextCreated
//             this.invoke(this.Peer,"contextCreated",this.alias);
//         }
//         changeContext(context:string)
//         {
//             this.Peer.Context = context;
//             this.invoke(this.Peer,"contextChanged",this.alias);
//         }
//         setContext(context:string){
//                 this.Peer.Context = context;
//         }
//         findConnections(){
//             var conectionsOnPeer = this.getConnections();
//         }
//         onclose() {
//         }
//         getContext() {
//             return null;
//         }
//     } 
//# sourceMappingURL=connectionBroker.js.map