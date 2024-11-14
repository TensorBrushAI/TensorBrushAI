import os
import random
import torch
from diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler
from .device import device, precision
from app import socketio

model_path = "models/ReMixxxPonyXL-V1.0.safetensors"
pipeline = None

def load_pipeline():
    global pipeline
    pipeline = None
    pipeline = StableDiffusionXLPipeline.from_single_file(model_path, torch_dtype=precision).to(device)
    pipeline.scheduler = EulerAncestralDiscreteScheduler.from_config(pipeline.scheduler.config)
    return pipeline

def start_generation(data):
    global pipeline
    if pipeline is None:
        pipeline = load_pipeline()

    prompt = data.get("prompt", "Masterpiece, Best Quality, Incredible, Beautiful, Wonderful, Amazing")
    negative_prompt = data.get("negative_prompt", "")
    iterations = data.get("iterations", 1)
    guidance = data.get("guidance", 7)
    width = data.get("width", 80)
    height = data.get("height", 80)
    seed = data.get("seed", None)

    if seed is None:
        seed = random.randint(0, 2**32 - 1)
    generator = torch.Generator().manual_seed(seed)

    print("Starting generation...")
    output = pipeline(
        prompt=prompt,
        negative_prompt=negative_prompt,
        num_inference_steps=iterations,
        guidance_scale=guidance,
        width=width,
        height=height,
        generator=generator
    )

    os.makedirs("outputs", exist_ok=True)
    filename = next(
        (f"{seed}-{i}.png" for i in range(1, 1000)
            if not os.path.exists(os.path.join("outputs", f"{seed}-{i}.png"))),
        f"{seed}.png"
    )
    filepath = os.path.join("outputs", filename)
    output.images[0].save(filepath)
    print(f"Image saved to {filepath}")

    socketio.emit("generation_completed", {"filename": filename})
