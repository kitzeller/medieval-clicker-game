import * as BABYLON from 'babylonjs';
import Player from './Player';

export default class Game {

    constructor(canvasId, mesh) {
        // get element from html file.
        const canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.otherPlayers = [];

        BABYLON.SceneLoader.Append('', `data:${JSON.stringify(mesh.scene)}`, this.scene, scene => {
            this.scene.activeCamera.attachControl(canvas, true);
            new BABYLON.Layer('background', 'assets/textures/background.jpg', this.scene, true);


            // Mini Map
            this.miniMapCamera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, 0.001, 50, BABYLON.Vector3.Zero(), this.scene);
            this.miniMapCamera.attachControl(canvas, true);
            this.miniMapCamera.layerMask = 2;
            var rt2 = new BABYLON.RenderTargetTexture("depth", 1024, this.scene, true, true);
            this.scene.customRenderTargets.push(rt2);
            rt2.activeCamera = this.miniMapCamera;
            rt2.renderList = this.scene.meshes;

            var miniMap = BABYLON.Mesh.CreatePlane("plane", 5, this.scene);
            miniMap.position = new BABYLON.Vector3(canvas.width/130, canvas.height/150, 25);
            var miniMapMaterial = new BABYLON.StandardMaterial("texturePlane", this.scene);
            miniMapMaterial.diffuseTexture = rt2;
            miniMapMaterial.diffuseTexture.uScale = 1; // zoom
            miniMapMaterial.diffuseTexture.vScale = 1;
            miniMapMaterial.diffuseTexture.level = 1.2; // intensity
            miniMapMaterial.emissiveColor = new BABYLON.Color3(1,1,1); // backlight
            miniMapMaterial.specularColor = BABYLON.Color3.Black();
            miniMapMaterial.diffuseColor = new BABYLON.Color3(1,1,1);

            miniMap.material = miniMapMaterial;
            miniMap.parent = this.scene.activeCamera;
            miniMap.layerMask = 1;

            // var epsilon = .9999999;  // threshold
            // miniMap.enableEdgesRendering(epsilon);
            // miniMap.edgesWidth = 5.0;
            // miniMap.edgesColor = new BABYLON.Color4(1, 1, 1, 1);


        });

        this.scene.onPointerDown = (event, pickResult) => {
            if (pickResult.hit) {
                // Only allow the ground
                if (pickResult.pickedMesh.id === "myGround") {
                    this.player.addDestination(pickResult.pickedPoint.clone());

                    if (this.socket){
                        this.socket.emit('player movement', {
                            id : this.socket.id,
                            position: pickResult.pickedPoint.clone()
                        });
                    }
                }
            }
        };

        this.scene.registerBeforeRender(() => {
            this.miniMapCamera.alpha = this.scene.activeCamera.alpha;
            if (this.player) {
                if (this.player.player) {

                    // Minimap to follow Player
                    this.miniMapCamera.lockedTarget = new BABYLON.Vector3(this.player.player.position.x, 50, this.player.player.position.z)
                }
            }

            if (this.scene.isReady()) {
                if (this.player) {
                    this.player.move();
                }

                for (let o of this.otherPlayers){
                    o.move();
                }
            }
        });


        // renders the scene 60 fps.
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                this.scene.render();
            }
        });

    }

    addPlayer(socket) {
        this.socket = socket;
        this.player = new Player(this.scene, this.socket, true);
        this.player.initCharModel();
    }

    async addOtherPlayer(pos) {
        let other = new Player(this.scene, this.socket);
        let m = await other.initCharModel(pos);
        console.log(m);
        this.otherPlayers.push(other);
        return other;
    }
}
