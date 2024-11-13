const c = transformCanvas.getContext('2d');
let pixelRatio = window.devicePixelRatio || 1;

// Define the rectangles (divisible by 8px)
const rectangles = [
    { x: 256, y: 192, width: 256, height: 320, color: '#E84D8A', isDragging: false },
    { x: 512, y: 192, width: 320, height: 256, color: '#FEB326', isDragging: false },
    { x: 576, y: 448, width: 256, height: 320, color: '#64C5EB', isDragging: false },
    { x: 256, y: 512, width: 320, height: 256, color: '#7F58AF', isDragging: false }
];

let draggedRect = null;
let offsetX = 0;
let offsetY = 0;

// Resize the transformCanvas for high-DPI screens
function resizeTransformCanvasToDisplaySize() {
    pixelRatio = window.devicePixelRatio || 1;

    const width = transformCanvas.clientWidth;
    const height = transformCanvas.clientHeight;

    // Adjust transformCanvas size based on device pixel ratio
    transformCanvas.width = width * pixelRatio;
    transformCanvas.height = height * pixelRatio;

    // Scale the context to account for pixel ratio
    c.scale(pixelRatio, pixelRatio);
}

let originX = 0;
let originY = 0;
let isZooming = false;
let isPanning = false;
let scale = 0.5 * pixelRatio;

transformCanvas.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // Disable right-click context menu
});

// Handle zooming (via mouse wheel)
function handleZooming(e) {
    e.preventDefault();

    const scaleStep = 1.03;
    const scaleRate = 0.04;
    const scaleFactor = Math.pow(scaleStep, -e.deltaY * scaleRate);

    const mouseX = e.offsetX * pixelRatio;
    const mouseY = e.offsetY * pixelRatio;

    const mouseXInWorld = (mouseX - originX) / scale;
    const mouseYInWorld = (mouseY - originY) / scale;

    const newScale = Math.max(0.5, Math.min(scale * scaleFactor, 15));

    originX = mouseX - mouseXInWorld * newScale;
    originY = mouseY - mouseYInWorld * newScale;

    scale = newScale;

    if (!isZooming) {
        requestAnimationFrame(() => {
            draw();
            isZooming = false;
        });
        isZooming = true;
    }
}

transformCanvas.addEventListener('wheel', handleZooming);

// Handle panning (via right-click drag)
function handlePanning() {
    let startX = 0;
    let startY = 0;

    transformCanvas.addEventListener('mousedown', (e) => {
        if (e.button === 2) { // Right-click for panning
            isPanning = true;
            startX = (e.clientX * pixelRatio) - originX;
            startY = (e.clientY * pixelRatio) - originY;
            transformCanvas.style.cursor = 'grabbing';
        }
    });

    transformCanvas.addEventListener('mousemove', (e) => {
        if (isPanning) {
            originX = (e.clientX * pixelRatio) - startX;
            originY = (e.clientY * pixelRatio) - startY;
            draw();
        }
    });

    transformCanvas.addEventListener('mouseup', (e) => {
        if (isPanning && e.button === 2) {
            isPanning = false;
            transformCanvas.style.cursor = 'default'; // Reset cursor to grab after panning
        }
    });

    transformCanvas.addEventListener('mouseout', () => {
        if (isPanning) {
            isPanning = false;
            transformCanvas.style.cursor = 'default'; // Reset cursor when the mouse leaves the canvas
        }
    });
}

handlePanning();

// Draw grid with dynamic size based on zoom level
function drawGrid() {
    let smallGridSize;
    if (scale >= 3.5) {
        smallGridSize = 8;
    } else if (scale >= 1.75) {
        smallGridSize = 16;
    } else if (scale >= 1) {
        smallGridSize = 32;
    } else {
        smallGridSize = null;
    }

    if (smallGridSize) {
        c.strokeStyle = '#2B2F33';
        c.lineWidth = 1 / scale;
        const transformCanvasMinX = -originX / scale;
        const transformCanvasMinY = -originY / scale;
        const transformCanvasMaxX = transformCanvasMinX + transformCanvas.width / scale;
        const transformCanvasMaxY = transformCanvasMinY + transformCanvas.height / scale;

        let startX = Math.floor(transformCanvasMinX / smallGridSize) * smallGridSize;
        let startY = Math.floor(transformCanvasMinY / smallGridSize) * smallGridSize;

        for (let x = startX; x <= transformCanvasMaxX; x += smallGridSize) {
            c.beginPath();
            c.moveTo(x, transformCanvasMinY);
            c.lineTo(x, transformCanvasMaxY);
            c.stroke();
        }
        for (let y = startY; y <= transformCanvasMaxY; y += smallGridSize) {
            c.beginPath();
            c.moveTo(transformCanvasMinX, y);
            c.lineTo(transformCanvasMaxX, y);
            c.stroke();
        }
    }

    c.strokeStyle = '#4C5259';
    c.lineWidth = 1 / scale;
    const largeGridSize = 64;
    const transformCanvasMinX = -originX / scale;
    const transformCanvasMinY = -originY / scale;
    const transformCanvasMaxX = transformCanvasMinX + transformCanvas.width / scale;
    const transformCanvasMaxY = transformCanvasMinY + transformCanvas.height / scale;

    let startX = Math.floor(transformCanvasMinX / largeGridSize) * largeGridSize;
    let startY = Math.floor(transformCanvasMinY / largeGridSize) * largeGridSize;

    for (let x = startX; x <= transformCanvasMaxX; x += largeGridSize) {
        c.beginPath();
        c.moveTo(x, transformCanvasMinY);
        c.lineTo(x, transformCanvasMaxY);
        c.stroke();
    }
    for (let y = startY; y <= transformCanvasMaxY; y += largeGridSize) {
        c.beginPath();
        c.moveTo(transformCanvasMinX, y);
        c.lineTo(transformCanvasMaxX, y);
        c.stroke();
    }
}

// Draw rectangles
function drawRectangles() {
    rectangles.forEach((rect) => {
        c.fillStyle = rect.color;
        c.fillRect(rect.x, rect.y, rect.width, rect.height);
    });
}

// Main draw function
function draw() {
    c.clearRect(0, 0, transformCanvas.width, transformCanvas.height);
    c.save();

    // Apply zoom and panning transformations
    c.setTransform(scale, 0, 0, scale, originX, originY);

    // Draw grid and rectangles
    drawGrid();
    drawRectangles();

    c.restore();
}

// Mouse down event for dragging rectangles
transformCanvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Left mouse button for dragging rectangles
        const canvasRect = transformCanvas.getBoundingClientRect();
        const mouseX = (e.clientX - canvasRect.left) * pixelRatio / scale - originX / scale;
        const mouseY = (e.clientY - canvasRect.top) * pixelRatio / scale - originY / scale;

        for (let i = rectangles.length - 1; i >= 0; i--) {
            const rect = rectangles[i];
            if (
                mouseX >= rect.x &&
                mouseX <= rect.x + rect.width &&
                mouseY >= rect.y &&
                mouseY <= rect.y + rect.height
            ) {
                draggedRect = rect;
                offsetX = mouseX - rect.x;
                offsetY = mouseY - rect.y;
                rect.isDragging = true;

                rectangles.splice(i, 1);
                rectangles.push(draggedRect);

                transformCanvas.style.cursor = 'grabbing'; // Set cursor to grabbing while dragging
                break;
            }
        }
    }
});

// Mouse move event for dragging rectangles
transformCanvas.addEventListener('mousemove', (e) => {
    if (draggedRect && draggedRect.isDragging) {
        const canvasRect = transformCanvas.getBoundingClientRect();
        const mouseX = (e.clientX - canvasRect.left) * pixelRatio / scale - originX / scale;
        const mouseY = (e.clientY - canvasRect.top) * pixelRatio / scale - originY / scale;

        draggedRect.x = Math.round((mouseX - offsetX) / 8) * 8;
        draggedRect.y = Math.round((mouseY - offsetY) / 8) * 8;

        draw();
    }
});

// Mouse up event to stop dragging
transformCanvas.addEventListener('mouseup', () => {
    if (draggedRect) {
        draggedRect.isDragging = false;
        draggedRect = null;
        transformCanvas.style.cursor = 'default'; // Reset cursor after dragging
    }
});

// ResizeObserver to detect changes in canvas size
const resizeObserver = new ResizeObserver(() => {
    resizeTransformCanvasToDisplaySize();
    draw();
});

// Observe the canvas element
resizeObserver.observe(transformCanvas);

// Initialize canvas and handle resizing
function setupTransformCanvas() {
    resizeTransformCanvasToDisplaySize();
    draw();
}

window.addEventListener('resize', () => {
    resizeTransformCanvasToDisplaySize();
    draw();
});

setupTransformCanvas();