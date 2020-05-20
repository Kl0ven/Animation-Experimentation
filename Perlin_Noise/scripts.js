/* eslint-disable max-len */
'use strict';

import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/examples/jsm/postprocessing/UnrealBloomPass.js';


import { GUI } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/examples/jsm/libs/dat.gui.module.js';
const bloomParam = {
    exposure: 2,
    bloomStrength: 0.42,
    bloomThreshold: 0.5,
    bloomRadius: 1
};

// scene
let camera;
let scene;
let renderer;
let geom;
let wireframe;
let composer;
let renderPass;
let bloomPass;

const container = document.getElementById('canvas');

// window
let windowX = window.innerWidth;
let windowY = window.innerHeight;


const sizeX = 3000;
const sizeY = 3000;

// camera
const initCameraX = sizeX / 2;
const initCameraY = sizeY / 2 - 2500;
const initCameraZ = 1000;
const lookAtCenter = new THREE.Vector3(sizeX / 2, sizeY / 2, 400);

// shapes
const gridSize = 50;
const grid = [];

// calc grid values
const gridX = Math.ceil(sizeX / gridSize);
const gridY = Math.ceil(sizeY / gridSize);

let yoff = 0;
let xoff = 0;
let flying = 0;
const scale = 0.1;

const terrainParam = {
    amplitude: 50,
    speed: 0.05,
    isLine: true
};


const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;

// initialize canvas
function init () {
    windowX = window.innerWidth;
    windowY = window.innerHeight;
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(windowX, windowY);
    composer = new EffectComposer(renderer);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x282828);
    camera = new THREE.PerspectiveCamera(20, windowX / windowY, 4500, 30000);

    camera.position.x = initCameraX;
    camera.position.y = initCameraY;
    camera.position.z = initCameraZ;
    camera.lookAt(lookAtCenter);

    scene.add(camera);

    container.appendChild(renderer.domElement);
    // scene.fog = new THREE.FogExp2(0x000000, 0.0004);

    // shape rendering
    geom = new THREE.Geometry();

    noise.seed(Math.random());
    yoff = 0;
    for (let y = 0; y < gridY; y++) {
        xoff = 0;
        const line = [];
        for (let x = 0; x < gridX; x++) {
            const height = map(noise.simplex2(xoff, yoff), -1, 1, -50, 50);
            line.push(new THREE.Vector3(x * gridSize, y * gridSize, height));
            xoff += scale;
        }
        grid.push(line);
        yoff += scale;
    }

    for (let y = 0; y < gridY - 1; y++) {
        for (let x = 0; x < gridX - 1; x++) {
            geom.vertices.push(grid[y][x]);
            geom.vertices.push(grid[y][x + 1]);
            geom.vertices.push(grid[y + 1][x]);
            geom.vertices.push(grid[y + 1][x + 1]);
        }
    }

    const mat = new THREE.LineBasicMaterial({ color: 0x67ff67, linewidth: 1 });
    if (terrainParam.isLine) {
        wireframe = new THREE.LineSegments(geom, mat);
    } else {
        wireframe = new THREE.Line(geom, mat);
    }

    scene.add(wireframe);


    renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = bloomParam.bloomThreshold;
    bloomPass.strength = bloomParam.bloomStrength;
    bloomPass.radius = bloomParam.bloomRadius;
    renderer.toneMappingExposure = Math.pow(bloomParam.exposure, 4.0);
    composer.addPass(bloomPass);

    composer.render();
}

function initGUI () {
    const gui = new GUI();

    const bloom = gui.addFolder('Bloom');
    const terrain = gui.addFolder('Terrain');

    bloom.open();
    terrain.open();

    bloom.add(bloomParam, 'exposure', 0.1, 2).onChange(function (value) {
        renderer.toneMappingExposure = Math.pow(value, 4.0);
    });

    bloom.add(bloomParam, 'bloomThreshold', 0.0, 1.0).step(0.01).onChange(function (value) {
        bloomPass.threshold = Number(value);
    });

    bloom.add(bloomParam, 'bloomStrength', 0.0, 3.0).onChange(function (value) {
        bloomPass.strength = Number(value);
    });

    bloom.add(bloomParam, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function (value) {
        bloomPass.radius = Number(value);
    });

    terrain.add(terrainParam, 'amplitude', 0, 200).step(1).listen();
    terrain.add(terrainParam, 'speed', 0, 1).step(0.01).listen();


    terrain.add(terrainParam, 'isLine').listen().onChange(function (value) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        init();
    });
}

function animate () {
    flying += terrainParam.speed;
    yoff = flying;
    // console.log(flying)
    for (let y = 0; y < gridY; y++) {
        xoff = 0;
        for (let x = 0; x < gridX; x++) {
            const height = map(noise.simplex2(xoff, yoff), -1, 1, -terrainParam.amplitude, terrainParam.amplitude);
            grid[y][x].z = height;
            xoff += scale;
        }
        yoff += scale;
    }
    geom.verticesNeedUpdate = true;
    if (camera.near > 1) {
        camera.near -= 20;
        camera.updateProjectionMatrix();
    } else {
        camera.near = 1;
        camera.updateProjectionMatrix();
    }
    requestAnimationFrame(animate);
    // renderer.render(scene, camera);
    composer.render();
};


(function () {
    init();
    initGUI();
    animate();
})();
