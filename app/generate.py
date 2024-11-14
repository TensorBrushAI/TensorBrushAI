import os
import random
import torch
from diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler
from app import socketio

# INITIALIZE PIPELINE
pipeline = None
def load_pipeline():
    global pipeline
    pipeline = None
    pipeline = StableDiffusionXLPipeline.from_single_file("models/ReMixxxPonyXL-V1.0.safetensors", use_safetensors=True, safety_checker=None, variant="fp16", torch_dtype=torch.float16).to("mps")
    pipeline.scheduler = EulerAncestralDiscreteScheduler.from_config(pipeline.scheduler.config)
    return pipeline

# CANCEL GENERATION
cancel_flag = False
def cancel_generation():
    global cancel_flag
    cancel_flag = True
def interrupt_callback(pipeline, i, t, callback_kwargs):
    if cancel_flag:
        pipeline._interrupt = True
    return callback_kwargs

# START GENERATION
def start_generation(data):
    global pipeline, cancel_flag
    cancel_flag = False
    if pipeline is None:
        pipeline = load_pipeline()

    # Collect data passed to start_generation from client emit.
    prompt = data.get("prompt", "Masterpiece, Best Quality, Incredible, Beautiful, Wonderful, Amazing")
    negative_prompt = data.get("negative_prompt", "")
    iterations = int(data.get("iterations", 25))
    guidance = float(data.get("guidance", 5))
    width = int(data.get("width", 768))
    height = int(data.get("height", 768))
    seed = data.get("seed", None)

    # Generate a random seed if seed is None.
    if seed is None:
        seed = random.randint(0, 2**32 - 1)
    generator = torch.Generator().manual_seed(seed)

    # Generate an output with the loaded pipeline and data.
    print("Starting generation...")
    output = pipeline(
        prompt=prompt,
        negative_prompt=negative_prompt,
        num_inference_steps=iterations,
        guidance_scale=guidance,
        width=width,
        height=height,
        generator=generator,
        callback_on_step_end=interrupt_callback
    )

    # Check if the generation was interrupted.
    if getattr(pipeline, "_interrupt", False):
        print("Generation cancelled.")

    # Save the output and emit filename to client.
    os.makedirs("outputs", exist_ok=True)
    filename = next(
        (f"{seed}-{i}.png" for i in range(1, 1000)
            if not os.path.exists(os.path.join("outputs", f"{seed}-{i}.png"))),
        f"{seed}.png"
    )
    filepath = os.path.join("outputs", filename)
    output.images[0].save(filepath)
    print(f"Image saved to outputs as {filename}.")
    socketio.emit("generation_completed", {"filename": filename})

