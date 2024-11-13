from flask_socketio import SocketIO, emit
from ..inference.txt2img import generate_image
from ..core.pipeline import reload_pipeline

socketio = SocketIO()

@socketio.on("generate_image")
def handle_generate_image(data):
    required_params = ["prompt", "negative_prompt", "iterations", "guidance", "width", "height"]
    missing_params = [param for param in required_params if param not in data]

    if missing_params:
        emit("error", {"message": f"Missing required parameters: {', '.join(missing_params)}"})
        return

    prompt = data["prompt"]
    negative_prompt = data["negative_prompt"]
    iterations = data["iterations"]
    guidance = data["guidance"]
    width = data["width"]
    height = data["height"]
    seed = data.get("seed")

    print("Generating image from socket event...")
    image_path = generate_image(prompt, negative_prompt, iterations, guidance, width, height, seed)

    emit("image_generated", {"image_path": image_path})

@socketio.on("component_reload_pipeline")
def handle_component_reload_pipeline(data):
    print("Client requested pipeline reload with new components...")
    reload_pipeline()
    emit("pipeline_reloaded", {"message": "Pipeline reloaded successfully with new components."})
