/* eslint-disable max-len */
'use strict';
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const styles = {
    backgroundColor: '#282828',
    wallsColor: '#67ff67',
    visitedColor: '#4287f5',
    currentColor: '#166af2',
    lineWidth: 1
};

const width = window.innerWidth;
const height = window.innerHeight;

const cellSize = 50;

const map = new Map(ctx, cellSize, width, height, styles);
const algorithm = new RecursiveBacktracker(map);

function init () {
    // Set size
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // set background color
    ctx.fillStyle = styles.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    algorithm.init();
    algorithm.run();
}

(function () {
    init();
})();
