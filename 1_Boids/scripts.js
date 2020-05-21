/* eslint-disable max-len */
'use strict';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.116.1/build/three.module.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/examples/jsm/controls/OrbitControls.js';
import { BirdGeometry } from './bird.js';

// scene
let camera;
let scene;
let renderer;

const container = document.getElementById('canvas');

// window
let windowX = window.innerWidth;
let windowY = window.innerHeight;


// camera
const initCameraX = 0;
const initCameraY = 20;
const initCameraZ = 100;
const lookAtCenter = new THREE.Vector3(0, 0, 0);


// initialize canvas
function init () {
    windowX = window.innerWidth;
    windowY = window.innerHeight;
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(windowX, windowY);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x282828);
    camera = new THREE.PerspectiveCamera(20, windowX / windowY, 50, 500);

    camera.position.x = initCameraX;
    camera.position.y = initCameraY;
    camera.position.z = initCameraZ;
    camera.lookAt(lookAtCenter);

    scene.add(camera);

    const controls = new OrbitControls(camera, renderer.domElement);

    container.appendChild(renderer.domElement);
    // scene.fog = new THREE.FogExp2(0x000000, 0.0004);


    const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    scene.add(light);

    const geometry = new BirdGeometry();


    // THREE.ShaderMaterial
    const material = new THREE.MeshPhongMaterial({
        color: 0x67ff67,
        side: THREE.DoubleSide
    });

    const birdMesh = new THREE.Mesh(geometry, material);
    birdMesh.rotation.y = Math.PI / 2;
    birdMesh.matrixAutoUpdate = false;
    birdMesh.updateMatrix();

    scene.add(birdMesh);

    renderer.render(scene, camera);
}

function initGUI () {
    // const gui = new GUI();
}

function animate () {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};


(function () {
    init();
    initGUI();
    animate();
})();
