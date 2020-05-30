/* eslint-disable max-len */
'use strict';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.116.1/build/three.module.js';
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

const sizeX = 5000;
const sizeY = 3000;

// camera
const initCameraX = sizeX / 2;
const initCameraY = sizeY / 2 - 2500;
const initCameraZ = 1000;
const lookAtHeight = 400;
const lookAtCenter = new THREE.Vector3(sizeX / 2, sizeY / 2, lookAtHeight);
const lookAtPoint = lookAtCenter.clone();

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

const halfWidth = windowX / 2;
const halfHeight = windowX / 2;

const cameraParam = {
    maxOffsetX: 300,
    YMin: -300,
    YMax: 800
};

const terrainParam = {
    amplitude: 50,
    speed: 0.05,
    isLine: false
};
const valleyParam = {
    valleyEnd: 0.2,
    plateauStart: 0.40,
    valleyHeight: 1,
    plateauHeight: 350
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
    camera.velocity = new THREE.Vector3();
    camera.acceleration = new THREE.Vector3();

    scene.add(camera);
    // var controls = new OrbitControls(camera, renderer.domElement);
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
            if (terrainParam.isLine) {
                geom.vertices.push(grid[y][x]);
                geom.vertices.push(grid[y][x + 1]);
                geom.vertices.push(grid[y + 1][x]);
                geom.vertices.push(grid[y + 1][x + 1]);
            } else {
                geom.vertices.push(grid[y + 1][x]);
                geom.vertices.push(grid[y + 1][x + 1]);

                geom.vertices.push(grid[y + 1][x + 1]);
                geom.vertices.push(grid[y][x]);

                geom.vertices.push(grid[y][x]);
                geom.vertices.push(grid[y + 1][x]);
            }
        }
    }

    const mat = new THREE.LineBasicMaterial({ color: 0x67ff67, linewidth: 1 });

    wireframe = new THREE.LineSegments(geom, mat);
    // wireframe = new THREE.Line(geom, mat);

    scene.add(wireframe);


    renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = bloomParam.bloomThreshold;
    bloomPass.strength = bloomParam.bloomStrength;
    bloomPass.radius = bloomParam.bloomRadius;
    renderer.toneMappingExposure = Math.pow(bloomParam.exposure, 4.0);
    composer.addPass(bloomPass);

    container.addEventListener('mousemove', e => {
        const offsetX = e.clientX - halfWidth;
        const offsetY = e.clientY - halfHeight;
        lookAtCenter.x = map(offsetX, -halfWidth, halfWidth, - cameraParam.maxOffsetX, cameraParam.maxOffsetX) + (sizeX / 2);
        lookAtCenter.z = map(offsetY, -halfHeight, halfHeight, cameraParam.YMax, cameraParam.YMin);
    });

    container.addEventListener('mouseleave', e => {
        lookAtCenter.x = sizeX / 2;
        lookAtCenter.z = lookAtHeight;
    });

    window.addEventListener('resize', function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

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

    terrain.add(valleyParam, 'valleyEnd', 0, 1).step(0.01).listen();
    terrain.add(valleyParam, 'plateauStart', 0, 1).step(0.01).listen();
    terrain.add(valleyParam, 'valleyHeight', 0, 500).step(1).listen();
    terrain.add(valleyParam, 'plateauHeight', 200, 1000).step(10).listen();
}

function animate () {
    flying += terrainParam.speed;
    yoff = flying;
    // console.log(flying)
    for (let y = 0; y < gridY; y++) {
        xoff = 0;
        for (let x = 0; x < gridX; x++) {
            const localHeight = getLocalHeight(x, gridX);
            const height = map(noise.simplex2(xoff, yoff), -1, 1, -terrainParam.amplitude + localHeight, terrainParam.amplitude + localHeight);
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
    moveCamera();
    requestAnimationFrame(animate);
    // renderer.render(scene, camera);
    composer.render();
};

function moveCamera () {
    camera.acceleration.set(0, 0, 0);
    const steering = lookAtCenter.clone();
    steering.sub(lookAtPoint);
    console.log(steering.length());
    if (steering.length() > 15) {
        steering.setLength(20).sub(camera.velocity);
        camera.acceleration.add(steering);

        lookAtPoint.add(camera.velocity);
        camera.velocity.add(camera.acceleration);
    } else {
        lookAtPoint.copy(lookAtCenter);
    }
    camera.up = new THREE.Vector3(0, 0, 1);
    camera.lookAt(lookAtPoint);
}

function getLocalHeight (y, yMax) {
    const half = yMax / 2;
    const distFromCenter = Math.abs(y - half);

    if (distFromCenter / half < valleyParam.valleyEnd) {
        return valleyParam.valleyHeight;
    } else if (distFromCenter / half > valleyParam.plateauStart) {
        return valleyParam.plateauHeight;
    } else {
        const xa = valleyParam.valleyEnd * half;
        const xb = valleyParam.plateauStart * half;
        const m = (valleyParam.plateauHeight - valleyParam.valleyHeight) / (xb - xa);
        const p = valleyParam.valleyHeight - m * xa;
        return (m * distFromCenter) + p;
    }
}

(function () {
    init();
    initGUI();
    animate();
})();
