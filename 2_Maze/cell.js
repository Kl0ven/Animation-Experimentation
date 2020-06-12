// eslint-disable-next-line no-unused-vars
class Cell {
    constructor (x, y, size, ctx) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.size = size;
        this.sides = [true, true, true, true, true, true];
    }

    draw () {
        // Reset the current path
        this.ctx.beginPath();

        let currentX = this.x + this.size * Math.cos(Math.PI / 6);
        let currentY = this.y + this.size * Math.sin(Math.PI / 6);
        this.ctx.moveTo(currentX, currentY);

        for (const [i, s] of this.sides.entries()) {
            const nextX = this.x + this.size * Math.cos((i+1.5) * Math.PI / 3);
            const nextY = this.y + this.size * Math.sin((i+1.5) * Math.PI / 3);
            if (s) {
                this.ctx.lineTo(nextX, nextY);
            }
            this.ctx.moveTo(nextX, nextY);
            currentX = nextX;
            currentY = nextY;
        }
        this.ctx.stroke();
    }
}
