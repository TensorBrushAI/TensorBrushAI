let currentColumns = 3;

thumbnailSizeDownButton.addEventListener('click', () => {
    if (currentColumns < 5) { // Maximum 5 columns
        currentColumns += 1;
        updateGalleryColumns();
    }
});

thumbnailSizeUpButton.addEventListener('click', () => {
    if (currentColumns > 1) { // Minimum 1 column
        currentColumns -= 1;
        updateGalleryColumns();
    }
});

// Function to update the number of columns in the gallery
function updateGalleryColumns() {
    imageGallery.style.gridTemplateColumns = `repeat(${currentColumns}, 1fr)`; // Properly using imageGallery
}

// IMAGE AND THUMBNAIL UPDATING /////////////////////////////////
let selectedImage = null;  // Track the currently selected image
let selectedImageForDeletion = null;  // Track which image is selected for deletion
composeImage.src = '/outputs/image-utils/empty.png';

// Fetch and display image paths (thumbnails and full-size)
function fetchImagePaths() {
    fetch('/api/thumbnails')
        .then(response => response.json())
        .then(imageFilenames => {
            if (imageFilenames.length === 0) {
                // If there are no images, display empty.png as the full-size image
                updateFullSizeImage('/outputs/image-utils/empty.png');
                return;  // Exit the function early as there are no images to display
            }

            const imagePaths = imageFilenames.map(filename => ({
                fullSizePath: `/outputs/${filename}`,
                thumbnailPath: `/outputs/image-utils/thumbnails/thumb_${filename}`,
                seed: extractSeedFromFilename(filename)
            }));

            updateGallery(imagePaths); // Update gallery with new images
        })
        .catch(error => console.error('Error fetching image paths:', error));
}

fetchImagePaths()

// Update the full-size image
function updateFullSizeImage(fullSizeImagePath) {
    composeImage.src = fullSizeImagePath;
}

// Update the latent preview image with the correct path
function refreshLatentPreview() {
    const timestamp = new Date().getTime();
    const latentPreviewPath = `/outputs/image-utils/intermediate.png?${timestamp}`;
    
    const viewLatentPreviews = document.getElementById('view-latent-previews');
    
    // Check if the latent preview item has the 'selected' class
    if (viewLatentPreviews.classList.contains('selected')) {
        composeImage.src = latentPreviewPath;
    }
}

// Update gallery with thumbnails and ensure latent preview item is not affected
function updateGallery(imagePaths) {
    // Preserve the latent preview item before clearing dynamic images
    const latentPreviewItem = document.getElementById('view-latent-previews');

    // Clear dynamically generated images (skip static latent preview item)
    const dynamicImages = imageGallery.querySelectorAll('.dynamic-image');
    dynamicImages.forEach(image => image.remove());

    let firstGalleryItem = null; // To keep track of the first item
    let firstImageFullSizePath = ''; // To store the full-size path of the first image

    const reversedImagePaths = imagePaths.slice().reverse(); // Reverse the array without modifying the original

    reversedImagePaths.forEach((image, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.classList.add('image-gallery-item', 'dynamic-image'); // Add class to identify dynamic images

        const img = document.createElement('img');
        img.src = image.thumbnailPath;
        img.alt = 'Thumbnail Image';

        // Thumbnail click event to update full-size image
        img.addEventListener('click', () => {
            updateFullSizeImage(image.fullSizePath); // Show full-size image
            updateSelectedThumbnail(galleryItem);    // Update selected thumbnail styling
        });

        // Right-click context menu for deletion
        img.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            selectedImageForDeletion = galleryItem;
            showContextMenu(event.pageX, event.pageY);
        });

        galleryItem.appendChild(img);
        imageGallery.appendChild(galleryItem);

        // Keep track of the first gallery item and first image path
        if (index === 0) {
            firstGalleryItem = galleryItem;
            firstImageFullSizePath = image.fullSizePath;
        }
    });

    // Re-add the latent preview item at the top of the gallery (if not already present)
    if (!imageGallery.contains(latentPreviewItem)) {
        imageGallery.prepend(latentPreviewItem);
    }

    if (firstGalleryItem) {
        // Select and display the first image
        updateFullSizeImage(firstImageFullSizePath);
        updateSelectedThumbnail(firstGalleryItem);
    } else {
        // No images, clear the full-size image display
        updateFullSizeImage('');
        selectedImage = null;
    }
}

// Make latent preview item selectable and trigger latent previews
document.getElementById('view-latent-previews').addEventListener('click', () => {
    const latentPreviewItem = document.getElementById('view-latent-previews');
    
    // Deselect the currently selected image
    if (selectedImage) {
        selectedImage.classList.remove('selected');
    }
    
    // Mark the latent preview item as selected
    latentPreviewItem.classList.add('selected');
    selectedImage = latentPreviewItem; // Track the selected item
    
    // Display the latent preview images
    refreshLatentPreview();
});

// Update the selected thumbnail's style
function updateSelectedThumbnail(galleryItem) {
    if (selectedImage) {
        selectedImage.classList.remove('selected');
    }
    if (galleryItem) {
        galleryItem.classList.add('selected');
        selectedImage = galleryItem;
    } else {
        selectedImage = null;
    }
}

// Show the custom context menu
function showContextMenu(x, y) {
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.display = 'flex';
}

// Hide the custom context menu
function hideContextMenu() {
    contextMenu.style.display = 'none';
}

// Handle image deletion process
deleteImageOption.addEventListener('click', () => {
    if (!selectedImageForDeletion) return;

    const imgSrc = selectedImageForDeletion.querySelector('img').src;
    const seed = extractSeedFromSrc(imgSrc);

    fetch('/api/delete_image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Image deleted successfully');
            handleImageDeletion(seed);
        } else {
            console.error('Failed to delete image:', data.error);
        }
    })
    .catch(error => console.error('Error deleting image:', error));

    hideContextMenu();
});

// Handle image deletion (removing thumbnails and updating full-size image)
function handleImageDeletion(seed) {
    // Get the list of gallery items before deletion
    const galleryItemsBeforeDeletion = [...imageGallery.querySelectorAll('.dynamic-image')]; // Only target dynamic images

    // Find the index of the deleted image in the gallery before deletion
    const deletedIndex = galleryItemsBeforeDeletion.findIndex(galleryItem => {
        const itemSeed = extractSeedFromSrc(galleryItem.querySelector('img').src);
        return itemSeed === seed;
    });

    // Remove the selected image from the DOM
    selectedImageForDeletion.remove();
    selectedImageForDeletion = null;

    // Get the updated list of gallery items after deletion
    const updatedGalleryItems = [...imageGallery.querySelectorAll('.dynamic-image')];

    // If no images remain, clear the full-size image and reset selection
    if (updatedGalleryItems.length === 0) {
        composeImage.src = '/outputs/image-utils/empty.png';  // Clear full-size image
        selectedImage = null;     // Clear selected image
        return;  // Exit the function early
    }

    // Check if the deleted image was the currently selected image
    if (selectedImage) {
        const selectedImageSeed = extractSeedFromSrc(selectedImage.querySelector('img').src);
        if (selectedImageSeed === seed) {
            // The selected image was deleted
            let nextSelectedImage = null;
            if (updatedGalleryItems.length > 0) {
                let nextIndex;
                if (deletedIndex >= updatedGalleryItems.length) {
                    // Deleted image was the last one, select the new last image
                    nextIndex = updatedGalleryItems.length - 1;
                } else {
                    // Select the image at the same index (the one that filled the gap)
                    nextIndex = deletedIndex;
                }

                if (nextIndex >= 0) {
                    nextSelectedImage = updatedGalleryItems[nextIndex];
                    const nextImageFullSizePath = nextSelectedImage.querySelector('img').src.replace('/image-utils/thumbnails/thumb_', '/');
                    updateFullSizeImage(nextImageFullSizePath);
                    updateSelectedThumbnail(nextSelectedImage);
                }
            }
        }
    }
}

// Helper function to extract seed from image src
function extractSeedFromSrc(src) {
    const filename = src.split('/').pop();
    return extractSeedFromFilename(filename);
}

// Helper function to extract seed from filename
function extractSeedFromFilename(filename) {
    return filename.replace('thumb_', '').replace('.png', '');
}

// Hide context menu when clicking outside of it
document.addEventListener('click', (event) => {
    if (!contextMenu.contains(event.target)) {
        hideContextMenu();
    }
});