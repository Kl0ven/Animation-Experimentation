// eslint-disable-next-line no-unused-vars
class Cell {
    constructor (x, y, i, j, size, ctx, styles) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.size = size;
        this.sides = [true, true, true, true, true, true];
        this.visited = false;
        this.styles = styles;
        this.mapPos = [i, j];
        this.current = false;
    }

    draw () {
        if (this.current) {
            this.ctx.fillStyle = this.styles.currentColor;
            this.__traceHexagone(true);
            this.ctx.fill();
        } else if (this.visited) {
            this.ctx.fillStyle = this.styles.visitedColor;
            this.__traceHexagone(true);
            this.ctx.fill();
        }

        this.ctx.strokeStyle = this.styles.wallsColor;
        this.ctx.lineWidth = this.styles.lineWidth;
        this.__traceHexagone();
        this.ctx.stroke();
    }

    erase () {
        this.ctx.strokeStyle = this.styles.backgroundColor;
        this.ctx.lineWidth = 2;
        this.__traceHexagone();
        this.ctx.stroke();
    }

    __traceHexagone (fill=false) {
        // Reset the current path
        this.ctx.beginPath();

        let currentX = this.x + this.size * Math.cos(Math.PI / 6);
        let currentY = this.y + this.size * Math.sin(Math.PI / 6);
        this.ctx.moveTo(currentX, currentY);

        for (const [i, s] of this.sides.entries()) {
            const nextX = this.x + this.size * Math.cos((i + 1.5) * Math.PI / 3);
            const nextY = this.y + this.size * Math.sin((i + 1.5) * Math.PI / 3);
            if (s || fill) {
                this.ctx.lineTo(nextX, nextY);
            }
            if (!fill) {
                this.ctx.moveTo(nextX, nextY);
            }
            currentX = nextX;
            currentY = nextY;
        }
    }

    visit () {
        this.visited = true;
        this.current = true;
        this.draw();
    }

    leave () {
        this.current = false;
        this.draw();
    }

    removeWall (i) {
        this.sides[i] = false;
    }
}
