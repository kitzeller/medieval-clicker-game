import FoxController from "./FoxController";

export default class FoxGenerator {
    constructor(scene, at) {
        this.foxNumber = 10;
        this._fox = [];
        this.scene = scene;
        this.advancedTexture = at;
        this.generate();
    }

    generate() {
        this.clean();

        var randomNumber = function (min, max) {
            if (min == max) {
                return (min);
            }
            var random = Math.random();
            return ((random * (max - min)) + min);
        };

        for (var i = 0; i < this.foxNumber; i++) {
            let _this = this;

            BABYLON.SceneLoader.ImportMesh("", "assets/meshes/fox/", "scene.gltf", this.scene,  (newMeshes, particleSystems, skeleton, animationGroups) => {
                newMeshes[0].scaling.scaleInPlace(0.1);
                let x = randomNumber(-400, 400);
                let z = randomNumber(-400, 400);

                newMeshes[0].position.x = x;
                newMeshes[0].position.z = z;
                newMeshes[0].position.y = 0;
                newMeshes[0].rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.WORLD);
                newMeshes[0].checkCollisions = true;
                newMeshes[0].ellipsoid = new BABYLON.Vector3(1.0, 1.0, 1.0);
                newMeshes[0].type = "fox";

                // newMeshes[1].parent = newMeshes[0];
                newMeshes[1].type = "fox";
                newMeshes[0].isPickable = true;
                newMeshes[1].isPickable = true;

                newMeshes[0].healthBar = this.HUD(newMeshes[0]);


                var foxController = new FoxController(newMeshes[0], animationGroups[0]);
                foxController.speed = 1;
                foxController.animationSpeedMultiplier = 1;
                foxController.addAnimation('idle', 0, 7.12);
                foxController.addAnimation('walk', 7.13, 10.5);
                foxController.addAnimation('run', 11.79, 15.5);
                foxController.playAnimation('idle');

                this._fox.push(newMeshes[0]);

            });
        }
    };

    clean() {
        this._fox.forEach(function (t) {
            t.dispose();
        });
        this._fox = [];
    };

    HUD(mesh){
        var healthBar = new BABYLON.GUI.Rectangle();
        healthBar.width = "30px";
        healthBar.height = "10px";
        healthBar.cornerRadius = 20;
        healthBar.color = "white";
        healthBar.thickness = 1;
        healthBar.background = "red";
        this.advancedTexture.addControl(healthBar);

        healthBar.linkWithMesh(mesh);
        healthBar.linkOffsetY = -50;

        return healthBar;
    }

}
