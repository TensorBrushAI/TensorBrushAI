const socket = io();

socket.on("connect", () => console.log("Connected to the server."));
socket.on("disconnect", () => console.log("Disconnected from the server."));

const generateButton = document.getElementById("generate-button");
const cancelButton = document.getElementById("cancel-button");
const progressBar = document.getElementById("progress-bar");
const outputImageContainer = document.getElementById("output-image-container");
const outputImagePlaceholderText = document.getElementById("output-image-placeholder-text");
const showQueueButton = document.getElementById("show-queue-button");
const queueContainer = document.getElementById("queue-container");

generateButton.addEventListener("click", () => {
    const prompt = document.getElementById("positive-prompt").value;
    if (!prompt) {
        alert("Please enter a prompt.");
        return;
    }
    socket.emit("start_generation", { prompt });
});

cancelButton.addEventListener("click", () => socket.emit("cancel_generation"));

document.querySelector(".cancel-all-queue-items").addEventListener("click", () => {
    socket.emit("cancel_all_queue_items");
});

socket.on("progress_update", (data) => {
    progressBar.style.width = `${data.percentage}%`;
});

socket.on("refresh_intermediate", () => {
    outputImagePlaceholderText.innerText = "";
    let outputImage = document.getElementById("output-image");
    if (!outputImage) {
        outputImage = document.createElement("img");
        outputImage.id = "output-image";
        outputImageContainer.appendChild(outputImage);
    }
    outputImage.src = `/outputs/image_utils/intermediate.png?t=${new Date().getTime()}`;
    outputImage.alt = "Intermediate Image";
});

socket.on("generation_completed", (data) => {
    outputImagePlaceholderText.innerText = "";
    let outputImage = document.getElementById("output-image");
    if (!outputImage) {
        outputImage = document.createElement("img");
        outputImage.id = "output-image";
        outputImageContainer.appendChild(outputImage);
    }
    outputImage.src = `/outputs/${data.filename}`;
    outputImage.alt = "Generated Image";
});

showQueueButton.addEventListener("click", () => {
    const isHidden = queueContainer.style.display === 'none' || queueContainer.style.display === '';
    queueContainer.style.display = isHidden ? 'block' : 'none';
});

socket.on("update_queue", (data) => {
    updateQueueUI(data.queue);
});

function updateQueueUI(queue) {
    const queueList = document.getElementById("queue-list");
    queueList.innerHTML = queue
        .map((task, i) => `
            <div class="queue-item" data-index="${i}">
                <div class="queue-item-left">
                    <p class="queue-item-seed">${task.seed || "Random"}</p>
                    <p class="queue-item-prompt">${task.prompt}</p>
                </div>
                <button class="cancel-queue-item">CANCEL</button>
            </div>
        `)
        .join("");

    document.querySelectorAll(".cancel-queue-item").forEach((button) => {
        button.addEventListener("click", (event) => {
            const queueItem = event.target.closest(".queue-item");
            const index = queueItem.getAttribute("data-index");
            socket.emit("cancel_queue_item", { index: parseInt(index, 10) });
        });
    });
}

