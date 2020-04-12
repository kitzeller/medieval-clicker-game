import * as BABYLON from "babylonjs";

export class ResourceMesh {

    constructor(mesh) {
        this.mesh = mesh;
    }

    onDestroy(){
        //...
    }

    static addOutline(mesh){
        // Outline
        mesh.outlineColor = new BABYLON.Color3(0.3, 0, 0);
        mesh.outlineWidth = 1;
        mesh.renderOutline = true;
    }

    static removeOutline(mesh){
        // Outline
        mesh.renderOutline = false;
    }

    static createDestroyParticles(mesh) {
        // Create a particle system
        let destroyParticles = new BABYLON.ParticleSystem("particles", 2000, mesh.getScene());

        //Texture of each particle
        destroyParticles.particleTexture = new BABYLON.Texture("assets/textures/flare.png", mesh.getScene());

        // Where the particles come from
        destroyParticles.emitter = mesh;

        // Colors of all particles
        destroyParticles.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
        destroyParticles.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
        destroyParticles.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

        // Size of each particle (random between...
        destroyParticles.minSize = 0.1;
        destroyParticles.maxSize = 1;

        // Life time of each particle (random between...
        destroyParticles.minLifeTime = 0.3;
        destroyParticles.maxLifeTime = 1.5;

        // Emission rate
        destroyParticles.emitRate = 2000;

        /******* Emission Space ********/
        destroyParticles.createSphereEmitter(mesh._boundingInfo.boundingSphere.radius);

        // Speed
        destroyParticles.minEmitPower = 2;
        destroyParticles.maxEmitPower = 4;
        destroyParticles.updateSpeed = 0.005;
        destroyParticles.start();

        return destroyParticles;

    };
}
