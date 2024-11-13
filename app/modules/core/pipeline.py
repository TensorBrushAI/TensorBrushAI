from diffusers import StableDiffusionXLPipeline
from .components import get_model_path, get_scheduler
from .device import get_device, get_precision

pipeline = None

def load_pipeline():
    global pipeline
    model_path = get_model_path()
    scheduler = get_scheduler()
    device = get_device()
    precision = get_precision(device)

    pipeline = StableDiffusionXLPipeline.from_single_file(
        model_path, variant="fp16", use_safetensors=True
    )
    pipeline.scheduler = scheduler
    pipeline.to(device=device, dtype=precision)
    print("Pipeline loaded with selected components.")

load_pipeline()

def reload_pipeline():
    global pipeline
    print("Reloading pipeline with new components...")
    pipeline = None
    load_pipeline()

