import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CardModel } from "../../../../common/communication/cardModel";
import { Constants } from "../constants";
import { HighscoreDisplayComponent } from "../highscore-display/highscore-display.component";
import { TestingImportsModule } from "../testing-imports/testing-imports.module";
import { CardComponent } from "./card.component";

describe("CardComponent", () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CardComponent, HighscoreDisplayComponent],
      imports: [TestingImportsModule],
    })
      .compileComponents()
      .catch(() => Constants.OBLIGATORY_CATCH);
  }));
  // initialiser le cardmodel pour que linterface compile
  beforeEach(() => {
    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    const cardModel: CardModel = {
      gameID: 12,
      title: "string",
      subtitle: "string",
      avatarImageUrl: "string",
      gameImageUrl: "string",
    };
    component._cardModel = cardModel;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
