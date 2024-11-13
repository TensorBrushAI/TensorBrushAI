// Variables for tracking panel width resizing
let isResizingLeftWidth = false;
let isResizingRightWidth = false;

// Variables for tracking panel height resizing (content within panels)
let isResizingLeftHeight = false;
let isResizingRightHeight = false;
let startY = 0;
let startHeightContent2 = 0;
let startHeightContent1 = 0;

// Variable to track the previous viewport width
let previousWidth = getAvailableWidth();

// Helper function to get total viewport width
function getAvailableWidth() {
    return window.innerWidth;  // 100vw equivalent
}

// Left resizer event
resizerLeft.addEventListener('mousedown', (e) => {
    isResizingLeftWidth = true;
    resizerLeft.classList.add('active');
    document.addEventListener('mousemove', resizeLeftPanelWidth);
    document.addEventListener('mouseup', stopResizingWidth);
});

// Right resizer event
resizerRight.addEventListener('mousedown', (e) => {
    isResizingRightWidth = true;
    resizerRight.classList.add('active');
    document.addEventListener('mousemove', resizeRightPanelWidth);
    document.addEventListener('mouseup', stopResizingWidth);
});

function resizeLeftPanelWidth(e) {
    if (!isResizingLeftWidth) return;

    const containerRect = document.querySelector('main').getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;

    if (newWidth < 80) {
        leftPanel.style.display = 'none';
        resizerLeft.style.display = 'none';
        document.getElementById('toggle-left-panel').style.display = 'flex';
    } else {
        leftPanel.style.display = 'flex';
        resizerLeft.style.display = 'block';
        leftPanel.style.width = `${newWidth}px`;
        document.getElementById('toggle-left-panel').style.display = 'none';
    }
}

function resizeRightPanelWidth(e) {
    if (!isResizingRightWidth) return;

    const containerRect = document.querySelector('main').getBoundingClientRect();
    const newWidth = containerRect.right - e.clientX;

    if (newWidth < 80) {
        rightPanel.style.display = 'none';
        resizerRight.style.display = 'none';
        document.getElementById('toggle-right-panel').style.display = 'flex';
    } else {
        rightPanel.style.display = 'flex';
        resizerRight.style.display = 'block';
        rightPanel.style.width = `${newWidth}px`;
        document.getElementById('toggle-right-panel').style.display = 'none';
    }
}

toggleLeftPanel.addEventListener('click', () => {
    openPanel('left');
});

toggleRightPanel.addEventListener('click', () => {
    openPanel('right');
});

// Stop width resizing and correct panel width if necessary
function stopResizingWidth() {
    const leftPanelWidth = leftPanel.getBoundingClientRect().width;
    const rightPanelWidth = rightPanel.getBoundingClientRect().width;

    // Calculate the total width of the main container (including side panels and middle panel)
    let totalMiddlePanelWidth = 0;
    Array.from(middlePanel).forEach(panel => {
        totalMiddlePanelWidth += panel.getBoundingClientRect().width;
    });

    const totalWidth = leftPanelWidth + rightPanelWidth + totalMiddlePanelWidth + 64; // 40px of body padding + 24px of gap between panels
    const availableWidth = getAvailableWidth();

    // If a panel is collapsed, prevent resizing the opposite panel unnecessarily
    if (leftPanel.style.display === 'none') {
        // If the left panel is collapsed, make sure the right panel stays at 25%
        rightPanel.style.width = '25%';
        // No need to resize the right panel unless it's overflowing
    } else if (rightPanel.style.display === 'none') {
        // If the right panel is collapsed, make sure the left panel stays at 25%
        leftPanel.style.width = '25%';
        // No need to resize the left panel unless it's overflowing
    } else {
        // Check if the total width exceeds the available viewport width
        if (totalWidth > availableWidth) {
            let overflowAmount = totalWidth - availableWidth;

            // Adjust the panel that was resized (either left or right), not both
            if (isResizingLeftWidth) {
                const newLeftWidth = Math.max(leftPanelWidth - overflowAmount, 80);
                leftPanel.style.width = `${newLeftWidth}px`;

                // Recalculate total width after adjusting the left panel
                const newTotalWidth = newLeftWidth + rightPanelWidth + totalMiddlePanelWidth + 64;
                if (newTotalWidth > availableWidth && rightPanelWidth > 80) {
                    const newRightWidth = Math.max(rightPanelWidth - (newTotalWidth - availableWidth), 80);
                    rightPanel.style.width = `${newRightWidth}px`;
                }
            }

            if (isResizingRightWidth) {
                const newRightWidth = Math.max(rightPanelWidth - overflowAmount, 80);
                rightPanel.style.width = `${newRightWidth}px`;

                // Recalculate total width after adjusting the right panel
                const newTotalWidth = leftPanelWidth + newRightWidth + totalMiddlePanelWidth + 64;
                if (newTotalWidth > availableWidth && leftPanelWidth > 80) {
                    const newLeftWidth = Math.max(leftPanelWidth - (newTotalWidth - availableWidth), 80);
                    leftPanel.style.width = `${newLeftWidth}px`;
                }
            }
        }
    }

    // Reset resizing states and cleanup event listeners
    isResizingLeftWidth = false;
    isResizingRightWidth = false;
    resizerLeft.classList.remove('active');
    resizerRight.classList.remove('active');
    document.removeEventListener('mousemove', resizeLeftPanelWidth);
    document.removeEventListener('mousemove', resizeRightPanelWidth);
    document.removeEventListener('mouseup', stopResizingWidth);
}

// Listen to window resize events
window.addEventListener('resize', handleResize);

// Also check viewport width on window load
window.addEventListener('load', handleResize);

// Function to handle resizing logic
function handleResize() {
    const availableWidth = getAvailableWidth();
    
    if (availableWidth < 990) {
        // Check if both panels are open
        const isLeftPanelOpen = leftPanel.style.display === 'flex' || leftPanel.style.display === '';
        const isRightPanelOpen = rightPanel.style.display === 'flex' || rightPanel.style.display === '';
        
        if (isLeftPanelOpen && isRightPanelOpen) {
            // If both panels are open, close the right panel and keep the left one open
            closePanel('right');
            openPanel('left');
        }
    } else {
        // Handle when resizing from below 990px to above 990px
        if (previousWidth < 990 && availableWidth >= 990) {
            const isLeftPanelOpen = leftPanel.style.display === 'flex' || leftPanel.style.display === '';
            const isRightPanelOpen = rightPanel.style.display === 'flex' || rightPanel.style.display === '';

            // If one panel is closed and the other is open, open the closed panel
            if (isLeftPanelOpen && !isRightPanelOpen) {
                openPanel('right');
            } else if (!isLeftPanelOpen && isRightPanelOpen) {
                openPanel('left');
            }
            // If both panels are closed, do nothing
        }
    }

    // Update the previous width for the next resize event
    previousWidth = availableWidth;
}

// Function to open a panel
function openPanel(panel) {
    if (panel === 'left') {
        leftPanel.style.display = 'flex';  // Show the left panel
        leftPanel.style.width = '25%';    // Set its width
        resizerLeft.style.display = 'block';  // Show the left resizer
        toggleLeftPanel.style.display = 'none';  // Hide the toggle button

        // Ensure the right panel is closed if viewport width is less than 990px and both panels are not allowed to be open
        if (getAvailableWidth() < 990 && rightPanel.style.display === 'flex') {
            closePanel('right');
        }
    } else if (panel === 'right') {
        rightPanel.style.display = 'flex';  // Show the right panel
        rightPanel.style.width = '25%';    // Set its width
        resizerRight.style.display = 'block';  // Show the right resizer
        toggleRightPanel.style.display = 'none';  // Hide the toggle button

        // Ensure the left panel is closed if viewport width is less than 990px and both panels are not allowed to be open
        if (getAvailableWidth() < 990 && leftPanel.style.display === 'flex') {
            closePanel('left');
        }
    }
}

// Function to close a panel
function closePanel(panel) {
    if (panel === 'left') {
        leftPanel.style.display = 'none';
        resizerLeft.style.display = 'none';
        toggleLeftPanel.style.display = 'flex';
    } else if (panel === 'right') {
        rightPanel.style.display = 'none';
        resizerRight.style.display = 'none';
        toggleRightPanel.style.display = 'flex';
    }
}

function togglePanelContent(contentElement, imgElement) {
    const isCollapsed = contentElement.clientHeight === 40 || contentElement.style.height === '0px';

    if (isCollapsed) {
        // Expand the panel
        contentElement.style.overflow = 'hidden';
        contentElement.style.height = contentElement.scrollHeight + 'px';
        imgElement.classList.remove('rotated'); // Rotate the image
        
        contentElement.addEventListener('transitionend', function handler() {
            contentElement.style.height = 'auto';
            contentElement.style.overflow = 'unset';
            contentElement.removeEventListener('transitionend', handler);
        });
    } else {
        // Collapse the panel
        const startHeight = contentElement.scrollHeight + 'px';
        contentElement.style.height = startHeight;
        contentElement.offsetHeight; // Trigger reflow
        contentElement.style.height = '40px';
        contentElement.style.overflow = 'hidden';
        imgElement.classList.add('rotated'); // Reset the image rotation
    }
}

// Example usage for left and right panels
leftPanelHeader2.addEventListener('click', () => {
    const imgElement = leftPanelHeader2.querySelector('img'); // Assuming the img is inside the header
    togglePanelContent(leftPanelContent2, imgElement);
});

rightPanelHeader1.addEventListener('click', () => {
    const imgElement = rightPanelHeader1.querySelector('img');
    togglePanelContent(rightPanelContent1, imgElement);
});

rightPanelHeader2.addEventListener('click', () => {
    const imgElement = rightPanelHeader2.querySelector('img');
    togglePanelContent(rightPanelContent2, imgElement);
});

// Prevent subpanel from collapsing with header button clicks.
document.querySelectorAll('.side-panel-header-button, .gallery-button').forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});