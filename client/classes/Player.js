import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import {Inventory} from "./Inventory";

export default class Player {
    constructor(scene, socket, main) {
        var self = this;
        this.scene = scene;
        this.socket = socket;
        this.me = !!main;
        this.isMoving = false;
        this.inventory = new Inventory();

        this.meshToDestroy = null;
        this.meshToDestroySlider = null;


        return this;
    }

    async initCharModel(position) {
        let importedModel = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/meshes/", "DummyColor.babylon", this.scene);

        this.skeleton = importedModel.skeletons[0];
        this.player = new BABYLON.Mesh("player", this.scene);
        importedModel.meshes[0].parent = this.player;
        importedModel.meshes[1].parent = this.player;

        this.player.scaling = new BABYLON.Vector3(0.04, 0.04, 0.04);

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

        this.idleRange = this.skeleton.getAnimationRange("Idle");
        this.walkRange = this.skeleton.getAnimationRange("FemaleWalk");
        this.runRange = this.skeleton.getAnimationRange("Run");
        this.punchRange = this.skeleton.getAnimationRange("Punch");
        this.jumpRange = this.skeleton.getAnimationRange("Jump");
        this.swordRange = this.skeleton.getAnimationRange("Sword");

        // IDLE
        if (this.idleRange) this.scene.beginAnimation(this.skeleton, this.idleRange.from, this.idleRange.to, true);

        // WEAPON TEST
        // https://sketchfab.com/3d-models/a-heros-blade-c31f2eeb93f345b1a5677a4426901d46
        let weapon = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/meshes/a_heros_blade/", "scene.gltf", this.scene);
        let weaponMesh = weapon.meshes[0];
        weaponMesh.rotate(new BABYLON.Vector3(1, 0, 1), Math.PI, BABYLON.Space.WORLD);
        weaponMesh.scaling = new BABYLON.Vector3(0.04, 0.04, 0.04);
        weaponMesh.attachToBone(this.skeleton.bones[38], this.player);

        return this.player;
    }

    addDestination(point) {
        this.player.destination = new BABYLON.Vector3(point.x, 0, point.z);
        this.lookAtPoint(this.player.destination);

        if (!this.isMoving) {
            this.scene.beginAnimation(this.skeleton, this.walkRange.from, this.walkRange.to, true);
        }

    }

    lookAtPoint(destination) {
        destination.y = 0;
        this.player.lookAt(destination);
        // Mesh rotation is sligtly off.. need to rotate 180
        this.player.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI, BABYLON.Space.WORLD);
        this.player.rotation.x = 0;
        this.player.rotation.z = 0;
    }

    punch() {
        // TODO: Idle after done.. animation weights...
        this.scene.beginAnimation(this.skeleton, this.punchRange.from, this.punchRange.to, false);
    }

    jump() {
        // TODO: Idle after done.. animation weights...
        this.scene.beginAnimation(this.skeleton, this.jumpRange.from, this.jumpRange.to, false);
    }

    attack() {
        // Check distance, lookAt, stop running
        // Get target
        this.scene.beginAnimation(this.skeleton, this.swordRange.from, this.swordRange.to, false);
    }

    checkMeshToDestroy() {
        if (this.meshToDestroy) {
            this.meshToDestroySlider.value += 0.5;
            if (this.meshToDestroySlider.value < 100) {
                return;
            }

            // value > 100
            // check value and increment inventory
            console.log(this.meshToDestroy);
            this.inventory.addItem(this.meshToDestroy.metadata.type)
            console.log(this.inventory);

            // destroy
            this.destroy();
        }

    }

    destroy(){
        // TODO: Refactor so that ResourceMesh contains all this information
        if (this.meshToDestroy) {
            if (this.meshToDestroy.destroyParticles) this.meshToDestroy.destroyParticles.stop();
            this.meshToDestroy.dispose();
        }
        this.meshToDestroy = null;

        if (this.meshToDestroySlider) this.meshToDestroySlider.dispose();
        this.meshToDestroySlider = null;
    }

    cancelDestroy() {
        if (this.meshToDestroy) {
            if (this.meshToDestroy.destroyParticles) this.meshToDestroy.destroyParticles.stop();
        }

        this.meshToDestroy = null;

        if (this.meshToDestroySlider) this.meshToDestroySlider.dispose();
        this.meshToDestroySlider = null;
    }

    move() {

        // Player should never be tilted in x or z axis
        this.player.rotation.x = 0;
        this.player.rotation.z = 0;

        if (this.player.destination) {
            // Cancel
            this.cancelDestroy();

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
