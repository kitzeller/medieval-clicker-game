import * as BABYLON from 'babylonjs';

export default class MiniMap {
    constructor(scene, canvas) {
        this.scene = scene;
        this.miniMapCamera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, 0.001, 50, BABYLON.Vector3.Zero(), this.scene);
        this.miniMapCamera.attachControl(canvas, true);
        this.miniMapCamera.layerMask = 2;
        var rt2 = new BABYLON.RenderTargetTexture("depth", 1024, this.scene, true, true);
        this.scene.customRenderTargets.push(rt2);
        rt2.activeCamera = this.miniMapCamera;
        rt2.renderList = this.scene.meshes;

        var miniMap = BABYLON.Mesh.CreatePlane("plane", 5, this.scene);
        miniMap.position = new BABYLON.Vector3(canvas.width/110, canvas.height/130, 25);
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

        // miniMap.enableEdgesRendering();
        // miniMap.edgesWidth = 5.0;
        // miniMap.edgesColor = new BABYLON.Color4(1, 1, 1, 1);

        return this;
    }

}
