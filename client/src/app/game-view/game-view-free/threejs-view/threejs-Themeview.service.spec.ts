import { inject, TestBed } from "@angular/core/testing";
import * as THREE from "three";
import {  anyNumber, mock, when } from "ts-mockito";
import { ActionType, IPosition2D, ISceneObjectUpdate } from "../../../../../../common/communication/iGameplay";
import { IMesh, ISceneObject } from "../../../../../../common/communication/iSceneObject";
import { ISceneVariables } from "../../../../../../common/communication/iSceneVariables";
import { GameViewFreeService } from "../game-view-free.service";
import { ThreejsThemeViewService } from "./threejs-ThemeView.service";
import { ThreejsRaycast } from "./utilitaries/threejs-raycast";
import { ThreejsThemeGenerator } from "./utilitaries/threejs-themeGenerator";

// tslint:disable:no-any max-file-line-count max-line-length

const sceneVariables: ISceneVariables<IMesh> = {
  theme:                  1,
  gameName:               "gameName",
  sceneObjectsQuantity:   1,
  sceneObjects: [
    {
      name: "",
      id:         1,
      meshInfo:   {GLTFUrl: "", uuid: ""},
      position:   { x: 1, y: 1, z: 1 },
      rotation:   { x: 1, y: 1, z: 1 },
      radius:      1,
      scaleFactor: 1,
      hidden:     true,
    },
  ],
  sceneBackgroundColor: "#FFFFFF",
};
const renderer:   THREE.WebGLRenderer   = mock(THREE.WebGLRenderer);
const scene:      THREE.Scene           = mock(THREE.Scene);
const generator:  ThreejsThemeGenerator = mock(ThreejsThemeGenerator);

describe("ThreejsThemeViewService Tests", () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [ThreejsThemeViewService],
  }));

  it("should generate objects in scene when createScene() is called", inject([ThreejsThemeViewService], async (threejsThemeViewService: ThreejsThemeViewService) => {
    const spy: any = spyOn<any>(threejsThemeViewService, "generateSceneObjects");
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });
    await threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    expect(spy).toHaveBeenCalled();
  }));

  it("should initiate objects in scene when createScene() is called", inject([ThreejsThemeViewService], async (threejsThemeViewService: ThreejsThemeViewService) => {
    spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });
    await threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    threejsThemeViewService["threejsThemeRaycast"].setThreeGenerator(generator);
    const spy: any = spyOn(threejsThemeViewService["threejsGenerator"], "initiateObject").and.callFake(() => {return; });
    spyOn(threejsThemeViewService["gameViewFreeService"], "updateSceneLoaded").and.callFake(() => {return; });
    threejsThemeViewService["generateSceneObjects"](false, 1);
    expect(spy).toHaveBeenCalled();
  }));

  it("should set up front the threejsMovement", inject([ThreejsThemeViewService], async (threejsThemeViewService: ThreejsThemeViewService)=> {
    const spy: any = spyOn(threejsThemeViewService["threejsMovement"], "setupFront").and.callFake(() => {return; });
    threejsThemeViewService["setupFront"](1);
    expect(spy).toHaveBeenCalled();
  }));

  it("should add lighting in scene when createLigthing is called", inject([ThreejsThemeViewService], async (threejsThemeViewService: ThreejsThemeViewService) => {
    const spy: any = spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "generateSceneObjects").and.callFake(() => { return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });
    await threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    expect(spy).toHaveBeenCalled();
  }));

  it("should render scene when animate() is called", inject([ThreejsThemeViewService], async (threejsThemeViewService: ThreejsThemeViewService) => {
    const spy: any = spyOn<any>(threejsThemeViewService, "renderObject");
    spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "generateSceneObjects").and.callFake(() => { return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });
    await threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    threejsThemeViewService.animate();
    expect(spy).toHaveBeenCalled();
  }));

  it("should change color of the mesh object to cheat color",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {
    const spy: any = spyOn<any>(threejsThemeViewService, "recoverObjectFromScene").and.callThrough();
    spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "generateSceneObjects").and.callFake(() => { return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });

    const generatedColor:   THREE.MeshBasicMaterial = new THREE.MeshPhongMaterial( {color: "#FFFFFF"} );
    const sphereGeometry:   THREE.Geometry          = new THREE.SphereGeometry(1);
    const generatedObject:  THREE.Mesh              = new THREE.Mesh(sphereGeometry, generatedColor);

    when(scene.getObjectById(anyNumber())).thenReturn(generatedObject);

    const modifiedList: number[] = [1];
    threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    threejsThemeViewService["threejsGenerator"] = generator;
    threejsThemeViewService.changeObjectsColor(true, false, modifiedList);

    expect(spy).toHaveBeenCalled();
  }));

  it("should not change any color if forced to put color back to original",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {
    const spy: any = spyOn<any>(threejsThemeViewService, "recoverObjectFromScene").and.callThrough();
    spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "generateSceneObjects").and.callFake(() => { return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });

    threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    threejsThemeViewService["threejsGenerator"] = generator;
    threejsThemeViewService.changeObjectsColor(true, false, undefined);

    expect(spy).not.toHaveBeenCalled();
  }));

  it("should change color of the mesh object to origin color",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {
    const spy: any = spyOn<any>(threejsThemeViewService, "recoverObjectFromScene").and.callThrough();
    spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "generateSceneObjects").and.callFake(() => { return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });

    const generatedColor:   THREE.MeshBasicMaterial = new THREE.MeshPhongMaterial( {color: "#FFFFFF"} );
    const sphereGeometry:   THREE.Geometry          = new THREE.SphereGeometry(1);
    const generatedObject:  THREE.Mesh              = new THREE.Mesh(sphereGeometry, generatedColor);

    when(scene.getObjectById(anyNumber())).thenReturn(generatedObject);

    const modifiedList: number[] = [1];
    threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    threejsThemeViewService["threejsGenerator"] = generator;
    threejsThemeViewService.changeObjectsColor(false, false, modifiedList);

    expect(spy).toHaveBeenCalled();
  }));

  it("should change color of the mesh object to original opacity",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {
    const spy: any = spyOn<any>(threejsThemeViewService, "recoverObjectFromScene").and.callThrough();
    spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "generateSceneObjects").and.callFake(() => { return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });

    const generatedColor:   THREE.MeshBasicMaterial = new THREE.MeshPhongMaterial( {color: "#FFFFFF"} );
    const sphereGeometry:   THREE.Geometry          = new THREE.SphereGeometry(1);
    const generatedObject:  THREE.Mesh              = new THREE.Mesh(sphereGeometry, generatedColor);

    when(scene.getObjectById(anyNumber())).thenReturn(generatedObject);

    const modifiedList: number[] = [1];
    threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    threejsThemeViewService["threejsGenerator"] = generator;
    threejsThemeViewService.changeObjectsColor(false, true, modifiedList);

    expect(spy).toHaveBeenCalled();
  }));

  it("should not do any update to scene because of undefined object (check if not call initiateObject)",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {

    threejsThemeViewService["threejsGenerator"] = mock(ThreejsThemeGenerator);
    threejsThemeViewService["threejsThemeRaycast"] = mock(ThreejsRaycast);

    const initSpy:   any = spyOn<any>(threejsThemeViewService["threejsGenerator"], "initiateObject");

    const objectUpdate: ISceneObjectUpdate<ISceneObject | IMesh> = {
      actionToApply: ActionType.NO_ACTION_REQUIRED,
    };
    spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "generateSceneObjects").and.callFake(() => { return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });

    threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    threejsThemeViewService.updateSceneWithNewObject(objectUpdate);

    expect(initSpy).not.toHaveBeenCalled();
  }));

  it("should not do any update to scene because of undefined object (check if not call deleteObject)",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {

    threejsThemeViewService["threejsGenerator"] = mock(ThreejsThemeGenerator);
    threejsThemeViewService["threejsThemeRaycast"] = mock(ThreejsRaycast);

    const deleteSpy: any = spyOn<any>(threejsThemeViewService["threejsGenerator"], "deleteObject");

    const objectUpdate: ISceneObjectUpdate<ISceneObject | IMesh> = {
      actionToApply: ActionType.NO_ACTION_REQUIRED,
    };
    spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "generateSceneObjects").and.callFake(() => { return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });

    threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    threejsThemeViewService.updateSceneWithNewObject(objectUpdate);

    expect(deleteSpy).not.toHaveBeenCalled();
  }));

  it("should not do any update to scene because of undefined object (check if not call changeObjectColor)",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {

    threejsThemeViewService["threejsGenerator"] = mock(ThreejsThemeGenerator);
    threejsThemeViewService["threejsThemeRaycast"] = mock(ThreejsRaycast);

    const changeSpy: any = spyOn<any>(threejsThemeViewService["threejsGenerator"], "changeObjectColor");

    const objectUpdate: ISceneObjectUpdate<ISceneObject | IMesh> = {
      actionToApply: ActionType.NO_ACTION_REQUIRED,
    };
    spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "generateSceneObjects").and.callFake(() => { return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });

    threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    threejsThemeViewService.updateSceneWithNewObject(objectUpdate);

    expect(changeSpy).not.toHaveBeenCalled();
  }));

  it("should not do any update to scene because of no action required (check if not call initiateObject)",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {

    threejsThemeViewService["threejsGenerator"] = mock(ThreejsThemeGenerator);
    threejsThemeViewService["threejsThemeRaycast"] = mock(ThreejsRaycast);
    spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "generateSceneObjects").and.callFake(() => { return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });

    const initSpy:   any = spyOn<any>(threejsThemeViewService["threejsGenerator"], "initiateObject");

    const objectUpdate: ISceneObjectUpdate<ISceneObject | IMesh> = {
      actionToApply: ActionType.NO_ACTION_REQUIRED,
      sceneObject:   sceneVariables.sceneObjects[0],
    };

    threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    threejsThemeViewService.updateSceneWithNewObject(objectUpdate);

    expect(initSpy).not.toHaveBeenCalled();
  }));

  it("should not do any update to scene because of no action required (check if not call deleteObject)",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {

    threejsThemeViewService["threejsGenerator"] = mock(ThreejsThemeGenerator);
    threejsThemeViewService["threejsThemeRaycast"] = mock(ThreejsRaycast);
    spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "generateSceneObjects").and.callFake(() => { return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });

    const deleteSpy: any = spyOn<any>(threejsThemeViewService["threejsGenerator"], "deleteObject");

    const objectUpdate: ISceneObjectUpdate<ISceneObject | IMesh> = {
      actionToApply: ActionType.NO_ACTION_REQUIRED,
      sceneObject:   sceneVariables.sceneObjects[0],
    };

    threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    threejsThemeViewService.updateSceneWithNewObject(objectUpdate);

    expect(deleteSpy).not.toHaveBeenCalled();
  }));

  it("should not do any update to scene because of no action required (check if not call changeObjectColor)",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {

    threejsThemeViewService["threejsGenerator"] = mock(ThreejsThemeGenerator);
    threejsThemeViewService["threejsThemeRaycast"] = mock(ThreejsRaycast);
    spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "generateSceneObjects").and.callFake(() => { return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });

    const changeSpy: any = spyOn<any>(threejsThemeViewService["threejsGenerator"], "changeObjectColor");

    const objectUpdate: ISceneObjectUpdate<ISceneObject | IMesh> = {
      actionToApply: ActionType.NO_ACTION_REQUIRED,
      sceneObject:   sceneVariables.sceneObjects[0],
    };

    threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    threejsThemeViewService.updateSceneWithNewObject(objectUpdate);

    expect(changeSpy).not.toHaveBeenCalled();
  }));

  it("should call function initiate object from threejsGenerator (check if not call deleteObject)",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {

    threejsThemeViewService["threejsGenerator"] = mock(ThreejsThemeGenerator);
    threejsThemeViewService["threejsThemeRaycast"] = mock(ThreejsRaycast);
    spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "generateSceneObjects").and.callFake(() => { return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });

    const deleteSpy: any = spyOn<any>(threejsThemeViewService["threejsGenerator"], "deleteObject");

    const objectUpdate: ISceneObjectUpdate<ISceneObject | IMesh> = {
      actionToApply: ActionType.ADD,
      sceneObject:   sceneVariables.sceneObjects[0],
    };

    threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    threejsThemeViewService.updateSceneWithNewObject(objectUpdate);

    expect(deleteSpy).not.toHaveBeenCalled();
  }));

  it("should call function initiate object from threejsGenerator (check if not call changeObjectColor)",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {

    threejsThemeViewService["threejsGenerator"] = mock(ThreejsThemeGenerator);
    threejsThemeViewService["threejsThemeRaycast"] = mock(ThreejsRaycast);
    spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "generateSceneObjects").and.callFake(() => { return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });

    const changeSpy: any = spyOn<any>(threejsThemeViewService["threejsGenerator"], "changeObjectColor");

    const objectUpdate: ISceneObjectUpdate<ISceneObject | IMesh> = {
      actionToApply: ActionType.ADD,
      sceneObject:   sceneVariables.sceneObjects[0],
    };

    threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    threejsThemeViewService.updateSceneWithNewObject(objectUpdate);

    expect(changeSpy).not.toHaveBeenCalled();
  }));

  it("should call function delete object from threejsGenerator (check if not call initiateObject)",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {

    threejsThemeViewService["threejsGenerator"] = mock(ThreejsThemeGenerator);
    threejsThemeViewService["threejsThemeRaycast"] = mock(ThreejsRaycast);
    spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "generateSceneObjects").and.callFake(() => { return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });

    const initSpy:   any = spyOn<any>(threejsThemeViewService["threejsGenerator"], "initiateObject");

    const objectUpdate: ISceneObjectUpdate<ISceneObject | IMesh> = {
      actionToApply: ActionType.DELETE,
      sceneObject:   sceneVariables.sceneObjects[0],
    };

    threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    threejsThemeViewService.updateSceneWithNewObject(objectUpdate);

    expect(initSpy).not.toHaveBeenCalled();
  }));

  it("should call function delete object from threejsGenerator (check if not call changeObjectColor)",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {

    threejsThemeViewService["threejsGenerator"] = mock(ThreejsThemeGenerator);
    threejsThemeViewService["threejsThemeRaycast"] = mock(ThreejsRaycast);
    spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "generateSceneObjects").and.callFake(() => { return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });

    const changeSpy: any = spyOn<any>(threejsThemeViewService["threejsGenerator"], "changeObjectColor");

    const objectUpdate: ISceneObjectUpdate<ISceneObject | IMesh> = {
      actionToApply: ActionType.DELETE,
      sceneObject:   sceneVariables.sceneObjects[0],
    };

    threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    threejsThemeViewService.updateSceneWithNewObject(objectUpdate);

    expect(changeSpy).not.toHaveBeenCalled();
  }));

  it("should call function change color object from threejsGenerator (check if not call initiateObject)",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {

    threejsThemeViewService["threejsGenerator"] = mock(ThreejsThemeGenerator);
    threejsThemeViewService["threejsThemeRaycast"] = mock(ThreejsRaycast);
    spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "generateSceneObjects").and.callFake(() => { return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });

    const initSpy:   any = spyOn<any>(threejsThemeViewService["threejsGenerator"], "initiateObject");

    const objectUpdate: ISceneObjectUpdate<ISceneObject | IMesh> = {
      actionToApply: ActionType.CHANGE_COLOR,
      sceneObject:   sceneVariables.sceneObjects[0],
    };

    threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    threejsThemeViewService.updateSceneWithNewObject(objectUpdate);

    expect(initSpy).not.toHaveBeenCalled();
  }));

  it("should call function change color object from threejsGenerator (check if not call deleteObject)",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {

    threejsThemeViewService["threejsGenerator"] = mock(ThreejsThemeGenerator);
    threejsThemeViewService["threejsThemeRaycast"] = mock(ThreejsRaycast);
    spyOn<any>(threejsThemeViewService, "createLighting").and.callFake(() => {return; });
    spyOn<any>(threejsThemeViewService, "generateSceneObjects").and.callFake(() => { return; });
    spyOn<any>(threejsThemeViewService, "getModelObjects").and.callFake(() => {Promise.resolve(); });

    const deleteSpy: any = spyOn<any>(threejsThemeViewService["threejsGenerator"], "deleteObject");

    const objectUpdate: ISceneObjectUpdate<ISceneObject | IMesh> = {
      actionToApply: ActionType.CHANGE_COLOR,
      sceneObject:   sceneVariables.sceneObjects[0],
    };

    threejsThemeViewService.createScene(scene, sceneVariables, renderer, false, 1);
    threejsThemeViewService.updateSceneWithNewObject(objectUpdate);

    expect(deleteSpy).not.toHaveBeenCalled();
  }));

  it("should call rotateCamera from threejsMovement",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {

      const position: IPosition2D = {x: 1, y: 1};

      const spy: any = spyOn<any>(threejsThemeViewService["threejsMovement"], "rotateCamera");
      threejsThemeViewService.rotateCamera(position);
      expect(spy).toHaveBeenCalled();
  }));

  it("should call detectObject from threejsRayCast",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {

        threejsThemeViewService["gameViewFreeService"] = mock(GameViewFreeService);
        threejsThemeViewService["threejsThemeRaycast"] = mock(ThreejsRaycast);
        const spy: any = spyOn<any>(threejsThemeViewService["threejsThemeRaycast"], "detectObject");
        const mockedMouseEvent: any = mock(MouseEvent);

        threejsThemeViewService.detectObject(mockedMouseEvent);

        expect(spy).toHaveBeenCalled();
  }));

  it("should call detectObject from threejsRayCast",
     inject([ThreejsThemeViewService], (threejsThemeViewService: ThreejsThemeViewService) => {

      threejsThemeViewService["gameViewFreeService"] = mock(GameViewFreeService);
      threejsThemeViewService["threejsThemeRaycast"] = mock(ThreejsRaycast);
      const spy: any = spyOn<any>(threejsThemeViewService["threejsThemeRaycast"], "detectObject");
      const mockedMouseEvent: any = mock(MouseEvent);

      threejsThemeViewService.detectObject(mockedMouseEvent);

      expect(spy).toHaveBeenCalled();
  }));