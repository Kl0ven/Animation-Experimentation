/* eslint-disable max-len */
'use strict';
import { GUI } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/examples/jsm/libs/dat.gui.module.js';
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const styles = {
    backgroundColor: '#282828',
    wallsColor: '#67ff67',
    visitedColor: '#282828',
    currentColor: '#166af2',
    lineWidth: 1
};


const presets = {
    preset: 'Sober',
    remembered: {
        Sober: {
            0: {
                backgroundColor: '#282828',
                wallsColor: '#282828',
                visitedColor: '#413d3d',
                currentColor: '#282828',
                lineWidth: 1
            }
        },
        BlueGreen: {
            0: {
                backgroundColor: '#282828',
                wallsColor: '#67ff67',
                visitedColor: '#4287f5',
                currentColor: '#166af2',
                lineWidth: 1
            }

        }
    },
    closed: false,
    folders: {}
};

const settings = {
    restart: restart,
    cellSize: 10,
    timeStep: 1
};

const width = window.innerWidth;
const height = window.innerHeight;


let map = new Map(ctx, settings.cellSize, width, height, styles);
let algorithm = new RecursiveBacktracker(map, settings);

function init () {
    // Set size
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // set background color
    ctx.fillStyle = styles.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    algorithm.init();
}

function initGUI () {
    const gui = new GUI({ load: presets});
    gui.remember(styles);
    const colorFolder = gui.addFolder('Color');
    const settingsFolder = gui.addFolder('Settings');

    colorFolder.open();
    settingsFolder.open();

    colorFolder.addColor(styles, 'backgroundColor');
    colorFolder.addColor(styles, 'wallsColor');
    colorFolder.addColor(styles, 'visitedColor');
    colorFolder.addColor(styles, 'currentColor');
    colorFolder.add(styles, 'lineWidth', 0.5, 10).step(0.1);

    settingsFolder.add(settings, 'cellSize', 10, 100).step(1).onChange(restart);
    settingsFolder.add(settings, 'timeStep', 1, 100);
    gui.add(settings, 'restart');
}


function restart () {
    algorithm.stop = true;
    map = new Map(ctx, settings.cellSize, width, height, styles);
    algorithm = new RecursiveBacktracker(map, settings);
    algorithm.init();
    algorithm.run();
    init();
}


(function () {
    initGUI();
    init();
    algorithm.run();
})();
