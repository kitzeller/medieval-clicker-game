import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

export default class Player {
    constructor(scene, socket, main) {
        var self = this;
        this.scene = scene;
        this.socket = socket;
        this.me = !!main;
        this.isMoving = false;

        return this;
    }

    async initCharModel(position){
        let importedModel = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/meshes/", "dummy3.babylon", this.scene);
        console.log(importedModel);

        this.skeleton = importedModel.skeletons[0];
        this.player = importedModel.meshes[0];
        this.player.scaling = new BABYLON.Vector3(5, 5, 5);

        // Collisions!
        this.player.checkCollisions = true;
        this.player.ellipsoid = new BABYLON.Vector3(0.5, 1.0, 0.5);
        this.player.ellipsoidOffset = new BABYLON.Vector3(0, 1.0, 0);

        if (this.me) this.scene.activeCamera.lockedTarget = this.player;
        if (position) this.player.position = new BABYLON.Vector3(position.x, position.y, position.z);

        // ROBOT
        this.skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
        this.skeleton.animationPropertiesOverride.enableBlending = true;
        this.skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
        this.skeleton.animationPropertiesOverride.loopMode = 1;

        this.idleRange = this.skeleton.getAnimationRange("YBot_Idle");
        this.walkRange = this.skeleton.getAnimationRange("YBot_Walk");
        this.runRange = this.skeleton.getAnimationRange("YBot_Run");

        // IDLE
        if (this.idleRange) this.scene.beginAnimation(this.skeleton, this.idleRange.from, this.idleRange.to, true);

        // WEAPON TEST
        // https://sketchfab.com/3d-models/a-heros-blade-c31f2eeb93f345b1a5677a4426901d46
        let weapon = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/meshes/a_heros_blade/", "scene.gltf", this.scene);
        let weaponMesh = weapon.meshes[0];
        weaponMesh.scaling = new BABYLON.Vector3(0.00025, 0.00025, 0.00025);
        weaponMesh.attachToBone(this.skeleton.bones[38], this.player);

        return this.player;
    }

    addDestination(point){
        this.player.destination = new BABYLON.Vector3(point.x, point.y, point.z);


        if (!this.isMoving){
            this.scene.beginAnimation(this.skeleton, this.walkRange.from, this.walkRange.to, true);
        }

        this.player.lookAt(this.player.destination);
        this.player.rotation.x = 0;
        this.player.rotation.z = 0;

    }

    move(){
        if (this.player.destination) {
            var moveVector = this.player.destination.subtract(this.player.position);

            if (moveVector.length() > 1.1) {
                moveVector.y = -0.01;
                moveVector = moveVector.normalize();
                moveVector = moveVector.scale(0.2);

                // if(meshFound.distance > 1.1){
                //     moveVector.y = GRAVITY;
                // }

                this.player.moveWithCollisions(moveVector);
                this.isMoving = true;
            } else {
                // Arrived
                this.isMoving = false;
                if (this.idleRange) this.scene.beginAnimation(this.skeleton, this.idleRange.from, this.idleRange.to, true);
                this.player.destination = null;
            }
        }
    }
}
