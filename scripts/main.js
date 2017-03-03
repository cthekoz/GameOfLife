/* I'm putting in a header comment to check out GitHub integration. */
/* 3-3-2017 - added wheel zoom. */

var canvasProperties;
var gridProperties;
var universe = [];
var stop = false;
var clipSave;

var neighborOffsets = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1]
];

function canvasPropertiesPrint(canvasProperties) {
    "use strict";
    console.log("width: " + canvasProperties.width
                    + " " + "height: " + canvasProperties.height             
                    );
}

/* Resizes the canvas as percentages of window width and height.*/
function resizeCanvasByWindowSize() {
    "use strict";
    
    var canvas = document.getElementById("mycanvas");
    // Reducing size to make room for other elements, e.g., buttons. Not sure this is how it ought to be done.
    canvas.height = Math.floor(window.innerHeight * .7); // 70% height
    canvas.width = Math.floor(window.innerWidth * .8);  // 80% width

    var context = canvas.getContext("2d");

    return {
        canvas: canvas,
        context: context,
        width: canvas.width,
        height: canvas.height
    }
}

/* Resizes the canvas by the cell size, assuming all cells are squares. */
function resizeCanvasByCellSize(canvas, cellSize) {
    "use strict";
    
    var cellSize = cellSize;
    var cellCounts = getCellCounts(canvas, cellSize);
    
    return {
        xCells: cellCounts.xCells,
        yCells: cellCounts.yCells,
        cellSize: cellSize
    }
}

function getCellCounts(canvas, cellSize) {
    "use strict";

    var xCells = Math.floor(canvas.width / cellSize);
    var yCells = Math.floor(canvas.height / cellSize);

    return {
        xCells: xCells,
        yCells: yCells
    }
}

function onLoad() {
    "use strict";
    
    var canvas = document.getElementById("mycanvas");
    canvasProperties = resizeCanvasByWindowSize(canvas);
    var cellSize = 20;
    gridProperties = resizeCanvasByCellSize(canvas, cellSize);

    drawGridCanvas('black', canvasProperties, gridProperties);
    
    var totalcells = document.getElementById("totalcells");
    totalcells.textContent  = universe.length;
}

function onResize() {
    "use strict";

    canvasProperties = resizeCanvasByWindowSize();

    var canvas = canvasProperties.canvas;
    
    var cellSize = gridProperties.cellSize;
    gridProperties = resizeCanvasByCellSize(canvas, cellSize);

    drawGridCanvas('black', canvasProperties, gridProperties);
    
    var totalcells = document.getElementById("totalcells");
    totalcells.textContent  = universe.length;
}

function drawFillCanvas(canvas, color, canvasProperties) {
    "use strict";
    var context = canvasProperties.canvas.getContext("2d");
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = color;
    context.fill();
}

function drawGridCanvas(color, canvasProperties, gridProperties) {
    "use strict";
    
    var context = canvasProperties.canvas.getContext("2d");
    var cellSize = gridProperties.cellSize;
    var xCells = gridProperties.xCells;
    var yCells = gridProperties.yCells;

    context.save();
    context.beginPath();
    context.rect(0, 0, cellSize * xCells + 1, cellSize * yCells + 1);
    context.clip();

    for (var x = 0; x <= cellSize * xCells + cellSize + 1; x += cellSize) {        
        context.moveTo(x, 0);
        context.lineTo(x, yCells * cellSize);
    }
    for (var y = 0; y <= cellSize * yCells + cellSize + 1; y += cellSize) {        
        context.moveTo(0, y);
        context.lineTo(xCells * cellSize, y);
    }
    context.closePath();
    context.lineWidth = 1;
    context.strokeStyle = color;
    context.stroke();
    context.restore();
}

function drawRectangle(canvasProperties, x, y, width, height, color) {
    "use strict";
    var context = canvasProperties.canvas.getContext("2d");

    context.beginPath();
    context.rect(x, y, width, height);
    context.fillStyle = color;
    context.fill();
}

function drawUniverse(universe, canvasProperties, gridProperties, color) {
    "use strict";    
    
    var context = canvasProperties.canvas.getContext("2d");
    var cellSize = gridProperties.cellSize;
    var xCells = gridProperties.xCells;
    var yCells = gridProperties.yCells;

    context.save();
    context.beginPath();
    context.rect(0, 0, cellSize * xCells + 1, cellSize * yCells + 1);
    context.clip();

    universe.forEach(function (cell) {
        drawRectangle(canvasProperties,
        cell[0] * gridProperties.cellSize + 1, 
        cell[1] * gridProperties.cellSize + 1,
        gridProperties.cellSize - 2,
        gridProperties.cellSize - 2,
        color);
    });
    context.restore();
}

// Random number function that generates a whole number between 0 and range
function randomNumber(range) {
    "use strict";
    if (typeof range === "number") {
        return Math.round(Math.random() * range);
    }
}

// Clear the canvas.
function drawClearUniverse(canvasProperties, gridProperties) {
    "use strict";
    // Why is canvas.style.backgroundColor = 'black'?
    var context = canvasProperties.canvas.getContext("2d");
    context.clearRect(0, 0, canvasProperties.width, canvasProperties.height);
    drawGridCanvas('black', canvasProperties, gridProperties);
}

function buttonStartClick() {
    "use strict";
    
    stop = false;
    drawClearUniverse(canvasProperties, gridProperties);
    universe = createUniverse(gridProperties); 
    drawUniverse(universe, canvasProperties, gridProperties, 'green');
    setTimeout(playGame, 200);
}

function buttonStopClick() {
    "use strict";
    stop = true;
}

function canvasWheel(wheelEvent) {
    if (wheelEvent.deltaY < 0) {        
        gridProperties = resizeCanvasByCellSize(canvasProperties.canvas, gridProperties.cellSize + 1);
    }
    else if (wheelEvent.deltaY > 0) {
        gridProperties = resizeCanvasByCellSize(canvasProperties.canvas, gridProperties.cellSize - 1);
    }
    
    drawClearUniverse(canvasProperties, gridProperties);
    drawGridCanvas('black', canvasProperties, gridProperties);
}

function createUniverse(gridProperties) {
    "use strict";
    var totalCellCount = gridProperties.yCells * gridProperties.xCells;
    var oneTenth = Math.floor(totalCellCount / 10);

    var cells = [];

    for (var i = 0; i < oneTenth; i++) {
        var rx = randomNumber(gridProperties.xCells - 1);
        var ry = randomNumber(gridProperties.yCells -1);
        cells[i] = [rx, ry];
    }

    return cells;
}

function cellsEqual(cell1, cell2) {
    var equal = (cell1[0] === cell2[0] && cell1[1] === cell2[1]);
    return equal;
}

function cellExists(cellArray, cell) {
    var exists = false;

    exists = cellArray.some(function (c) {
        if (cellsEqual(c, cell)) {
            return true;
        }
    });
    return exists;
}

function cellExistsNot(cellArray, cell)
{
    return !cellExists(cellArray, cell);
}

function addToArrayIfNotAlreadyThere(cellArray, cell) {
    "use strict";
    if (!cellExists(cellArray, cell))
    {
        cellArray[cellArray.length] = cell;
    }
}

function getNeighbors(universe, cell, neighborPredicate) {
    "use strict";
    var neighbors = [];
    
    neighborOffsets.forEach(function (neighborOffset) {
        var neighborCell = [cell[0] + neighborOffset[0], cell[1] + neighborOffset[1]];
        if (neighborPredicate(universe, neighborCell)) {
            addToArrayIfNotAlreadyThere(neighbors, neighborCell);
        }
    });

    return neighbors;
}

function getLiveNeighbors(universe, cell) {
    "use strict";
    var liveNeighbors = getNeighbors(universe, cell, cellExists);
    return liveNeighbors;
}

function getDeadNeighbors(universe, cell) {
    "use strict";
    var deadNeighbors = getNeighbors(universe, cell, cellExistsNot);
    return deadNeighbors;
}

function doNextGeneration(universe) {
    "use strict";

    var deadCells = [];
    var liveCells = [];

    universe.forEach(function (cell) {
        var liveNeighborCount = getLiveNeighbors(universe, cell).length;
        // GoL Rule 1
        if (liveNeighborCount < 2 || liveNeighborCount > 3) {
            addToArrayIfNotAlreadyThere(deadCells, cell);
        }
        else {
            // GoL Rule 2
            addToArrayIfNotAlreadyThere(liveCells, cell);
        }

        var deadNeighbors = getDeadNeighbors(universe, cell);
        deadNeighbors.forEach(function (deadNeighbor) {
            // GoL Rule 3
            if (getLiveNeighbors(universe, deadNeighbor).length === 3) {                
                addToArrayIfNotAlreadyThere(liveCells, deadNeighbor);
            }
        });
    });
    return liveCells;
}

function setTotalCellCountColor(previous, current)
{
    var totalCellCount = document.getElementById("totalcells");

    if (previous < current) {
        totalCellCount.style.color    = 'green';
    }
    else if (previous > current) {
        totalCellCount.style.color    = 'darkred';
    }
    else {
        totalCellCount.style.color    = 'black';
    }
}

function playGame() {
    "use strict";
    var universeLength = universe.length;
    universe = doNextGeneration(universe);
    setTotalCellCountColor(universeLength, universe.length);
    drawClearUniverse(canvasProperties, gridProperties)
    drawUniverse(universe, canvasProperties, gridProperties, 'green');
    var totalcells = document.getElementById("totalcells");
    totalcells.textContent  = universe.length;
    if (!stop) {
        setTimeout(playGame, 200);
    }
}
