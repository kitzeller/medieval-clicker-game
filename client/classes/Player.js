import * as BABYLON from 'babylonjs';
import * as GUI from "babylonjs-gui";
import 'babylonjs-loaders';
import {Inventory} from "./Inventory";
import {ResourceMesh} from "./ResourceMesh";

export default class Player {
    constructor(scene, socket, at, name, main) {
        var self = this;
        this.scene = scene;
        this.socket = socket;
        this.id = socket.id;
        this.name = name;

        console.log("name: " + this.name);

        this.me = !!main;
        this.isMoving = false;
        this.isRunning = false;

        this.health = 20;
        this.energy = 20;

        this.inventory = new Inventory();

        this.advancedTexture = at;
        this.meshToDestroy = null;
        this.meshToDestroySlider = null;

        this.speed = 1.5;


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

        if (this.me) {
            this.scene.activeCamera.lockedTarget = this.player;

            // TODO: Replace this with something else?
            this.scene.activeCamera.targetScreenOffset.y = -10;
        }

        if (position) this.player.position = new BABYLON.Vector3(position.x, position.y, position.z);


        // START NAME TAG
        var writingPlane = BABYLON.MeshBuilder.CreatePlane("plane", {width: 100, height: 20, subdivisions: 25}, this.scene);
        writingPlane.position.y = 380;
        writingPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        writingPlane.convertToFlatShadedMesh();

        //Create dynamic texture
        var writingTexture = new BABYLON.DynamicTexture("dynamic texture", {width: 512, height: 128}, this.scene);
        // var textureContext = textureGround.getContext();

        var writingMaterial = new BABYLON.StandardMaterial("Mat", this.scene);
        writingMaterial.diffuseTexture = writingTexture;
        writingMaterial.diffuseTexture.hasAlpha = true;
        writingMaterial.emissiveColor = new BABYLON.Color3(1,1,1);
        writingMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        writingPlane.material = writingMaterial;

        //Add text to dynamic texture
        var font = "bold 50px monospace";
        writingTexture.drawText(this.name, 0, 100, font, "yellow", "transparent", true, true);
        writingPlane.parent = this.player;
        // END NAME TAG


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

        // Authorize with server
        if (this.socket && this.me) {
            this.socket.emit('player movement', {
                id: this.socket.id,
                position: point
            });
        }

        this.player.destination = new BABYLON.Vector3(point.x, 0, point.z);
        this.lookAtPoint(this.player.destination);

        if (!this.isMoving) {
            if (!this.isRunning) {
                this.scene.beginAnimation(this.skeleton, this.walkRange.from, this.walkRange.to, true);
            } else {
                this.scene.beginAnimation(this.skeleton, this.runRange.from, this.runRange.to, true);
            }
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

    toggleRun() {
        // Authorize with server
        if (this.socket && this.me) {
            this.socket.emit('player run', {
                id: this.socket.id,
            });
        }

        if (this.isRunning) {
            this.isRunning = false;
            this.speed = 1.5;
            if (this.isMoving) this.scene.beginAnimation(this.skeleton, this.walkRange.from, this.walkRange.to, true);
        } else {
            this.isRunning = true;
            this.speed = 9;
            if (this.isMoving) this.scene.beginAnimation(this.skeleton, this.runRange.from, this.runRange.to, true);
        }

        return this.isRunning;
    }

    stopMoving() {
        // Authorize with server
        if (this.socket && this.me) {
            this.socket.emit('player stop moving', {
                id: this.socket.id,
            });
        }

        this.player.destination = null;
        if (this.idleRange) this.scene.beginAnimation(this.skeleton, this.idleRange.from, this.idleRange.to, true);
        this.isMoving = false;
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

    destroy() {
        // TODO: Refactor so that ResourceMesh contains all this information

        console.log(this.meshToDestroy);
        if (this.socket && this.me) {
            this.socket.emit('destroy mesh', {
                id: this.meshToDestroy.id,
            });
        }

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

    addDestroy(pickResult) {
        // Cancel any existing destroy process
        this.cancelDestroy();

        pickResult.pickedPoint.y = 0;
        console.log(BABYLON.Vector3.Distance(pickResult.pickedPoint, this.player.position));
        if (BABYLON.Vector3.Distance(pickResult.pickedPoint, this.player.position) < 20) {

            this.stopMoving();
            this.lookAtPoint(pickResult.pickedPoint);

            let slider = new GUI.Slider();
            this.advancedTexture.addControl(slider);
            slider.minimum = 0;
            slider.maximum = 100;
            slider.value = 0;
            slider.height = "20px";
            slider.width = "100px";
            slider.background = "red";
            slider.color = "green";
            slider.linkWithMesh(pickResult.pickedMesh);

            pickResult.pickedMesh.destroyParticles = ResourceMesh.createDestroyParticles(pickResult.pickedMesh);
            ResourceMesh.addOutline(pickResult.pickedMesh);

            this.meshToDestroy = pickResult.pickedMesh;
            this.meshToDestroySlider = slider;
        } else {

            // Subtract minimum distance and on arrival start destroying
            let A = pickResult.pickedPoint.clone();
            let B = A.clone();
            B.scaleInPlace(1 - (5 / A.length()));
            this.addDestination(B);
        }
    }

    handleRunEnergy() {
        // TODO: Authorize with server...
        // Drain Energy
        if (this.isRunning) this.energy -= 0.05;
        if (this.energy <= 1) {
            this.toggleRun();
            this.energy = 1.1;
        }

        // Increase energy
        if (this.energy < 20) {
            if (!this.isRunning) this.energy += 0.01;
        }
    }

    move() {

        // Player should never be tilted in x or z axis
        this.player.rotation.x = 0;
        this.player.rotation.z = 0;

        // isMoving
        if (this.player.destination) {

            this.handleRunEnergy();

            // Cancel
            this.cancelDestroy();

            var moveVector = this.player.destination.subtract(this.player.position);

            if (moveVector.length() > 1.1) {
                moveVector.y = -0.01;
                moveVector = moveVector.normalize();
                moveVector = moveVector.scale(1 - (1 / this.speed));

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
