import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.116.1/build/three.module.js';

const triangles = 3;
const points = triangles * 3;
const wingsSpan = 20;

const birdVertices =[
    [0, - 0, - 20, 0, 4, - 20, 0, 0, 30], // Body
    [0, 0, - 15, - wingsSpan, 0, 0, 0, 0, 15], // Left Wing
    [0, 0, 15, wingsSpan, 0, 0, 0, 0, - 15] // Right Wing
];

// eslint-disable-next-line no-unused-vars
class BirdGeometry extends THREE.BufferGeometry {
    constructor () {
        super();
        this.vertices = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
        this.birdColors = new THREE.BufferAttribute(new Float32Array(points * 3), 3);

        this.setAttribute('position', this.vertices);

        this.vertsPush();
        this.scale(0.2, 0.2, 0.2);
    }
    vertsPush () {
        let v = 0;
        for (let i = 0; i < birdVertices.length; i++) {
            for (let j = 0; j < birdVertices[i].length; j++) {
                this.vertices.array[v ++] = birdVertices[i][j];
            }
        }
    };
}

export { BirdGeometry };
