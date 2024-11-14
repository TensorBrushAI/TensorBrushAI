const socket = io();
socket.on("connect", () => {
    console.log("Connected to the server.");
});
socket.on("disconnect", () => {
    console.log("Disconnected from the server.");
});

const generateButton = document.getElementById("generate-button");
const cancelButton = document.getElementById("cancel-button");
const positivePrompt = document.getElementById("positive-prompt");
const outputImageContainer = document.getElementById("output-image-container");
const outputImagePlaceholderText = document.getElementById("output-image-placeholder-text");

generateButton.addEventListener("click", () => {
    const prompt = document.getElementById("positive-prompt").value;
    if (!prompt) {
        alert("Please enter a prompt.");
        return;
    }
    outputImagePlaceholderText.innerText = "Generating image...";
    socket.emit("start_generation", { prompt });
});

cancelButton.addEventListener("click", () => {
    socket.emit("cancel_generation");
});

socket.on("generation_completed", (data) => {
    console.log("Image generated:", data.filename);
    outputImagePlaceholderText.innerText = "";
    outputImageContainer.innerHTML = `<img id="output-image" src="/outputs/${data.filename}" alt="Generated Image">`;
});
