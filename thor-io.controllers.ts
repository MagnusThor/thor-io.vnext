import './thor-io'

namespace ThorIO {

    export namespace Controllers {
        export class DefaultController extends ThorIO.Controller {
                
                constructor(connection:ThorIO.Connection){
                    super(connection);
                }
        }
    }


}