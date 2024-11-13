function updateImageSizer() {
    const containerWidth = composeCanvas.clientWidth - 40;
    const containerHeight = composeCanvas.clientHeight - 100;

    const height = parseFloat(heightInput.getAttribute('value'));
    const width = parseFloat(widthInput.getAttribute('value'));

    if (isNaN(height) || isNaN(width) || width <= 0 || height <= 0) {
        return;
    }

    const aspectRatio = width / height;

    // Determine the scaling factor to always make the canvas as large as possible
    let scaleFactor = Math.min(containerWidth / width, containerHeight / height);

    // Make sure the canvas scales to fill the container
    let newWidth = width * scaleFactor;
    let newHeight = height * scaleFactor;

    imageSizer.style.width = `${newWidth}px`;
    imageSizer.style.height = `${newHeight}px`;
    imageSizer.style.paddingBottom = '0';
}

// Create a MutationObserver to watch for changes to the attributes of the custom elements
const observer = new MutationObserver(updateImageSizer);

// Start observing the custom elements for attribute changes
observer.observe(heightInput, { attributes: true, attributeFilter: ['value'] });
observer.observe(widthInput, { attributes: true, attributeFilter: ['value'] });

// Update canvas on window/container resize
window.addEventListener('resize', updateImageSizer);

// Initial canvas update
updateImageSizer();

// Clear the output image while resizing
heightInput.addEventListener('mousedown', () => {
    composeImage.style.opacity = '0%';
    imageSizer.style.opacity = '100%';
});
widthInput.addEventListener('mousedown', () => {
    composeImage.style.opacity = '0%';
    imageSizer.style.opacity = '100%';
});
document.addEventListener('mouseup', () => {
    composeImage.style.opacity = '100%';
    imageSizer.style.opacity = '0%';
});