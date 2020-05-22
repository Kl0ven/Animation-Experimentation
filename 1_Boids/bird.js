import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.116.1/build/three.module.js';
import { AnimationMixer } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/src/animation/AnimationMixer.js';

const maxForce = 0.05;
const center = new THREE.Vector3();

// eslint-disable-next-line no-unused-vars
class Bird extends THREE.Group {
    constructor (model, animation, BOUNDS, herdParam) {
        super();
        this.model = model;
        this.bounds = BOUNDS;
        this.maxSpeed = herdParam.birdMaxSpeed;
        this.model.position.random().multiplyScalar(BOUNDS).subScalar(BOUNDS/2);
        this.velocity = new THREE.Vector3().random();
        this.velocity.setLength(Math.random() * (this.maxSpeed+1));
        this.acceleration = new THREE.Vector3();

        // adding model to this (Group)
        this.add(this.model);

        // Init animation
        this.animation = animation;
        this.mixer = new AnimationMixer(this.model);
        this.action = this.mixer.clipAction(this.animation[0]);

        // speeding up animation
        this.action.timeScale = 5;

        // Make the birds flap async
        const clipDuration = this.animation[0].duration;
        this.action.time = Math.random() * clipDuration;

        // Play
        this.action.play();
    }

    clampForce (vect) {
        vect.clampLength(-maxForce, maxForce);
    }

    centerRule () {
        const dir = new THREE.Vector3();
        dir.subVectors(center, this.model.position);
        this.clampForce(dir);
        return dir;
    }

    flock () {
        this.acceleration.set(0, 0, 0);
        const centerForce = this.centerRule();
        this.acceleration.add(centerForce);
    }

    update (delta) {
        this.mixer.update(delta);
        this.flock();
        this.model.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.clampLength(-this.maxSpeed, this.maxSpeed);
        // lookAt
        const dir = this.velocity.clone();
        dir.normalize();
        this.lookAt(dir);
    }
}

export { Bird };
