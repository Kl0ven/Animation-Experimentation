const posEven = [[0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, 0]];
const posOdd = [[1, 1], [0, 1], [-1, 0], [0, -1], [1, -1], [1, 0]];

// eslint-disable-next-line no-unused-vars
class Map {
    constructor (ctx, cellSize, width, height, styles) {
        this.ctx = ctx;
        this.styles = styles;
        this.cellSize = cellSize;
        this.cellWidth = Math.sqrt(3) * cellSize;
        this.cellHeight = 2 * cellSize;
        this.horizontalSpacing = this.cellWidth;
        this.verticalSpacing = (3 / 4) * this.cellHeight;
        this.numberCellX = Math.ceil(width / this.cellWidth);
        this.numberCellY = Math.ceil(height / this.verticalSpacing) + 1;
        this.cells = [];
        this.generateMap();
    }

    generateMap () {
        let x;
        let y;
        for (let j = 0; j < this.numberCellY; j++) {
            for (let i = 0; i < this.numberCellX; i++) {
                [x, y] = this.calculatePosition(i, j);
                this.cells.push(new Cell(x, y, i, j, this.cellSize, this.ctx, this.styles));
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

    getCellAt (x, y) {
        let c;

        if (x < 0 || x >= this.numberCellX || y < 0 || y >= this.numberCellY) {
            c = undefined;
        } else {
            c = this.cells[x + (y * this.numberCellX)];
        }
        return c;
    }

    isAllCellsVisited () {
        for (const c of this.cells) {
            if (!c.visited) {
                return false;
            }
        }
        return true;
    }

    getNeigbors (c) {
        const cellPos = c.mapPos;
        const pos = cellPos[1]%2 == 0 ? posEven : posOdd;
        const neigbors = [];
        let neigbor;
        for (const p of pos) {
            // console.log(cellPos, p);
            neigbor = this.getCellAt(cellPos[0] + p[0], cellPos[1] + p[1]);
            if (neigbor instanceof Cell) {
                neigbors.push(neigbor);
            }
        }
        return neigbors;
    }

    getRandomNotVisitedNeigbors (c) {
        const neigbors = this.getNeigbors(c);
        const notVisited = [];
        for (const n of neigbors) {
            if (!n.visited) {
                notVisited.push(n);
            }
        }
        if (notVisited.length > 0) {
            return notVisited[Math.floor(Math.random() * notVisited.length)];
        } else {
            return undefined;
        }
    }

    removeWall (c1, c2) {
        const c1Pos = c1.mapPos;
        const c2Pos = c2.mapPos;
        const pos = c1Pos[1] % 2 == 0 ? posEven : posOdd;
        const delta = [c2Pos[0] - c1Pos[0], c2Pos[1] - c1Pos[1]];
        let wallIndices;
        for (const [i, p] of pos.entries()) {
            if (p[0] == delta[0] && p[1] == delta[1]) {
                wallIndices = i;
                break;
            }
        }
        c1.removeWall(wallIndices);
        c2.removeWall((wallIndices + 3) % 6);
    }
}
