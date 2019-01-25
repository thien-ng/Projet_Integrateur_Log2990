
import { inject, injectable } from "inversify";
import { NameValidatorService } from "../validator/NameValidatorService";
import Types from "./../types";

@injectable()
export class WebsocketManager {

    public constructor(@inject(Types.NameValidatorService) private _nameValidatorService: NameValidatorService){
        // defualt constructor
    }

    public createWebsocket(io: any):void {
        io = require('socket.io')();
        io.on('connection', (socket: any) => { 
            console.log("is connected");
            let name: String;
            socket.on("onLogin", (data: String) => {
                const result = this._nameValidatorService.validateName(data);
                if(result){
                    name = data;
                }
                socket.emit("loginReponse", result.toString() );
            });
            
            socket.on("disconnect", (data: String) => {
                this._nameValidatorService.leaveBrowser(name);
            });
            
         });
        io.listen(3333);
    }

}