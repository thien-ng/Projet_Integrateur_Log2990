import * as http from "http";
import { inject, injectable } from "inversify";
import * as SocketIO from "socket.io";
import { IClickMessage, IPlayerInputResponse } from "../../../common/communication/iGameplay";
import { IChat } from "../../../common/communication/iChat";
import { IUser } from "../../../common/communication/iUser";
import { Constants } from "../constants";
import { IPlayerInput } from "../services/game/arena/interfaces";
import { GameManagerService } from "../services/game/game-manager.service";
import { TimeManagerService } from "../services/time-manager.service";
import { UserManagerService } from "../services/user-manager.service";
import Types from "../types";

const LOGIN_MESSAGE: string = " has logged in";
const LOGOUT_MESSAGE: string = " has logged out";

@injectable()
export class WebsocketManager {

    private io: SocketIO.Server;

    public constructor(
        @inject(Types.UserManagerService) private userManagerService: UserManagerService,
        @inject(Types.GameManagerService) private gameManagerService: GameManagerService,
        @inject(Types.TimeManagerService) private timeManagerService: TimeManagerService) {}

    public createWebsocket(server: http.Server): void {
        this.io = SocketIO(server);
        this.io.on(Constants.CONNECTION, (socket: SocketIO.Socket) => {

            const user: IUser = {
                username:       "",
                socketID:       "",
            };

            const socketID: string = "";

            this.loginSocketChecker(user, socketID, socket);
            this.gameSocketChecker(socketID, socket);

            socket.on("test", (data: string) => {
                socket.emit("onPlayerStatus", 
                    {username: "nameHere",
                    message: data,
                    time: this.timeManagerService.getTimeNow()
                });
            });

         });
        this.io.listen(Constants.WEBSOCKET_PORT_NUMBER);
    }

    private gameSocketChecker(socketID: string, socket: SocketIO.Socket): void {

        socket.on(Constants.GAME_CONNECTION, () => {
            socketID = socket.id;
            this.gameManagerService.subscribeSocketID(socketID, socket);
        });

        socket.on(Constants.GAME_DISCONNECT, (username: string) => {
            this.gameManagerService.unsubscribeSocketID(socketID, username);
        });

        socket.on(Constants.POSITION_VALIDATION_EVENT, (data: IClickMessage) => {
            const user: IUser | string = this.userManagerService.getUserByUsername(data.username);

            if (typeof user !== "string") {
                const playerInput: IPlayerInput = this.buildPlayerInput(data, user);
                this.gameManagerService.onPlayerInput(playerInput)
                .then((response: IPlayerInputResponse) => {
                    socket.emit(Constants.ON_ARENA_RESPONSE, response);
                }).catch((error: Error) => {
                    socket.emit(Constants.ON_ERROR_MESSAGE, error);
                });
            }
        });
    }

    private buildPlayerInput(data: IClickMessage, user: IUser): IPlayerInput {
        return {
            event:      Constants.CLICK_EVENT,
            arenaId:    data.arenaID,
            user:       user,
            position:   {
                x:  data.position.x,
                y:  data.position.y,
            },
        };
    }

    private loginSocketChecker(user: IUser, socketID: string , socket: SocketIO.Socket): void {

        socket.on(Constants.LOGIN_EVENT, (data: string) => {
            user = {
                username:       data,
                socketID:       socket.id,
            };
            this.userManagerService.updateSocketID(user);
            socket.emit(Constants.USER_EVENT, user);

            this.emitPlayerStatus("Server", user.username + LOGIN_MESSAGE, socket);
        });

        socket.on(Constants.DISCONNECT_EVENT, () => {
            this.userManagerService.leaveBrowser(user);
            this.gameManagerService.unsubscribeSocketID(socketID, user.username);

            this.emitPlayerStatus("Server", user.username + LOGOUT_MESSAGE, socket);
        });
    }

    private emitPlayerStatus(username: string, message: string, socket: SocketIO.Socket): void {

        socket.broadcast.emit("onPlayerStatus",
            {username: username,
            message: message,
            time: this.timeManagerService.getTimeNow(),
        } as IChat);
    }
}
