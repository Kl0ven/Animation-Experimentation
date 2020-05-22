/* eslint-disable max-len */
'use strict';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.116.1/build/three.module.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/examples/jsm/loaders/GLTFLoader.js';
import { Bird } from './bird.js';
// scene
let camera;
let scene;
let renderer;
const loader = new GLTFLoader();
const container = document.getElementById('canvas');
let clock;
let modelGltf;
// window
let windowX = window.innerWidth;
let windowY = window.innerHeight;

const BOUNDS = 200;

// camera
const initCameraX = 0;
const initCameraY = 0;
const initCameraZ = BOUNDS * 2;
const lookAtCenter = new THREE.Vector3(0, 0, 0);

const herd = [];

const herdParam = {
    birdMaxSpeed: 3,
    herdSize: 200
};

// initialize canvas
function init () {
    windowX = window.innerWidth;
    windowY = window.innerHeight;
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(windowX, windowY);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x282828);
    camera = new THREE.PerspectiveCamera(20, windowX / windowY, 2, 3000);

    camera.position.x = initCameraX;
    camera.position.y = initCameraY;
    camera.position.z = initCameraZ;
    camera.lookAt(lookAtCenter);

    scene.add(camera);

    new OrbitControls(camera, renderer.domElement);

    container.appendChild(renderer.domElement);

    // Light
    const HemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
    scene.add(HemiLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(200, 200, 0);
    scene.add(directionalLight);

    loader.load('./boids.glb', function (gltf) {
        let bird;
        modelGltf = gltf;
        for (let i = 0; i < herdParam.herdSize; i++) {
            bird = new Bird(gltf.scene.clone(), gltf.animations, BOUNDS, herdParam);
            herd.push(bird);
            scene.add(bird);
        }
    }, undefined, function (error) {
        console.error(error);
    });

    window.addEventListener('resize', function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    renderer.render(scene, camera);
    clock = new THREE.Clock();
}

function initGUI () {
    const gui = new GUI();
    const herdFolder = gui.addFolder('Herd');

    herdFolder.open();

    herdFolder.add(herdParam, 'birdMaxSpeed', 0.01, 6).step(0.01).onChange(function (value) {
        for (const bird of herd) {
            bird.maxSpeed = Number(value);
        }
    });
    herdFolder.add(herdParam, 'herdSize', 1, 1000).step(1).onChange(function (value) {
        const diff = Number(value) - herd.length;
        for (let i = 0; i < Math.abs(diff); i++) {
            let bird;
            if (diff > 0) {
                bird = new Bird(modelGltf.scene.clone(), modelGltf.animations, BOUNDS, herdParam);
                herd.push(bird);
                scene.add(bird);
            } else {
                bird = herd.shift();
                scene.remove(bird);
            }
        }
    });
}

function animate () {
    const delta = clock.getDelta();
    for (const bird of herd) {
        bird.update(delta, scene);
    }
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};


(function () {
    init();
    initGUI();
    animate();
})();
