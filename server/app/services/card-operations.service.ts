import { inject, injectable } from "inversify";
import { GameMode, ICard } from "../../../common/communication/iCard";
import { ICardLists } from "../../../common/communication/iCardLists";
import { Message } from "../../../common/communication/message";
import { CCommon } from "../../../common/constantes/cCommon";
import { CServer } from "../CServer";
import Types from "../types";
import { AssetManagerService } from "./asset-manager.service";
import { HighscoreService } from "./highscore.service";

@injectable()
export class CardOperations {

    private imageManagerService:    AssetManagerService;
    private cards:                  ICardLists;
    private socketServer:           SocketIO.Server;

    public constructor(@inject(Types.HighscoreService) private highscoreService: HighscoreService) {
        this.imageManagerService = new AssetManagerService();
        this.cards = {
            list2D: [],
            list3D: [],
        };
    }

    public setServer(server: SocketIO.Server): void {
        this.socketServer = server;
    }

    public getCardList(): ICardLists {
        return this.cards;
    }

    public addCard2D(card: ICard): boolean {
        let isExisting: boolean = false;
        this.cards.list2D.forEach((element: ICard) => {
            if (this.cardEqual(card, element)) {
                isExisting = true;
            }
        });
        if (!isExisting) {
            this.cards.list2D.unshift(card);
            this.highscoreService.createHighscore(card.gameID);
            if (this.socketServer) {
                this.socketServer.emit(CCommon.ON_CARD_CREATED);
            }
        }

        return !isExisting;
    }

    public addCard3D(card: ICard): boolean {
        let isExisting: boolean = false;
        this.cards.list3D.forEach((element: ICard) => {
            if (this.cardEqual(card, element)) {
                isExisting = true;
            }
        });
        if (!isExisting) {
            this.cards.list3D.unshift(card);
            this.highscoreService.createHighscore(card.gameID);
            if (this.socketServer) {
                this.socketServer.emit(CCommon.ON_CARD_CREATED);
            }
        }

        return !isExisting;
    }

    public removeCard2D(id: number): string {
        if (id === CServer.DEFAULT_CARD_2D) {
            return CServer.DELETION_ERROR_MESSAGE;
        }
        const index: number = this.findCard2D(id);
        const paths: string[] = [
            CServer.IMAGES_PATH + "/" + id + CServer.GENERATED_FILE,
            CServer.IMAGES_PATH + "/" + id + CCommon.ORIGINAL_FILE,
            CServer.IMAGES_PATH + "/" + id + CCommon.MODIFIED_FILE,
        ];
        if (index === CServer.DOESNT_EXIST) {
            return CServer.CARD_NOT_FOUND;
        }

        try {
            this.imageManagerService.deleteStoredImages(paths);
            this.cards.list2D.splice(index, 1);
        } catch (error) {
            return this.generateErrorMessage(error).body;
        }
        if (this.socketServer) {
            this.socketServer.emit(CCommon.ON_CARD_DELETED);
        }

        return CServer.CARD_DELETED;
    }

    public removeCard3D(id: number): string {
        if (id === CServer.DEFAULT_CARD_3D) {
            return CServer.DELETION_ERROR_MESSAGE;
        }
        const index: number = this.findCard3D(id);
        if (index === CServer.DOESNT_EXIST) {
            return CServer.CARD_NOT_FOUND;
        }

        const paths: string[] = [
            CServer.IMAGES_PATH   + "/" + id + CServer.GENERATED_SNAPSHOT,
            CServer.SCENE_PATH    + "/" + id + CCommon.SCENE_FILE,
        ];
        try {
            this.imageManagerService.deleteStoredImages(paths);
            this.cards.list3D.splice(index, 1);
        } catch (error) {
            return this.generateErrorMessage(error).body;
        }
        if (this.socketServer) {
            this.socketServer.emit(CCommon.ON_CARD_DELETED);
        }

        return CServer.CARD_DELETED;
    }

    public getCardById(id: string, gamemode: GameMode): ICard {
        const gameID:   number = parseInt(id, CServer.DECIMAL);
        const index:    number = (gamemode === GameMode.simple) ? this.findCard2D(gameID) : this.findCard3D(gameID);

        return (gamemode === GameMode.simple) ? this.cards.list2D[index] : this.cards.list3D[index];
    }

    private findCard2D(id: number): number {
        let index: number = CServer.DOESNT_EXIST;
        this.cards.list2D.forEach((card: ICard) => {
            if (card.gameID === id) {
                index = this.cards.list2D.indexOf(card);
            }
        });

        return index;
    }

    private findCard3D(id: number): number {
        let index: number = CServer.DOESNT_EXIST;
        this.cards.list3D.forEach((card: ICard) => {
            if (card.gameID === id) {
                index = this.cards.list3D.indexOf(card);
            }
        });

        return index;
    }

    private cardEqual(card: ICard, element: ICard): boolean {
        return (element.gameID === card.gameID || element.title === card.title);
    }

    public generateErrorMessage(error: Error): Message {
        const isTypeError:  boolean = error instanceof TypeError;
        const errorMessage: string  = isTypeError ? error.message : CServer.UNKNOWN_ERROR;

        return {
            title:  CCommon.ON_ERROR,
            body:   errorMessage,
        };
    }
}
