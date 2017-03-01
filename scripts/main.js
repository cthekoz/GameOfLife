
var canvasProperties;
var universe = [];
var stop = false;

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
    console.log("cellSize: " + canvasProperties.cellSize
                    + " " + "width: " + canvasProperties.width
                    + " " + "height: " + canvasProperties.height
                    + " " + "xCells: " + canvasProperties.xCells
                    + " " + "yCells: " + canvasProperties.yCells
                    );
}

function onLoad() {
    "use strict";
    console.log("onLoad()");
    
    var canvas = document.getElementById("mycanvas");
    canvas.height = Math.floor(window.innerHeight * .7);
    canvas.width = Math.floor(window.innerWidth * .8); 
    canvasProperties = resizeCanvas(canvas, 20);
    //drawFillCanvas(canvas, 'gold', canvasProperties);
    drawGridCanvas('black', canvasProperties);
    
    var totalcells = document.getElementById("totalcells");
    totalcells.textContent  = universe.length;
}

function onResize() {
    "use strict";
    console.log("onResize()");

    var canvas = document.getElementById("mycanvas");
    canvas.height = Math.floor(window.innerHeight * .7);
    canvas.width = Math.floor(window.innerWidth * .8); 
    canvasProperties = resizeCanvas(canvas, canvasProperties.cellSize);

    //drawFillCanvas(canvas, 'gold', canvasProperties);
    drawGridCanvas('black', canvasProperties);
}

function resizeCanvas(canvas, cellSize) {
    "use strict";
    var cellSize = cellSize;
/*    canvas.height = Math.floor(document.body.clientHeight * .8);
    canvas.width = Math.floor(document.body.clientWidth * .8); */
    
    var yCells = Math.floor(canvas.height / cellSize);   
    var xCells = Math.floor(canvas.width / cellSize);
    canvas.height = yCells * cellSize + 1;
    canvas.width = xCells * cellSize + 1;

    var context = canvas.getContext("2d");
    // If I use translate, my grid draws incorrectly, i.e., unattached endlines. Perplexing. -ck
    //context.translate(window.innerWidth * .1, window.innerHeight * .1);

    return {
        cellSize: cellSize,
        width: canvas.width,
        height: canvas.height,
        xCells: xCells,
        yCells: yCells,
        canvas: canvas,
        context: context
    }
}

function drawFillCanvas(canvas, color, canvasProperties) {
    "use strict";
    var context = canvasProperties.context;
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = color;
    context.fill();
}

function drawGridCanvas(color, canvasProperties) {
    "use strict";
    
    canvasPropertiesPrint(canvasProperties);

    var context = canvasProperties.context;

    for (var x = 0; x <= canvasProperties.cellSize * canvasProperties.xCells + canvasProperties.cellSize + 1; x += canvasProperties.cellSize) {        
        context.moveTo(x, 0);
        context.lineTo(x, canvasProperties.yCells * canvasProperties.cellSize);
    }
    for (var y = 0; y <= canvasProperties.cellSize * canvasProperties.yCells + canvasProperties.cellSize + 1; y += canvasProperties.cellSize) {        
        context.moveTo(0, y);
        context.lineTo(canvasProperties.xCells * canvasProperties.cellSize, y);
    }
    context.lineWidth = 1;
    context.strokeStyle = color;
    context.stroke();
}

function drawRectangle(canvasProperties, x, y, width, height, color) {
    "use strict";
    var context = canvasProperties.context;

    context.beginPath();
    context.rect(x + 1, y + 1, width - 2, height - 2);
    context.fillStyle = color;
    context.fill();
}

function drawUniverse(universe, color) {
    "use strict";
    universe.forEach(function (cell) {
        drawRectangle(canvasProperties,
        cell[0] * canvasProperties.cellSize, 
        cell[1] * canvasProperties.cellSize,
        canvasProperties.cellSize,
        canvasProperties.cellSize,
        color);
    });
}

// Random number function that generates a whole number between 0 and range
function randomNumber(range) {
    "use strict";
    if (typeof range === "number") {
        return Math.round(Math.random() * range);
    }
}

function drawClearUniverse(canvasProperties) {
    "use strict";
    // Why is canvas.style.backgroundColor = 'black'?
    for (var x = 0; x < (canvasProperties.xCells); x++) {
        for (var y = 0; y < (canvasProperties.yCells); y++) {
            drawRectangle(canvasProperties, 
            x * canvasProperties.cellSize, 
            y * canvasProperties.cellSize, 
            canvasProperties.cellSize, 
            canvasProperties.cellSize, 'white');
        }
    }
}

function buttonStartClick() {
    "use strict";
    
    stop = false;
    drawClearUniverse(canvasProperties);
    universe = createUniverse(canvasProperties); 
    drawUniverse(universe, 'green');
    // interval = setInterval(playGame, 200);
    setTimeout(playGame, 200);
}

function buttonStopClick() {
    "use strict";
    stop = true;
}

function canvasWheel(wheelEvent) {
    console.log("Canvas width: " + canvasProperties.width);
    if (wheelEvent.deltaY < 0) {        
        canvasProperties = resizeCanvas(canvasProperties.canvas, canvasProperties.cellSize + 1);
    }
    else if (wheelEvent.deltaY > 0) {
        canvasProperties = resizeCanvas(canvasProperties.canvas, canvasProperties.cellSize - 1);
    }
    console.log("Canvas width: " + canvasProperties.width);
    drawGridCanvas('white', canvasProperties);
    drawGridCanvas('black', canvasProperties);
}

function createUniverse(canvasProperties) {
    "use strict";
    var totalCellCount = canvasProperties.yCells * canvasProperties.xCells;
    var oneTenth = Math.floor(totalCellCount / 10);

    var cells = [];

    for (var i = 0; i < oneTenth; i++) {
        var rx = randomNumber(canvasProperties.xCells - 1);
        var ry = randomNumber(canvasProperties.yCells -1);
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
        //console.log("Adding a cell to an array.");
        cellArray[cellArray.length] = cell;
    }
}

function getNeighbors(universe, cell, neighborPredicate) {
    "use strict";
    var neighbors = [];
    //console.log("getNeighbors universe length: " + universe.length);
    neighborOffsets.forEach(function (neighborOffset) {
        var neighborCell = [cell[0] + neighborOffset[0], cell[1] + neighborOffset[1]];
        //console.log(neighborCell);
        if (neighborPredicate(universe, neighborCell)) {
            //console.log("Neighbor predicate was true.");
            addToArrayIfNotAlreadyThere(neighbors, neighborCell);
        }
        else {
            //console.log("Neighbor predicate was false.");
        }
    });
    //console.log("Neighbor count: " + neighbors.length);
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
        //console.log("Live neighbor count: " + liveNeighborCount);
        // GoL Rule 1
        if (liveNeighborCount < 2 || liveNeighborCount > 3) {
            addToArrayIfNotAlreadyThere(deadCells, cell);
        }
        else {
            // GoL Rule 2
            addToArrayIfNotAlreadyThere(liveCells, cell);
        }

        var deadNeighbors = getDeadNeighbors(universe, cell);
        //console.log("Dead neighbors count: " + deadNeighbors.length);
        deadNeighbors.forEach(function (deadNeighbor) {
            // GoL Rule 3
            if (getLiveNeighbors(universe, deadNeighbor).length === 3) {                
                addToArrayIfNotAlreadyThere(liveCells, deadNeighbor);
            }
        });
    });
    //console.log("Dead cells: " + deadCells.length);
    //console.log("Live cells: " + liveCells.length);
    //console.log("Universe cells: " + universe.length);
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
    drawClearUniverse(canvasProperties)
    drawUniverse(universe, 'green');
    var totalcells = document.getElementById("totalcells");
    totalcells.textContent  = universe.length;
    if (!stop) {
        setTimeout(playGame, 200);
    }
}
