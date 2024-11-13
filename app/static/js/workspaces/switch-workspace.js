function switchWorkspace(workspace, workspaceButton, bodyClass) {
    // Remove 'active' class from all workspaces and buttons
    composeWorkspace.classList.remove('active');
    transformWorkspace.classList.remove('active');
    enhanceWorkspace.classList.remove('active');
    
    composeWorkspaceButton.classList.remove('active');
    transformWorkspaceButton.classList.remove('active');
    enhanceWorkspaceButton.classList.remove('active');

    // Add 'active' class to the selected workspace and button
    workspace.classList.add('active');
    workspaceButton.classList.add('active');

    // Update body class to match the selected workspace
    body.classList.remove('compose', 'transform', 'enhance'); // Remove any previous workspace class
    body.classList.add(bodyClass); // Add the current workspace class
}

// Event listeners for buttons
composeWorkspaceButton.addEventListener('click', () => switchWorkspace(composeWorkspace, composeWorkspaceButton, 'compose'));
transformWorkspaceButton.addEventListener('click', () => switchWorkspace(transformWorkspace, transformWorkspaceButton, 'transform'));
enhanceWorkspaceButton.addEventListener('click', () => switchWorkspace(enhanceWorkspace, enhanceWorkspaceButton, 'enhance'));

// Optionally, set the initial workspace state
switchWorkspace(composeWorkspace, composeWorkspaceButton, 'compose');