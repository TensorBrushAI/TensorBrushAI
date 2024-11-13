let composeIsDragging = false;
let composeOffsetX, composeOffsetY;
let composeCurrentScale = 1; // To track zoom level
const composeMinScale = 0.1; // Minimum zoom level
const composeMaxScale = 5;   // Maximum zoom level

// Function to get bounds
function getComposeCanvasBounds() {
    const rect = composeCanvas.getBoundingClientRect();
    const style = window.getComputedStyle(composeCanvas);
    const border = {
        left: parseInt(style.borderLeftWidth, 10),
        top: parseInt(style.borderTopWidth, 10),
        right: parseInt(style.borderRightWidth, 10),
        bottom: parseInt(style.borderBottomWidth, 10)
    };

    return {
        left: rect.left + border.left,
        top: rect.top + border.top,
        right: rect.right - border.right,
        bottom: rect.bottom - border.bottom
    };
}

// Function to center the image
function centerComposeImage(resetScale = false) {
    if (resetScale) {
        composeCurrentScale = 1; // Reset the zoom level to default
    }

    const canvasWidth = composeCanvas.clientWidth;
    const canvasHeight = composeCanvas.clientHeight;
    const imageWidth = composeImage.clientWidth * composeCurrentScale;
    const imageHeight = composeImage.clientHeight * composeCurrentScale;

    const newX = (canvasWidth - imageWidth) / 2;
    const newY = (canvasHeight - imageHeight) / 2;

    composeImage.style.left = `${newX}px`;
    composeImage.style.top = `${newY}px`;
    composeImage.style.transform = `scale(${composeCurrentScale})`;
}

// Add dragging functionality
composeCanvas.addEventListener('mousedown', (e) => {
    if (e.buttons === 1 || e.buttons === 2 || e.buttons === 3) { // Check for left (1), right (2), or both (3)
        composeIsDragging = true;
        composeCanvas.style.cursor = 'grabbing';  // Set cursor to grabbing on the container
        composeOffsetX = e.clientX - composeImage.offsetLeft;
        composeOffsetY = e.clientY - composeImage.offsetTop;
        e.preventDefault(); // Prevent default actions for both mouse buttons

        document.addEventListener('mousemove', composeOnMouseMove);
        document.addEventListener('mouseup', composeOnMouseUp);
    }

    function composeOnMouseMove(e) {
        const bounds = getComposeCanvasBounds();
        let constrainedX = Math.max(bounds.left, Math.min(e.clientX, bounds.right));
        let constrainedY = Math.max(bounds.top, Math.min(e.clientY, bounds.bottom));
        let newX = constrainedX - composeOffsetX;
        let newY = constrainedY - composeOffsetY;

        composeImage.style.left = `${newX}px`;
        composeImage.style.top = `${newY}px`;
    }

    function composeOnMouseUp() {
        composeIsDragging = false;
        composeCanvas.style.cursor = 'grab';  // Set cursor to grab on the container when dragging stops
        document.removeEventListener('mousemove', composeOnMouseMove);
        document.removeEventListener('mouseup', composeOnMouseUp);
    }
});

// Prevent the context menu from showing on right-click
composeCanvas.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // Prevent context menu on right-click
});

// Add scroll zoom functionality
composeCanvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001; // Adjust zoom sensitivity here

    // Adjust the scale, but keep it within minScale and maxScale
    composeCurrentScale = Math.min(composeMaxScale, Math.max(composeMinScale, composeCurrentScale + scaleAmount));

    composeImage.style.transform = `scale(${composeCurrentScale})`;
});

// Reset button functionality
composeResetButton.addEventListener('click', () => {
    centerComposeImage(true); // Reset zoom level and center the image
});

// Listen for window resize to recenter and reset the image size
window.addEventListener('resize', () => centerComposeImage(true));

// Double-click to reset the image
composeCanvas.addEventListener('dblclick', () => {
    centerComposeImage(true); // Reset zoom level and center the image
});