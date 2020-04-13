import * as BABYLON from 'babylonjs';
import 'babylonjs-inspector';
import Player from './Player';
import MiniMap from "./MiniMap";
import FoxGenerator from "./FoxGenerator";
import * as GUI from "babylonjs-gui";
import PanelMenu from "./PanelMenu";


export default class Game {

    constructor(canvasId, mesh) {
        // get element from html file.
        const canvas = document.getElementById(canvasId);
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(canvas, true, {stencil: true});
        this.scene = new BABYLON.Scene(this.engine);
        this.otherPlayers = [];
        this.debug = false;
        this.hudManager();
        this.ctx = null;

        BABYLON.SceneLoader.Append('', `data:${JSON.stringify(mesh.scene)}`, this.scene, scene => {
            this.scene.activeCamera.attachControl(canvas, true);
            new BABYLON.Layer('background', 'assets/textures/background.jpg', this.scene, true);

            // Mini Map
            this.miniMap = new MiniMap(this.scene, canvas);

            // Fox
            let fg = new FoxGenerator(this.scene, this.advancedTexture);

            // TEST

        });

        document.addEventListener('keydown', (event) => {
            // console.log(event);
            if (event.key === " ") {
                this.player.punch();
            }

            if (event.key === "Enter" && event.shiftKey) {
                if (!this.debug) {
                    this.debug = true;
                    this.scene.debugLayer.show();
                } else {
                    this.debug = false;
                    this.scene.debugLayer.hide();
                }
            }
        });


        // Right Click
        window.addEventListener('contextmenu', event => {
            // We try to pick an object
            var pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);

            if (pickResult.hit) {

                // Check distance
                // if (BABYLON.Vector3.Distance(pickResult.pickedPoint, this.player.player.position) < 10) {
                //     // Attack
                //     this.player.attack();
                // } else {
                //     // Walk to it
                //     this.player.addDestination(pickResult.pickedPoint.clone());
                // }

                // this.outlineMesh(pickResult.pickedMesh);

                // Open ContextMenu
                if (this.ctx) {
                    this.ctx.remove();
                }
                this.ctx = getContextMenu(this.scene, pickResult, this.player, this.advancedTexture);
                this.ctx.addTo(this.advancedTexture);
                event.preventDefault();
            } else {
                if (this.ctx) {
                    this.ctx.remove();
                }
            }


        });


        // Left Click
        this.scene.onPointerDown = (event, pickResult) => {
            if (event.which === 3) return;

            if (this.ctx) {
                this.ctx.remove();
            }

            if (event.shiftKey) {
                // TODO: Stop moving...
                this.player.attack();
                return;
            }

            if (pickResult.hit) {

                // Only allow the ground
                if (pickResult.pickedMesh.id === "myGround") {
                    this.player.addDestination(pickResult.pickedPoint.clone());
                } else {
                    // Dont outline ground
                    this.outlineMesh(pickResult.pickedMesh);
                }
            }


        };

        this.scene.registerBeforeRender(() => {
            this.miniMap.miniMapCamera.alpha = this.scene.activeCamera.alpha;
            if (this.player) {
                if (this.player.player) {

                    // Minimap to follow Player
                    this.miniMap.miniMapCamera.lockedTarget = new BABYLON.Vector3(this.player.player.position.x, 50, this.player.player.position.z)
                }
            }

            if (this.scene.isReady()) {
                if (this.player) {
                    this.player.move();
                }

                // Handle other players
                for (let o of this.otherPlayers) {
                    o.move();
                }
            }
        });


        // renders the scene 60 fps.
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                this.scene.render();
            }

            this.player.checkMeshToDestroy();

            this.energyBar.width = this.player.energy/100;
        });

    }

    async addPlayer(socket, pos, name) {
        this.socket = socket;
        this.player = new Player(this.scene, this.socket, this.advancedTexture, name, true);
        await this.player.initCharModel(new BABYLON.Vector3(pos.x, 0, pos.z));
    }

    async addOtherPlayer(pos, name) {
        console.log("other name: " +  name);
        let other = new Player(this.scene, this.socket, this.advancedTexture, name);
        let m = await other.initCharModel(pos);
        console.log(m);
        this.otherPlayers.push(other);
        return other;
    }

    hudManager() {
        // GUI setup
        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        var button = GUI.Button.CreateImageOnlyButton("but", "assets/textures/run_icon.png");
        button.width = "40px";
        button.height = "40px";
        button.color = "black";
        button.background = "transparent";
        button.cornerRadius = 500;
        // button.left = 600;
        console.log(this.canvas.height);
        button.top = this.canvas.height/2.6;
        this.advancedTexture.addControl(button);

        button.onPointerClickObservable.add( () => {
            let isRunning = this.player.toggleRun();

            button.background = isRunning? "white" : "transparent";

        });

        // TODO: Move to player? or maybe new PlayerGUI class?
        // Health bar
        var healthBar = new GUI.Rectangle("healthBar");
        healthBar.left = 0;
        healthBar.top = 400;
        healthBar.width = 0.2;
        healthBar.height = "20px";
        healthBar.cornerRadius = 20;
        healthBar.color = "white";
        healthBar.thickness = 4;
        healthBar.background = "red";
        this.healthBar = healthBar;
        this.advancedTexture.addControl(healthBar);

        // Energy Bar
        var energyBar = new GUI.Rectangle("energyBar");
        energyBar.left = 0;
        energyBar.top = 430;
        energyBar.width = 0.2;
        energyBar.height = "20px";
        energyBar.cornerRadius = 20;
        energyBar.color = "white";
        energyBar.thickness = 4;
        energyBar.background = "orange";
        this.energyBar = energyBar;
        this.advancedTexture.addControl(energyBar);

    }

    // TODO: Remove...
    outlineMesh(mesh){
        // Outline
        mesh.outlineColor = new BABYLON.Color3(0.3, 0, 0);
        mesh.outlineWidth = 1;
        mesh.renderOutline = true;
    }

    randomNumber(min, max) {
        if (min == max) {
            return (min);
        }
        var random = Math.random();
        return ((random * (max - min)) + min);
    };
}

// https://pastebin.com/raw/1zp6fyb4
var getContextMenu = function (scene, pickResult, player, at) {
    // Depending on what is hit, make a new type of context menu
    // pass in functions for options
    console.log(pickResult.pickedMesh);
    if (pickResult.pickedMesh.parent){
        // Check this...
        pickResult.pickedMesh = pickResult.pickedMesh.parent;
    }

    if (pickResult.pickedMesh.id === "myGround") {
        return new PanelMenu(['Walk Here'], [], scene.pointerX, scene.pointerY, pickResult, player, at);
    } else if (pickResult.pickedMesh.metadata.canDestroy){
        return new PanelMenu(['Destroy'], [], scene.pointerX, scene.pointerY, pickResult, player, at);
    } else {
        return new PanelMenu(['Attack'], [], scene.pointerX, scene.pointerY, pickResult, player, at);

        // return new PanelMenu(['Kill', 'Shoo', 'Inspect', 'Walk Here'], [], scene.pointerX, scene.pointerY, pickResult, player, at);
    }

    // let menu1 = new PanelMenu(['SPARTA!']);
    // let menu2 = new PanelMenu(['is.'], [menu1]);
    // let menu4 = new PanelMenu([';)']);
    // let menu3 = new PanelMenu(['is', 'afraid', 'of', 'the', 'big', 'bad', 'wolf'], [0,0,0,menu4]);
    // return new PanelMenu(['This.', 'Are', 'Who'], [menu2, undefined, menu3], scene.pointerX, scene.pointerY);
};

