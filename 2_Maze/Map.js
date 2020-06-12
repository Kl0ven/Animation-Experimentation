// eslint-disable-next-line no-unused-vars
class Map {
    constructor (ctx, cellSize, width, height) {
        this.ctx = ctx;
        this.cellSize = cellSize;
        this.cellWidth = Math.sqrt(3) * cellSize;
        this.cellHeight = 2 * cellSize;
        this.horizontalSpacing = this.cellWidth;
        this.verticalSpacing = (3 / 4) * this.cellHeight;
        this.numberCellX = width / this.cellWidth;
        this.numberCellY = height / this.verticalSpacing;
        this.cells = [];
        this.generateMap();
    }

    generateMap () {
        let x;
        let y;
        for (let i = 0; i < this.numberCellX; i++) {
            for (let j = 0; j < this.numberCellY; j++) {
                [x, y] = this.calculatePosition(i, j);
                this.cells.push(new Cell(x, y, this.cellSize, this.ctx));
            }
        }
    }

    draw () {
        for (const c of this.cells) {
            c.draw();
        }
    }

    calculatePosition (i, j) {
        return [
            (i * this.horizontalSpacing) + ((j % 2) * (this.horizontalSpacing / 2)),
            j * this.verticalSpacing
        ];
    }
}
