import os
import random
import torch
from app import socketio
from diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler
from tqdm import tqdm
from .device import device, precision

# INITIALIZE PIPELINE
pipeline = None
def load_pipeline():
    global pipeline
    pipeline = None
    pipeline = StableDiffusionXLPipeline.from_single_file(
        "models/ReMixxxPonyXL-V1.0.safetensors",
        use_safetensors=True,
        safety_checker=None,
        variant="fp16",
        torch_dtype=precision
    ).to(device)
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

# PROGRESS PERCENTAGE
class InterceptingProgressBar(tqdm):
    def __init__(self, *args, **kwargs):
        self.socketio = kwargs.pop("socketio", None)
        super().__init__(*args, **kwargs)

    def update(self, n=1):
        super().update(n)
        if self.total:
            percentage = round((self.n / self.total) * 100)
            if self.socketio:
                self.socketio.emit("progress_update", {"percentage": percentage})

# START GENERATION
def start_generation(data):
    global pipeline, cancel_flag
    cancel_flag = False
    if pipeline is None:
        pipeline = load_pipeline()

    prompt = data.get("prompt", "beautiful tropical beach in Bali")
    negative_prompt = data.get("negative_prompt", "")
    iterations = int(data.get("iterations", 30))
    guidance = float(data.get("guidance", 7))
    width = int(data.get("width", 1024))
    height = int(data.get("height", 1024))
    seed = data.get("seed", None)

    if seed is None:
        seed = random.randint(0, 2**32 - 1)
    generator = torch.Generator().manual_seed(seed)

    original_progress_bar = pipeline.progress_bar
    pipeline.progress_bar = lambda iterable=None, total=None: InterceptingProgressBar(
        iterable=iterable, total=total, socketio=socketio
    )

    socketio.emit("progress_update", {"percentage": 0})

    try:
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
    except Exception as e:
        print(f"Generation failed: {e}")
        socketio.emit("generation_failed", {"error": str(e)})
    finally:
        # Always reset progress to 0 after completion or failure
        socketio.emit("progress_update", {"percentage": 0})
        pipeline.progress_bar = original_progress_bar
