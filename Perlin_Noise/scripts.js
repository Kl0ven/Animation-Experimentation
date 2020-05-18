'use strict';
// scene
let camera;
let scene;
let renderer;
let geom;
let wireframe_geom;
let wireframe;
// window
let windowX = window.innerWidth;
let windowY = window.innerHeight;


const sizeX = 3000
const sizeY = 3000

// camera
const initCameraX = sizeX / 2;
const initCameraY = sizeY / 2 - 2500;
const initCameraZ = 500;
const lookAtCenter = new THREE.Vector3(sizeX / 2, sizeY / 2, 100)

// shapes
const gridSize = 50;
const grid = [];

// calc grid values
const gridX = Math.ceil(sizeX / gridSize);
const gridY = Math.ceil(sizeY / gridSize);

const speed = 0.05
let yoff = 0;
let xoff = 0; 
let flying = 0;
const scale = 0.1


const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;

// initialize canvas
function init() {
    const container = document.getElementById('canvas');
    windowX = window.innerWidth;
    windowY = window.innerHeight;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
    // renderer.autoClear = false;
    // renderer.setClearColor(0x282828, 1);
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x282828);
    camera = new THREE.PerspectiveCamera(20, windowX / windowY, 1, 30000);

    camera.position.x = initCameraX;
    camera.position.y = initCameraY;
    camera.position.z = initCameraZ;
    camera.lookAt(lookAtCenter)

    scene.add(camera);

    renderer.setSize(windowX, windowY);
    container.appendChild(renderer.domElement);
    // scene.fog = new THREE.FogExp2(0x000000, 0.0004);

    // shape rendering
    geom = new THREE.Geometry();
    const material = new THREE.MeshLambertMaterial({
        color: 0x67ff67,
        wireframe: true
    });
    noise.seed(Math.random());
    yoff = 0;
    for (let y = 0; y < gridY; y++) {
        xoff = 0;
        let line = [];
        for (let x = 0; x < gridX; x++) {
            let height = map(noise.simplex2(xoff, yoff), -1, 1, -50, 50)
            line.push(new THREE.Vector3(x * gridSize, y * gridSize, height))
            xoff += scale;
        }
        grid.push(line)
        yoff += scale;
    }

    for (let y = 0; y < gridY - 1; y++) {
        for (let x = 0; x < gridX - 1; x++) {
            const arrayPosition = ((y * (gridX - 1)) + x) * 4;


            geom.vertices.push(grid[y][x]);
            geom.vertices.push(grid[y][x + 1]);
            geom.vertices.push(grid[y + 1][x]);
            geom.vertices.push(grid[y + 1][x + 1]);
            // geom.faces.push(new THREE.Face3(arrayPosition, arrayPosition + 1, arrayPosition + 2));
            // geom.faces.push(new THREE.Face3(arrayPosition + 2, arrayPosition + 3, arrayPosition + 1));

        }
    }

    // const obj = new THREE.Mesh(geom, material);
    // scene.add(obj);

    // wireframe_geom = new THREE.WireframeGeometry(geom); // or WireframeGeometry
    var mat = new THREE.LineBasicMaterial({ color: 0x67ff67, linewidth: 2 });
    wireframe = new THREE.LineSegments(geom, mat);
    scene.add(wireframe);
}


function animate() {
    flying += speed;
    yoff = flying;
    // console.log(flying)
    for (let y = 0; y < gridY; y++) {
        xoff = 0;
        for (let x = 0; x < gridX; x++) {
            let height = map(noise.simplex2(xoff, yoff), -1, 1, -50, 50)
            grid[y][x].z = height
            xoff += scale;
        }
        yoff += scale;
    }
    geom.verticesNeedUpdate = true;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};


(function () {
    init();
    animate();
})();
