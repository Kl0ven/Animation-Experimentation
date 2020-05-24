import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.116.1/build/three.module.js';
import { AnimationMixer } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/src/animation/AnimationMixer.js';

const maxForce = 0.05;
const center = new THREE.Vector3();

// eslint-disable-next-line no-unused-vars
class Bird {
    constructor (model, animation, BOUNDS, herdParam) {
        this.model = model;
        this.bounds = BOUNDS;
        this.maxSpeed = herdParam.birdMaxSpeed;
        this.animationSpeed = herdParam.animationSpeed;
        this.perceptionRadius = 50;
        this.model.position.random().multiplyScalar(BOUNDS).subScalar(BOUNDS/2);
        this.velocity = new THREE.Vector3().random();
        this.velocity.setLength(Math.random() * (this.maxSpeed+1));
        this.acceleration = new THREE.Vector3();

        // Init animation
        this.animation = animation;
        this.mixer = new AnimationMixer(this.model);
        this.action = this.mixer.clipAction(this.animation[0]);

        // speeding up animation
        this.action.timeScale = this.animationSpeed;

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

    alignRule (herd) {
        const steering = new THREE.Vector3();
        let total = 0;
        let d;
        for (const other of herd) {
            d = this.model.position.distanceTo(other.model.position);

            if (d < this.perceptionRadius) {
                steering.add(other.velocity);
                total++;
            }
        }
        if (total > 0) {
            steering.divideScalar(total);
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
        this.model.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.clampLength(-this.maxSpeed, this.maxSpeed);

        // Update lookAt
        const dir = this.velocity.clone();
        dir.normalize();
        this.model.lookAt(dir);

        // Update animation speed
        this.action.timeScale = this.animationSpeed * this.velocity.length();
        this.mixer.update(delta);
    }
}

export { Bird };
