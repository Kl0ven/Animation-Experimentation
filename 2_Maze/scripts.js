/* eslint-disable max-len */
'use strict';
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const greyColor = '#282828';
const greenColor = '#67ff67';
const width = window.innerWidth;
const height = window.innerHeight;

const cellSize = 20;

const map = new Map(ctx, cellSize, width, height);


function init () {
    // Set size
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // set background color
    ctx.fillStyle = greyColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = greenColor;
    ctx.lineWidth = 1;
    map.draw();
}

(function () {
    init();
})();
