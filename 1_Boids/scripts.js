/* eslint-disable max-len */
'use strict';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.116.1/build/three.module.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/examples/jsm/loaders/GLTFLoader.js';
import { Bird } from './bird.js';
import { Octree } from './Octree.js';


// Stats
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

// scene
let camera;
let scene;
let renderer;
const loader = new GLTFLoader();
const container = document.getElementById('canvas');
let clock;
let modelGltf;
let treeMesh;

let play = true;
const octreeSize = 10000;
const box = new THREE.Box3(
    new THREE.Vector3(-octreeSize, -octreeSize, -octreeSize),
    new THREE.Vector3(octreeSize, octreeSize, octreeSize)
);
const tree = new Octree(box, {
    maxDepth: 10,
    splitThreshold: 15,
    joinThreshold: 10
});

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
    herdSize: 200,
    animationSpeed: 5,
    displayArrow: false
};

const octreeParam = {
    displayOctree: false
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
            bird = new Bird(gltf.animations, BOUNDS, herdParam);
            bird.copy(gltf.scene);
            bird.init();
            tree.add(bird);
            herd.push(bird);
        }
    }, undefined, function (error) {
        console.error(error);
    });

    window.addEventListener('resize', function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    window.addEventListener('keypress', function (e) {
        if (e.keyCode == 32) {
            play = !play;
        }
    });

    scene.add(tree);

    if (octreeParam.displayOctree) {
        treeMesh = tree.generateGeometry();
        scene.add(treeMesh);
    }
    renderer.render(scene, camera);
    clock = new THREE.Clock();

    // test
    // const geometrys = new THREE.SphereGeometry(200, 10, 10);
    // const materials = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true});
    // var sphere = new THREE.Mesh(geometrys, materials);
    // scene.add(sphere);
}

function initGUI () {
    const gui = new GUI();
    const herdFolder = gui.addFolder('Herd');
    const octreeFolder = gui.addFolder('Octree');

    herdFolder.open();
    octreeFolder.open();

    herdFolder.add(herdParam, 'birdMaxSpeed', 0.01, 10).step(0.01).onChange(function (value) {
        for (const bird of herd) {
            bird.maxSpeed = Number(value);
        }
    });
    herdFolder.add(herdParam, 'animationSpeed', 0, 10).step(0.1).onChange(function (value) {
        for (const bird of herd) {
            bird.animationSpeed = Number(value);
        }
    });
    herdFolder.add(herdParam, 'herdSize', 1, 1024).step(1).onChange(function (value) {
        const diff = Number(value) - herd.length;
        for (let i = 0; i < Math.abs(diff); i++) {
            let bird;
            if (diff > 0) {
                bird = new Bird(modelGltf.animations, BOUNDS, herdParam);
                bird.copy(modelGltf.scene);
                bird.init();
                tree.add(bird);
                herd.push(bird);
            } else {
                bird = herd.shift();
                tree.remove(bird);
            }
        }
    });

    herdFolder.add(herdParam, 'displayArrow').onChange(function (value) {
        for (const bird of herd) {
            bird.toggleArrow();
        }
    });

    octreeFolder.add(octreeParam, 'displayOctree').onChange(function (value) {
        scene.remove(treeMesh);
    });
}

function animate () {
    stats.begin();
    if (play) {
        const delta = clock.getDelta();
        for (const bird of herd) {
            if (bird.parent instanceof Octree) {
                bird.update(delta, herd);
                tree.updateObject(bird);
            }
            // bird.model.visible = false;
        }
        tree.update();
        stats.end();
        if (octreeParam.displayOctree) {
            scene.remove(treeMesh);
            treeMesh = tree.generateGeometry();
            scene.add(treeMesh);
        }
        // // testing
        // const birdsInRadius = tree.getItemsInRadius(new THREE.Vector3(), 200);
        // for (const bird of birdsInRadius) {
        //     bird.model.visible = true;
        // }
    }
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};


(function () {
    init();
    initGUI();
    animate();
})();
