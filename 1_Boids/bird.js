import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.116.1/build/three.module.js';
import { AnimationMixer } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/src/animation/AnimationMixer.js';

const maxForce = 0.05;
const center = new THREE.Vector3();

// eslint-disable-next-line no-unused-vars
class Bird extends THREE.Group {
    constructor (animation, BOUNDS, herdParam) {
        super();
        this.bounds = BOUNDS;
        this.maxSpeed = herdParam.birdMaxSpeed;
        this.animationSpeed = herdParam.animationSpeed;
        this.displayArrow = herdParam.displayArrow;
        this.animation = animation;
    }

    init () {
        this.perceptionRadius = 50;
        this.position.random().multiplyScalar(this.bounds).subScalar(this.bounds / 2);
        this.velocity = new THREE.Vector3().random();
        this.velocity.setLength(Math.random() * (this.maxSpeed + 1));
        this.acceleration = new THREE.Vector3();

        // Init animation
        this.mixer = new AnimationMixer(this);
        this.action = this.mixer.clipAction(this.animation[0]);

        // speeding up animation
        this.action.timeScale = this.animationSpeed;

        // Make the birds flap async
        const clipDuration = this.animation[0].duration;
        this.action.time = Math.random() * clipDuration;

        // Play
        this.action.play();

        if (this.displayArrow) {
            const dir = this.velocity.clone().normalize();
            this.arrowHelper = new THREE.ArrowHelper(dir, new THREE.Vector3(), 10, 0xffff00);
            this.add(this.arrowHelper);
        }
    }

    toggleArrow () {
        if (!this.displayArrow) {
            const dir = this.velocity.clone().normalize();
            this.arrowHelper = new THREE.ArrowHelper(dir, new THREE.Vector3(), 10, 0xffff00);
            this.add(this.arrowHelper);
            this.displayArrow = true;
        } else {
            this.remove(this.arrowHelper);
            this.displayArrow = false;
        }
    }

    clampForce (vect) {
        vect.clampLength(-maxForce, maxForce);
    }

    centerRule () {
        const dir = new THREE.Vector3();
        dir.subVectors(center, this.position);
        this.clampForce(dir);
        return dir;
    }

    alignRule (herd) {
        const steering = new THREE.Vector3();
        for (const other of herd) {
            steering.add(other.velocity);
        }
        if (herd.length > 0) {
            steering.divideScalar(herd.length);
            steering.setLength(this.maxSpeed);
            steering.sub(this.velocity);
            this.clampForce(steering);
        }
        return steering;
    }

    flock (herd) {
        // Reset acceleration to 0
        this.acceleration.set(0, 0, 0);

        // Applie Center_Rule
        const centerForce = this.centerRule();
        this.acceleration.add(centerForce);

        // Applie AlignRule
        const alignForce = this.alignRule(herd);
        this.acceleration.add(alignForce);
    }

    update (delta, herd) {
        // Update Bird
        this.flock(herd);

        // Update position, speed, accelaration
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.clampLength(-this.maxSpeed, this.maxSpeed);

        // Update lookAt
        const dir = this.velocity.clone();
        dir.normalize();

        const point = this.position.clone().add(dir);
        this.lookAt(point);

        if (this.displayArrow && typeof this.arrowHelper != 'undefined') {
            const quaternion = new THREE.Quaternion();
            this.getWorldQuaternion(quaternion);
            this.arrowHelper.setDirection(dir.clone().applyQuaternion(quaternion.inverse()));
        }

        // Update animation speed
        this.action.timeScale = this.animationSpeed * this.velocity.length();
        this.mixer.update(delta);
    }
}

export { Bird };
