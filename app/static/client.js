// Connect to the SocketIO server
const socket = io();

// Function to start generation
function startGeneration() {
    const prompt = document.getElementById("prompt").value;
    
    if (!prompt) {
        alert("Please enter a prompt.");
        return;
    }

    // Send start_generation event with data
    socket.emit("start_generation", { prompt });
}

// Function to cancel generation
function cancelGeneration() {
    socket.emit("cancel_generation");
}

// Listen for generation_completed event from the server
socket.on("generation_completed", (data) => {
    const filename = data.filename;
    const imageUrl = `/outputs/${filename}`;

    // Display the generated image
    const generatedImage = document.getElementById("generatedImage");
    generatedImage.src = imageUrl;
    generatedImage.style.display = "block";
});

// Handle connection and disconnection events
socket.on("connect", () => {
    console.log("Connected to the server.");
});

socket.on("disconnect", () => {
    console.log("Disconnected from the server.");
});
