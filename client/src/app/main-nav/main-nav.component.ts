import { animate, state, style, transition, trigger } from "@angular/animations";
import { Breakpoints, BreakpointObserver } from "@angular/cdk/layout";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { NavigationEnd, Router } from "@angular/router";

import { Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { User } from "../../../../common/communication/iUser";
import { Constants } from "../constants";
import { CreateFreeGameComponent } from "../create-free-game/create-free-game.component";
import { CreateSimpleGameComponent } from "../create-simple-game/create-simple-game.component";
import { SocketService } from "../websocket/socket.service";
import { AdminToggleService } from "./admin-toggle.service";

@Component({
  selector: "app-main-nav",
  templateUrl: "./main-nav.component.html",
  styleUrls: ["./main-nav.component.css"],
  animations: [
    trigger("slideInOut", [
      state("open", style({})),
      state("closed", style({
        transform: "translateX(15em)",
      })),
      transition("open => closed", [
        animate(Constants.ANIMATION_TIME),
      ]),
      transition("closed => open", [
        animate(Constants.ANIMATION_TIME),
      ]),
    ]),
  ],
})
export class MainNavComponent implements OnInit, OnDestroy {

  public isAdminMode: boolean;
  public client: string | null;
  public readonly LOGIN_PATH: string = Constants.LOGIN_REDIRECT;
  public readonly SIMPLE_GAME_PATH: string = "/game-view-simple";
  public readonly FREE_GAME_PATH: string = "/game-view-free";
  public readonly TEXT_ADMIN: string = "Vue Administration";
  public readonly TEXT_BOUTON_2D: string = "Créer jeu simple";
  public readonly TEXT_BOUTON_3D: string = "Créer jeu 3D";
  private stateSubscription: Subscription;

  public isValidUrl: boolean;

  public constructor(
    private breakpointObserver: BreakpointObserver,
    public dialog: MatDialog,
    public adminService: AdminToggleService,
    public router: Router,
    private socketService: SocketService,
  ) {
    this.client = null;
    this.isValidUrl = true;

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isValidUrl = this.router.url !== this.SIMPLE_GAME_PATH && this.router.url !== this.FREE_GAME_PATH;
      }
    });
  }

  public isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((event) => event.matches));

  public ngOnInit(): void {
    this.initMainNav();
  }

  public initMainNav(): void {
    this.client = sessionStorage.getItem(Constants.USERNAME_KEY);

    this.isAdminMode = this.adminService.isAdminState;
    this.stateSubscription = this.adminService.getAdminUpdateListener()
      .subscribe((activeState: boolean) => {
        this.isAdminMode = activeState;
    });

    this.socketService.onMsg(Constants.ON_USER_EVENT).subscribe((answer: User) => {
      this.assignUser(answer);
    });

  }

  private assignUser(user: User): void {
    sessionStorage.setItem(Constants.USERNAME_KEY, user.username);
    this.client = user.username;
  }

  public openSimpleDialog(): void {

    const dialogConfig: MatDialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;

    this.dialog.open(CreateSimpleGameComponent, dialogConfig);
  }

  public openFreeDialog(): void {

    const dialogConfig: MatDialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;

    this.dialog.open(CreateFreeGameComponent, dialogConfig);
  }

  public ngOnDestroy(): void {
    if (this.stateSubscription !== undefined) {
      this.stateSubscription.unsubscribe();
    }
  }
}
