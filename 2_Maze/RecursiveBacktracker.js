// eslint-disable-next-line no-unused-vars
class RecursiveBacktracker {
    constructor (map, settings) {
        this.map = map;
        this.currentCell = null;
        this.stack = [];
        this.stop = false;
        this.settings = settings;
    }

    init () {
        this.map.draw();
        this.setCurrentCell(this.map.getCellAt(0, 0));
    }

    run () {
        if (! this.map.isAllCellsVisited() && !this.stop) {
            this.step();
            setTimeout(this.run.bind(this), this.settings.timeStep);
        }
    }

    step () {
        const next = this.map.getRandomNotVisitedNeigbors(this.currentCell);
        if (next) {
            this.setCurrentCell(next);
            this.stack.push(this.currentCell);
        } else if ( this.stack.length > 0) {
            const cell = this.stack.pop();
            this.setCurrentCell(cell);
        }
    }

    setCurrentCell (c) {
        if (this.currentCell) {
            this.map.removeWall(this.currentCell, c);
            this.currentCell.leave();
        }

        this.currentCell = c;
        c.visit();
    }
}
