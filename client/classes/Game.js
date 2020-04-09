import * as BABYLON from 'babylonjs';
import Player from './Player';

export default class Game {

    constructor(canvasId, mesh) {
        // get element from html file.
        const canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);

        BABYLON.SceneLoader.Append('', `data:${JSON.stringify(mesh.scene)}`, this.scene, scene => {
            this.scene.activeCamera.attachControl(canvas, true);
            new BABYLON.Layer('background', 'assets/textures/background.jpg', this.scene, true);


            // Mini Map
            this.camera2 = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, 0.001, 50, BABYLON.Vector3.Zero(), this.scene);
            this.camera2.attachControl(canvas, true);
            this.camera2.layerMask = 2;
            var rt2 = new BABYLON.RenderTargetTexture("depth", 1024, this.scene, true, true);
            this.scene.customRenderTargets.push(rt2);
            rt2.activeCamera = this.camera2;
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

        };

        this.scene.registerBeforeRender(() => {
            this.camera2.alpha = this.scene.activeCamera.alpha;

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
        return m;
    }
}
