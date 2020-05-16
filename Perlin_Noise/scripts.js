'use strict';
// scene
let camera;
let scene;
let renderer;

// window
let windowX = window.innerWidth;
let windowY = window.innerHeight;

// camera
const initCameraX = 0;
const initCameraY = 0;
const initCameraZ = 800;

// shapes
const gridSize = 50;
const grid = [];


// initialize canvas
function init () {
    const container = document.getElementById('canvas');
    windowX = window.innerWidth;
    windowY = window.innerHeight;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(25, windowX / windowY, 1, 3000);

    camera.position.x = initCameraX;
    camera.position.y = initCameraY;
    camera.position.z = initCameraZ;
    scene.add(camera);

    renderer.setSize(windowX, windowY);
    container.appendChild(renderer.domElement);
    scene.fog = new THREE.FogExp2(0x000000, 0.0004);

    // shape rendering

    const geom = new THREE.Geometry();
    const material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        wireframe: true
    });

    // calc grid values
    const gridX = Math.ceil(windowX / gridSize);
    const gridY = Math.ceil(windowY / gridSize);

    // render grid
    for (let y = 0; y < gridY; y++) {
        const currentY = y * gridSize;
        grid[y] = [];

        for (let x = 0; x < gridX; x++) {
            const currentX = x * gridSize;
            grid[y].push(new THREE.Vector3(currentX, currentY, Math.random() * 100));
        }
    }

    // create triangle strip
    for (let y = 0; y + 1 < grid.length; y++) {
        const current = grid[y];

        for (let x = 0; x + 1 < current.length; x++) {
            const arrayPosition = ((y * current.length) + x) * 3;

            // triangle
            const v1 = grid[y][x];
            const v2 = grid[y + 1][x];
            const v3 = grid[y][x + 1];

            geom.vertices.push(v1);
            geom.vertices.push(v2);
            geom.vertices.push(v3);

            geom.faces.push(new THREE.Face3(arrayPosition, arrayPosition + 1, arrayPosition + 2));
        }
    }

    const obj = new THREE.Mesh(geom, material);
    scene.add(obj);
}


function animate () {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};


(function () {
    init();
    animate();
})();
