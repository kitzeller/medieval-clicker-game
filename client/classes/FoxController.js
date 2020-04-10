export default class FoxController {

    constructor(minion, animation) {
        // The array of animations (if the model has no skeleton)
        this._animations = {};
        // The direction this character is heading to
        this._direction = new BABYLON.Vector3(0, 0, 0);
        // The destination this character is heading to
        this._destination = null;
        // The last distance computed between the minion position and its destination
        this._lastDistance = Number.POSITIVE_INFINITY;
        // A set of destination. The character will navigate through all these positions.
        this.destinations = [];
        // The character speed
        this.speed = 1;
        // All animations speeds will be multiplied by this factor
        this.animationSpeedMultiplier = 1;
        // True if the character is moving, false otherwise
        this.isMoving = false;
        this._minion = minion;
        this._animation = animation;

        this.scene = this._minion.getScene();

        // Add move function to the character
        this._minion.getScene().registerBeforeRender(() => {
            this._move();
        });

        let intervalTime = this.randomNumber(10000, 50000);

        setInterval(() => {
            let x = this.randomNumber(-200, 200);
            let z = this.randomNumber(-200, 200);
            let y = 0;

            this.addDestination(new BABYLON.Vector3(x, y, z));
            this.start();
        }, intervalTime);

    }

    randomNumber(min, max) {
        if (min == max) {
            return (min);
        }
        var random = Math.random();
        return ((random * (max - min)) + min);
    };

    /**
     * Add a destination to this character.
     * data is a parameter that can be link to a destination. It will be called
     * when the minion arrives at this destination.
     */
    addDestination(value, data) {
        // Add this destination to the set of destination
        this.destinations.push({position: value, data: data});
        // Return this to chain destination if needed
        return this;
    };

    /**
     * Move to the next character destination
     */
    _moveToNextDestination() {
        // Get the next destination
        this._destination = this.destinations.shift();
        // reset distance check
        this._lastDistance = Number.POSITIVE_INFINITY;
        this.isMoving = true;
        // Compute direction
        this._direction = this._destination.position.subtract(this._minion.position);
        this._direction.normalize();
        // Rotate
        this.lookAt(this._destination.position);
    };

    /**
     * Run the animation between the character position and its first destination
     */
    lookAt(value) {
        this._minion.lookAt(value);
        this._minion.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.WORLD);

    };

    /**
     * Run the animation between the character position and its first destination
     */
    start() {
        // If at least one destination
        if (this.destinations.length >= 1) {
            // Animate the character
            this.playAnimation('walk');
            // Move to the next destination
            this._moveToNextDestination();
        }
    };

    /**
     * Removes all destination of the minion
     */
    stop() {
        this.destinations = [];
        this.pause();
    };

    /**
     * Pause the character movement
     */
    pause() {
        this.isMoving = false;
        // Animate the character in idle animation
        this.playAnimation('idle');
    };

    /**
     * Resume the character movement
     */
    resume() {
        this.isMoving = true;
        // Animate the character
        this.playAnimation('walk');
    };

    /**
     * Move the character to its destination.
     * The character y position is set according to the ground position (or 0 if no ground).
     * The attribute _canMove is reset to false when the destination is reached.
     */
    _move() {
        // If a destination has been set and the character has not been stopped
        if (this.isMoving && this._destination) {
            // Compute distance to destination
            var distance = BABYLON.Vector3.Distance(this._minion.position, this._destination.position);
            // Change destination if th distance is increasing (should not)
            if (distance < 0.1 || distance > this._lastDistance) {
                // Set the minion position to the curent destination
                this._minion.position.copyFrom(this._destination.position);
                if (this.atEachDestination) {
                    this.atEachDestination(this._destination.data);
                }
                // Destination has been reached
                this.isMoving = false;
                if (this.destinations.length == 0) {
                    // Animate the character in idle animation
                    this.playAnimation('idle');
                    // Call function when final destination is reached
                    if (this.atFinalDestination) {
                        this.atFinalDestination(this._destination.data);
                    }
                } else {
                    this._moveToNextDestination();
                }
            } else {
                this._lastDistance = distance;
                // Add direction to the position
                var delta = this._direction.scale(this._minion.getScene().getAnimationRatio() * this.speed);
                //this._minion.moveWithCollisions(delta);

                // Without collisions
                this._minion.position.addInPlace(delta);
            }
        }
    };

    /**
     * Add an animation to this character
     */
    addAnimation(name, from, to) {
        this._animations[name] = {from: from, to: to};
    };

    /**
     * Play the given animation
     */
    playAnimation(name) {
        this._animation.stop();
        this.scene.stopAnimation(this._minion);
        if (this._animations.hasOwnProperty(name)) {
            this._animation.start(true, this.animationSpeedMultiplier, this._animations[name].from, this._animations[name].to);
        }
    };

}
