import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.116.1/build/three.module.js';
import { AnimationMixer } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/src/animation/AnimationMixer.js';

// eslint-disable-next-line no-unused-vars
class Bird extends THREE.Group {
    constructor (model, animation) {
        super();
        this.model = model;
        this.animation = animation;
        this.add(this.model);
        // Init animation
        this.mixer = new AnimationMixer(this.model);
        this.action = this.mixer.clipAction(this.animation[0]);
        this.action.play();
        // this.scale(0.2, 0.2, 0.2);
    }

    update (delta) {
        this.mixer.update(delta);
    }
}

export { Bird };
