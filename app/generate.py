import random
import torch
from app import socketio
from .pipeline import load_pipeline, pipeline
from .utils import InterceptingProgressBar
from .outputs import save_image
from threading import Event
from .intermediates import decode_tensors

cancel_flag = Event()

def cancel_generation():
    cancel_flag.set()

def interrupt_callback(pipeline, step, timestep, callback_kwargs):
    if cancel_flag.is_set():
        pipeline._interrupt = True

    latents = callback_kwargs.get("latents")
    if latents is not None:
        decode_tensors(latents)
        socketio.emit("refresh_intermediate")

    return callback_kwargs

def start_generation(data):
    global pipeline
    cancel_flag.clear()
    if pipeline is None:
        pipeline = load_pipeline()

    prompt = data.get("prompt", "beautiful tropical beach in Bali")
    negative_prompt = data.get("negative_prompt", "low quality, watermark")
    iterations = int(data.get("iterations", 40))
    guidance = float(data.get("guidance", 7))
    width = int(data.get("width", 512))
    height = int(data.get("height", 512))
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
            callback_on_step_end=interrupt_callback,
            callback_kwargs={"latents": None},
        )

        filename = save_image(output, seed)
        socketio.emit("generation_completed", {"filename": filename})
    except Exception as e:
        print(f"Generation failed: {e}")
        socketio.emit("generation_failed", {"error": str(e)})
    finally:
        socketio.emit("progress_update", {"percentage": 0})
        pipeline.progress_bar = original_progress_bar
