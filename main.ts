/* I'm putting in a header comment to check out GitHub integration. */
/* 3-3-2017 - added wheel zoom. */

import { Observable } from "rxjs-es";

"use strict";

var canvasProperties;
var gridProperties;
var universe = [];
var stopRunning = false;
var clipSave;
var grid = true;
var viewPort = [];

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

    console.log("width: " + canvasProperties.width
        + " " + "height: " + canvasProperties.height
    );
}

/* Resizes the canvas as percentages of window width and height.*/
function resizeCanvasByWindowSize() {

    var canvas = <HTMLCanvasElement>document.getElementById("mycanvas");
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

    var cellSize = cellSize;
    var cellCounts = getCellCounts(canvas, cellSize);
    var foreColor = 'black';
    var backColor = 'white';

    return {
        xCells: cellCounts.xCells,
        yCells: cellCounts.yCells,
        cellSize: cellSize,
        foreColor: foreColor,
        backColor: backColor
    }
}

function getCellCounts(canvas, cellSize) {

    var xCells = Math.floor(canvas.width / cellSize);
    var yCells = Math.floor(canvas.height / cellSize);

    return {
        xCells: xCells,
        yCells: yCells
    }
}

window.onload = function onLoad() {

    var canvas = document.getElementById("mycanvas");
    canvasProperties = resizeCanvasByWindowSize();
    var cellSize = 20;
    gridProperties = resizeCanvasByCellSize(canvas, cellSize);
    gridProperties.grid = true;
    drawGridCanvas(canvasProperties, gridProperties);

    var totalcells = document.getElementById("totalcells");
    totalcells.textContent = universe.length.toString();

    var buttonStart = <HTMLButtonElement>document.getElementById("startButton");
    buttonStart.onclick = buttonStartClick;

    var buttonStop = <HTMLButtonElement>document.getElementById("stopButton");
    buttonStop.onclick = buttonStopClick;

    var buttonToggleGrid = <HTMLButtonElement>document.getElementById("toggleGridButton");
    buttonToggleGrid.onclick = buttonToggleGridClick;

    var wheelCanvas = <HTMLCanvasElement>document.getElementById("mycanvas");
    wheelCanvas.addEventListener("mousewheel", canvasWheel, false);


    // This is my Rx stuff for dragging the viewport. I suspect it is rather naive. -ck
    var mouseup = Observable.fromEvent(canvas, 'mouseup');
    var mousemove = Observable.fromEvent(canvas, 'mousemove');
    var mousedown = Observable.fromEvent(canvas, 'mousedown');

    let dragViewPort = mousemove
        .skipUntil(mousedown)
        .takeUntil(mouseup)
        .map((me: MouseEvent) => {
            let rect = canvas.getBoundingClientRect();
            let x = me.clientX - Math.floor(rect.left);
            let y = me.clientY - Math.floor(rect.top);
            //console.log(`raw: ${x} ${y}`)
            return {
                x: x,
                y: y
            }
        })
        .map(c => {
            let x = Math.floor(c.x / gridProperties.cellSize);
            let y = Math.floor(c.y / gridProperties.cellSize);
            //console.log(`raw / cellsize: ${x} ${y}`)
            return {
                x: x,
                y: y
            }
        })
        .bufferCount(2)
        .map(twoCoordinates => {
            if (twoCoordinates.length === 2) {
                let x = twoCoordinates[0].x - twoCoordinates[1].x;
                let y = twoCoordinates[0].y - twoCoordinates[1].y;
                //console.log(`diff: ${x} ${y}`)
                return {
                    x: x,
                    y: y
                }
            }
        });


    let dragViewPortSubscribe = dragViewPort.subscribe((c) => c => moveViewPort(c));


    let reInitializeDrag = mouseup.subscribe((me: MouseEvent) => {
        dragViewPortSubscribe.unsubscribe();
        dragViewPortSubscribe = dragViewPort.subscribe(c => moveViewPort(c));

    });
}

function moveViewPort(cellOffset) {

    if (typeof cellOffset != "undefined") {
        viewPort[0] = viewPort[0] + cellOffset.x;
        viewPort[1] = viewPort[1] + cellOffset.y;

        var currentViewPort = document.getElementById("origin");
        currentViewPort.textContent = `${viewPort[0]}, ${viewPort[1]}`;
    }
}


function buttonStartClick() {
    stopRunning = false;
    viewPort = [0, 0];

    drawClearUniverse(canvasProperties, gridProperties);
    universe = createUniverse(gridProperties);
    drawUniverse(universe, canvasProperties, gridProperties, 'green');
    setTimeout(playGame, 200);
}

function buttonStopClick() {
    stopRunning = true;
}

function buttonToggleGridClick() {
    grid = !grid;
    drawGridCanvas(canvasProperties, gridProperties);
}

function canvasWheel(wheelEvent) {
    if (wheelEvent.deltaY < 0) {
        gridProperties = resizeCanvasByCellSize(canvasProperties.canvas, gridProperties.cellSize + 1);
    }
    else if (wheelEvent.deltaY > 0) {
        gridProperties = resizeCanvasByCellSize(canvasProperties.canvas, gridProperties.cellSize - 1);
    }

    drawClearUniverse(canvasProperties, gridProperties);
    drawGridCanvas(canvasProperties, gridProperties);
}

window.onresize = function onResize() {

    canvasProperties = resizeCanvasByWindowSize();
    var canvas = canvasProperties.canvas;
    var cellSize = gridProperties.cellSize;
    gridProperties = resizeCanvasByCellSize(canvas, cellSize);

    drawGridCanvas(canvasProperties, gridProperties);

    var totalcells = document.getElementById("totalcells");
    totalcells.textContent = universe.length.toString();
}

function drawFillCanvas(canvas, color, canvasProperties) {

    var context = canvasProperties.canvas.getContext("2d");
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = color;
    context.fill();
}

function drawGridCanvas(canvasProperties, gridProperties) {

    var color;

    if (grid) {
        color = gridProperties.foreColor;
    }
    else {
        color = gridProperties.backColor;
    }

    var context = canvasProperties.context;
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

    var context = canvasProperties.canvas.getContext("2d");

    context.beginPath();
    context.rect(x, y, width, height);
    context.fillStyle = color;
    context.fill();
}

function drawUniverse(universe, canvasProperties, gridProperties, color) {
    console.log(`viewport: ${viewPort[0]} ${viewPort[1]}`);

    var context = canvasProperties.canvas.getContext("2d");
    var cellSize = gridProperties.cellSize;
    var xCells = gridProperties.xCells;
    var yCells = gridProperties.yCells;

    context.save();
    context.beginPath();
    context.rect(0, 0, cellSize * xCells + 1, cellSize * yCells + 1);
    context.clip();

    universe
        .filter(c => c[0] >= viewPort[0] && c[1] >= viewPort[1] && c[0] < viewPort[0] + xCells && c[1] < viewPort[1] + yCells)
        .map(cell => [cell[0] - viewPort[0], cell[1] - viewPort[1]])
        .forEach(function (cell) {
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
    if (typeof range === "number") {
        return Math.round(Math.random() * range);
    }
}

// Clear the canvas.
function drawClearUniverse(canvasProperties, gridProperties) {

    // Why is canvas.style.backgroundColor = 'black'?
    var context = canvasProperties.canvas.getContext("2d");
    context.clearRect(0, 0, canvasProperties.width, canvasProperties.height);
    drawGridCanvas(canvasProperties, gridProperties);
}


function createUniverse(gridProperties) {

    var totalCellCount = gridProperties.yCells * gridProperties.xCells;
    var oneTenth = Math.floor(totalCellCount / 10);

    var cells = [];

    for (var i = 0; i < oneTenth; i++) {
        var rx = randomNumber(gridProperties.xCells - 1);
        var ry = randomNumber(gridProperties.yCells - 1);
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

function cellExistsNot(cellArray, cell) {
    return !cellExists(cellArray, cell);
}

function addToArrayIfNotAlreadyThere(cellArray, cell) {

    if (!cellExists(cellArray, cell)) {
        cellArray[cellArray.length] = cell;
    }
}

function getNeighbors(universe, cell, neighborPredicate) {

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

    var liveNeighbors = getNeighbors(universe, cell, cellExists);
    return liveNeighbors;
}

function getDeadNeighbors(universe, cell) {

    var deadNeighbors = getNeighbors(universe, cell, cellExistsNot);
    return deadNeighbors;
}

function doNextGeneration(universe) {


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

function setTotalCellCountColor(previous, current) {
    var totalCellCount = document.getElementById("totalcells");

    if (previous < current) {
        totalCellCount.style.color = 'green';
    }
    else if (previous > current) {
        totalCellCount.style.color = 'darkred';
    }
    else {
        totalCellCount.style.color = 'black';
    }
}

function playGame() {

    var universeLength = universe.length;
    universe = doNextGeneration(universe);
    setTotalCellCountColor(universeLength, universe.length);
    drawClearUniverse(canvasProperties, gridProperties)
    drawUniverse(universe, canvasProperties, gridProperties, 'green');
    var totalcells = document.getElementById("totalcells");
    totalcells.textContent = universe.length.toString();
    var currentViewPort = document.getElementById("origin");
    currentViewPort.textContent = `${viewPort[0]}, ${viewPort[1]}`;
    if (!stopRunning) {
        setTimeout(playGame, 200);
    }
}
