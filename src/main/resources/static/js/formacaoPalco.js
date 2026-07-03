const PIXELS_PER_METER = 80;
let canvas;
let gridLines = [];
let id = 0;

const boundaryEl = document.getElementById('stageBoundary');
const showGridToggle = document.getElementById('showGrid');
const gridColsInput = document.getElementById('gridCols');
const gridRowsInput = document.getElementById('gridRows');
const stageWidthInput = document.getElementById('stageWidth');
const stageHeightInput = document.getElementById('stageHeight');
const showCenterToggle = document.getElementById('showCenterGuides');

function initCanvas() {
    canvas = new fabric.Canvas('Canvas', {
        selection: false,
        preserveObjectStacking: true,
        backgroundColor: '#ffffff'
    });
    updateStageDimensions();

    gridColsInput.addEventListener('change', drawGrid);
    gridRowsInput.addEventListener('change', drawGrid);
    showGridToggle.addEventListener('change', drawGrid);

    stageWidthInput.addEventListener('change', updateStageDimensions);
    stageHeightInput.addEventListener('change', updateStageDimensions);
    showCenterToggle.addEventListener('change', drawGrid);

    document.getElementById('btnZoomIn').addEventListener('click', () => {
        let zoom = canvas.getZoom();
        zoom = Math.min(zoom + 0.1, 2);
        canvas.setZoom(zoom);
        canvas.requestRenderAll();
    });

    document.getElementById('btnZoomOut').addEventListener('click', () => {
        let zoom = canvas.getZoom();
        zoom = Math.max(zoom - 0.1, 0.5);
        canvas.setZoom(zoom);
        canvas.requestRenderAll();
    });

    // Allow canvas to resize visually on browser resize? Not needed since dimensions dictate size.
}

function updateStageDimensions() {
    const wMeters = parseInt(stageWidthInput.value) || 10;
    const hMeters = parseInt(stageHeightInput.value) || 8;

    const pxWidth = wMeters * PIXELS_PER_METER;
    const pxHeight = hMeters * PIXELS_PER_METER;

    canvas.setWidth(pxWidth);
    canvas.setHeight(pxHeight);

    boundaryEl.style.width = pxWidth + 'px';
    boundaryEl.style.height = pxHeight + 'px';

    drawGrid();
}

function drawGrid() {
    gridLines.forEach(line => canvas.remove(line));
    gridLines = [];

    const width = Math.max(canvas.width, 100);
    const height = Math.max(canvas.height, 100);

    if (showGridToggle.checked) {
        const cols = parseInt(gridColsInput.value) || 10;
        const rows = parseInt(gridRowsInput.value) || 8;

        const colSize = width / cols;
        const rowSize = height / rows;

        for (let i = 0; i <= cols; i++) {
            const line = new fabric.Line([i * colSize, 0, i * colSize, height], {
                stroke: '#e5e7eb', strokeWidth: 1, selectable: false, evented: false
            });
            gridLines.push(line);
            canvas.add(line);
        }
        for (let i = 0; i <= rows; i++) {
            const line = new fabric.Line([0, i * rowSize, width, i * rowSize], {
                stroke: '#e5e7eb', strokeWidth: 1, selectable: false, evented: false
            });
            gridLines.push(line);
            canvas.add(line);
        }
    }

    if (showCenterToggle.checked) {
        const centerX = width / 2;
        const centerLine = new fabric.Line([centerX, 0, centerX, height], {
            stroke: 'rgba(198, 40, 40, 0.4)', strokeDashArray: [5, 5], strokeWidth: 2, selectable: false, evented: false
        });
        gridLines.push(centerLine);
        canvas.add(centerLine);

        const frontLine = new fabric.Line([40, height - 20, width - 40, height - 20], {
            stroke: 'rgba(198, 40, 40, 0.6)', strokeWidth: 4, selectable: false, evented: false
        });
        gridLines.push(frontLine);
        canvas.add(frontLine);

        const textLabel = new fabric.Text('Público / Visão', {
            left: centerX, top: height - 10, originX: 'center', originY: 'center',
            fontSize: 12, fontFamily: 'Noto Sans', fill: 'rgba(198, 40, 40, 1)', selectable: false, evented: false
        });
        gridLines.push(textLabel);
        canvas.add(textLabel);
    }

    gridLines.forEach(l => canvas.sendToBack(l));
    canvas.requestRenderAll();
}

function inserirNagadou() {
    canvas = new fabric.Canvas('Canvas');
    id++;
    fabric.Image.fromURL('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkkRdn_Ba7Qv6oSWevakv5fJ3qEKRJc9wr3g&s', function (img) {
        img.set({
            left: 100,
            top: 100,
            scaleX: 0.5,
            scaleY: 0.5
        });
        img.id = "id_" + id;

        canvas.add(img);
    });
}

document.addEventListener('DOMContentLoaded', initCanvas);
