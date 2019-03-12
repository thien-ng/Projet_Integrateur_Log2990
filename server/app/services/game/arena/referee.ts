import { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { CCommon } from "../../../../../common/constantes/cCommon";
import { Constants } from "../../../constants";

import { Arena } from "./arena";
import { Player } from "./player";
import { Timer } from "./timer";

import { IArenaResponse, IOriginalPixelCluster, IPosition2D } from "../../../../../common/communication/iGameplay";
import { IUser } from "../../../../../common/communication/iUser";
import { IArenaInfos, IHitConfirmation, IHitToValidate } from "./interfaces";

const axios: AxiosInstance = require("axios");

export class Referee {

    private readonly ERROR_HIT_VALIDATION:  string = "Problem during Hit Validation process.";
    private readonly ON_FAILED_CLICK:       string = "onFailedClick";
    private readonly POINTS_TO_WIN_SINGLE:  number = 7;
    private readonly POINTS_TO_WIN_MULTI:   number = 4;

    private differencesFound:   number[];
    private pointsNeededToWin:  number;

    public constructor(public  arena:               Arena,
                       private players:             Player[],
                       private originalElements:    Map<number, IOriginalPixelCluster>,
                       public  timer:               Timer,
                       public  arenaInfos:          IArenaInfos,
    ) {

        this.timer = new Timer();
        this.pointsNeededToWin = players.length === 1 ? this.POINTS_TO_WIN_SINGLE : this.POINTS_TO_WIN_MULTI;

        this.differencesFound = [];
        this.initTimer();
    }

    public async onPlayerClick(position: IPosition2D, user: IUser): Promise<IArenaResponse> {

        let inputResponse: IArenaResponse = this.buildPlayerInputResponse(
            this.ON_FAILED_CLICK,
            Constants.ON_ERROR_PIXEL_CLUSTER,
        );

        return this.validateHit(position)
        .then((hitConfirmation: IHitConfirmation) => {
            const isAnUndiscoveredDifference: boolean = this.isAnUndiscoveredDifference(hitConfirmation.differenceIndex);

            if (hitConfirmation.isAHit && isAnUndiscoveredDifference) {
                this.onHitConfirmation(user, hitConfirmation);
                const pixelCluster: IOriginalPixelCluster | undefined = this.originalElements.get(hitConfirmation.differenceIndex);

                if (pixelCluster !== undefined) {
                    inputResponse = this.buildPlayerInputResponse(CCommon.ON_SUCCESS, pixelCluster);
                }
                if (this.gameIsFinished()) {
                    this.endOfGameRoutine();
                }
            }

            return inputResponse;
        })
        .catch ((error: Error) => {
            return this.buildPlayerInputResponse(CCommon.ON_ERROR, Constants.ON_ERROR_PIXEL_CLUSTER);
        });
    }

    public async validateHit(position: IPosition2D): Promise<IHitConfirmation> {

        const postData:     IHitToValidate      = this.buildPostData(position);
        const postConfig:   AxiosRequestConfig  = this.buildPostConfig();

        return axios.post(Constants.URL_HIT_VALIDATOR + "/2d", postData, postConfig)
            .then((res: AxiosResponse) => {
                return res.data;
            })
            .catch((err: AxiosError) => {
                throw new TypeError(this.ERROR_HIT_VALIDATION);
            });
    }

    private onHitConfirmation(user: IUser, hitConfirmation: IHitConfirmation): void {
        this.attributePoints(user);
        this.addToDifferencesFound(hitConfirmation.differenceIndex);
    }

    private addToDifferencesFound(differenceIndex: number): void {
        this.differencesFound.push(differenceIndex);
    }

    private attributePoints(user: IUser): void {
        const foundPlayer: Player | undefined = this.players.find( (player: Player) => {
            return player.username === user.username;
        });

        if (foundPlayer !== undefined) {
            foundPlayer.addPoints(1);
            this.arena.sendMessage(foundPlayer.userSocketId, CCommon.ON_POINT_ADDED, foundPlayer.points);
        }
    }

    private isAnUndiscoveredDifference(differenceIndex: number): boolean {
        return this.differencesFound.indexOf(differenceIndex) < 0;
    }

    private initTimer(): void {
        this.timer.startTimer();
        this.timer.getTimer().subscribe((newTime: number) => {
            this.players.forEach((player: Player) => {
                this.arena.sendMessage(player.userSocketId, CCommon.ON_TIMER_UPDATE, newTime);
            });
        });
    }

    private gameIsFinished(): boolean {

        const playerHasReachPointsNeeded:   boolean = this.players.some((player: Player) => player.points >= this.pointsNeededToWin );
        const differenceAreAllFound:        boolean = this.differencesFound.length >= this.originalElements.size;

        return playerHasReachPointsNeeded || differenceAreAllFound;
    }

    private endOfGameRoutine(): void {
        this.timer.stopTimer();
    }

    private buildPlayerInputResponse(status: string, response: IOriginalPixelCluster): IArenaResponse {
        return {
            status:     status,
            response:   response,
        };
    }

    private buildPostData(position: IPosition2D): IHitToValidate {
        return {
            eventInfo:          position,
            differenceDataURL:  this.arenaInfos.differenceGameUrl,
            colorToIgnore:      Constants.FF,
        };
    }

    private buildPostConfig(): AxiosRequestConfig {
        return {
            headers: {
                "Content-Type":                 "application/json;charset=UTF-8",
                "Access-Control-Allow-Origin":  "*",
            },
        };
    }
}
