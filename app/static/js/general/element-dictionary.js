// Base Elements
const body = document.body;

// Generation Control and Progress
const generateButton = document.getElementById('generate-button');
const cancelButton = document.getElementById('cancel-button');
const progressFill = document.getElementById('progress-fill');


// Generation Parameter Elements
const modelSelect = document.getElementById('model-input');
const positivePrompt = document.getElementById('positive-prompt');
const negativePrompt = document.getElementById('negative-prompt');
const schedulerSelect = document.getElementById('scheduler-input');
const iterationsInput = document.getElementById('iterations-input');
const guidanceInput = document.getElementById('guidance-input');
const widthInput = document.getElementById('width-input');
const heightInput = document.getElementById('height-input');
const seedInput = document.getElementById('seed-input');


// Seed Controls
const recycleButton = document.getElementById('recycle-button');
const randomButton = document.getElementById('random-button');


// Context Menus
const contextMenu = document.getElementById('context-menu');
const deleteImageOption = document.getElementById('delete-image');


// Image Gallery
const galleryUpButton = document.getElementById('gallery-up-button');
const galleryDownButton = document.getElementById('gallery-down-button');
const thumbnailSizeUpButton = document.getElementById('thumbnail-size-up-button');
const thumbnailSizeDownButton = document.getElementById('thumbnail-size-down-button');
const imageGallery = document.getElementById('image-gallery');
const composeResetButton = document.getElementById('reset-image-size-button');
const viewLatentPreviews = document.getElementById('view-latent-previews');
const generationPercentage = document.getElementById('generation-percentage');


// Queue Controls
const queueButton = document.getElementById('queue-button');
const promptingContainer = document.getElementById('prompting-container');
const queueContainer = document.getElementById('queue-container');
const cancelAllButton = document.getElementById('cancel-queue');
const queueCounter = document.getElementById('queue-counter');


// General UI Control Elements
const leftPanel = document.getElementById('left-panel');
const middlePanel = document.getElementsByClassName('middle-panel');
const rightPanel = document.getElementById('right-panel');
const resizerLeft = document.getElementById('resizer-left');
const resizerRight = document.getElementById('resizer-right');
const toggleLeftPanel = document.getElementById('toggle-left-panel');
const toggleRightPanel = document.getElementById('toggle-right-panel');
const leftPanelHeader2 = document.getElementById('left-panel-header-2');
const leftPanelContent1 = document.getElementById('left-subpanel-1');
const leftPanelContent2 = document.getElementById('left-subpanel-2');
const rightPanelHeader1 = document.getElementById('right-panel-header-1');
const rightPanelContent1 = document.getElementById('right-subpanel-1');
const rightPanelHeader2 = document.getElementById('right-panel-header-2');
const rightPanelContent2 = document.getElementById('right-subpanel-2');


// Compose Workspace
const composeWorkspace = document.getElementById('compose-workspace');
const composeWorkspaceButton = document.getElementById('compose-workspace-button');
const composeCanvas = document.getElementById('compose-workspace-canvas');
const imageSizer = document.getElementById('image-sizer');
const composeImage = document.getElementById('compose-image');


// Transform Workspace
const transformWorkspace = document.getElementById('transform-workspace');
const transformWorkspaceButton = document.getElementById('transform-workspace-button');
const transformCanvas = document.getElementById('transform-workspace-canvas');


// Enhance Workspace
const enhanceWorkspace = document.getElementById('enhance-workspace');
const enhanceWorkspaceButton = document.getElementById('enhance-workspace-button');