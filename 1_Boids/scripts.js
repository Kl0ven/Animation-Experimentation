/* eslint-disable max-len */
'use strict';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.116.1/build/three.module.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/examples/jsm/libs/dat.gui.module.js';
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
    joinThreshold: 7
});

// window
let windowX = window.innerWidth;
let windowY = window.innerHeight;

const BOUNDS = 1000;

// camera
const initCameraX = 0;
const initCameraY = 0;
const initCameraZ = 500;
const lookAtCenter = new THREE.Vector3(0, 0, 0);

const herd = [];

const herdParam = {
    herdSize: 600,
    rulesRadius: 30
};

const octreeParam = {
    displayOctree: false,
    useSearchMethode: false
};

const birdParam = {
    birdMaxSpeed: 10,
    animationSpeed: 3,
    displayArrow: false,
    centerRuleCoef: 0.9,
    alingRuleCoef: 1,
    cohesionRuleCoef: 1.4,
    separationRuleCoef: 1.4
};

const predatorParam = {
    position: new THREE.Vector3(10000, 10000, 0),
    radius: 200,
    ruleCoef: 1
};

// initialize canvas
function init () {
    windowX = window.innerWidth;
    windowY = window.innerHeight;
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(windowX, windowY);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x282828);
    camera = new THREE.PerspectiveCamera(75, windowX / windowY, 2, 5000);

    camera.position.x = initCameraX;
    camera.position.y = initCameraY;
    camera.position.z = initCameraZ;
    camera.lookAt(lookAtCenter);

    scene.add(camera);

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
            bird = new Bird(gltf.animations, BOUNDS, birdParam);
            bird.copy(gltf.scene);
            bird.init();
            tree.add(bird);
            herd.push(bird);
        }
        animate();
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

    window.addEventListener('mousemove', function (e) {
        predatorParam.position.x = e.clientX - window.innerWidth/2;
        predatorParam.position.y = -(e.clientY - window.innerHeight/2);
    }, false);
    scene.add(tree);

    if (octreeParam.displayOctree) {
        treeMesh = tree.generateGeometry();
        scene.add(treeMesh);
    }
    renderer.render(scene, camera);
    clock = new THREE.Clock();
}

function initGUI () {
    const gui = new GUI();
    const herdFolder = gui.addFolder('Herd');
    const octreeFolder = gui.addFolder('Octree');
    const birdFolder = gui.addFolder('Bird');
    herdFolder.open();
    octreeFolder.open();
    birdFolder.open();

    birdFolder.add(birdParam, 'birdMaxSpeed', 0.01, 15).step(0.01).onChange(function (value) {
        for (const bird of herd) {
            bird.maxSpeed = Number(value);
        }
    });
    birdFolder.add(birdParam, 'animationSpeed', 0, 10).step(0.1).onChange(function (value) {
        for (const bird of herd) {
            bird.animationSpeed = Number(value);
        }
    });
    birdFolder.add(birdParam, 'displayArrow').onChange(function (value) {
        for (const bird of herd) {
            bird.toggleArrow();
        }
    });
    birdFolder.add(birdParam, 'centerRuleCoef', 0, 2).step(0.1).onChange(function (value) {
        for (const bird of herd) {
            bird.setCenterRuleCoef(Number(value));
        }
    });
    birdFolder.add(birdParam, 'alingRuleCoef', 0, 2).step(0.1).onChange(function (value) {
        for (const bird of herd) {
            bird.setAlingRuleCoef(Number(value));
        }
    });
    birdFolder.add(birdParam, 'cohesionRuleCoef', 0, 2).step(0.1).onChange(function (value) {
        for (const bird of herd) {
            bird.setCohesionRuleCoef(Number(value));
        }
    });
    birdFolder.add(birdParam, 'separationRuleCoef', 0, 2).step(0.1).onChange(function (value) {
        for (const bird of herd) {
            bird.setSeparationRule(Number(value));
        }
    });
    birdFolder.add(predatorParam, 'ruleCoef', 0, 5).step(0.1).listen();

    herdFolder.add(herdParam, 'herdSize', 1, 1000).step(1).onChange(function (value) {
        const diff = Number(value) - herd.length;
        for (let i = 0; i < Math.abs(diff); i++) {
            let bird;
            if (diff > 0) {
                bird = new Bird(modelGltf.animations, BOUNDS, birdParam);
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

    herdFolder.add(herdParam, 'rulesRadius', 1, 300).listen();

    octreeFolder.add(octreeParam, 'useSearchMethode').listen();

    octreeFolder.add(octreeParam, 'displayOctree').onChange(function (value) {
        scene.remove(treeMesh);
    });
}

function animate () {
    stats.update();

    requestAnimationFrame(animate);
    render();
};

function render () {
    if (play) {
        const delta = clock.getDelta();
        let birdsInRadius;
        for (const bird of herd) {
            if (octreeParam.useSearchMethode) {
                birdsInRadius = tree.getItemsInRadius(bird.position, herdParam.rulesRadius);
            } else {
                birdsInRadius = bird.parent.children;
            }
            bird.update(delta, birdsInRadius, predatorParam);
            tree.updateObject(bird);
        }
        tree.update();
        if (octreeParam.displayOctree) {
            scene.remove(treeMesh);
            treeMesh = tree.generateGeometry();
            scene.add(treeMesh);
        }
        predatorParam.position.x = 10000;
        predatorParam.position.y = 10000;
        renderer.render(scene, camera);
    }
}

(function () {
    init();
    initGUI();
    // animate();
})();
