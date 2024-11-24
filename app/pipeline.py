from .device import device, precision
from diffusers import (
    # PIPELINES
    StableDiffusionPipeline,
    StableDiffusion3Pipeline,
    StableDiffusionXLPipeline,
    FluxPipeline,
    # SCHEDULERS
    EulerDiscreteScheduler,
    EulerAncestralDiscreteScheduler,
    HeunDiscreteScheduler,
    DPMSolverMultistepScheduler,
    KDPM2DiscreteScheduler,
    KDPM2AncestralDiscreteScheduler,
    UniPCMultistepScheduler,
    LMSDiscreteScheduler
)
from app.detect_model import detect_model_type

pipeline = None
model_path = "models/EpicRealism.safetensors"

def load_pipeline():
    model_type = detect_model_type(model_path)

    if model_type == "SD1.5":
        required_pipeline = StableDiffusionPipeline

    elif model_type == "SDXL":
        required_pipeline = StableDiffusionXLPipeline

    # elif model_type == "SD3.5-large":
    #     required_pipeline = StableDiffusion3Pipeline

    # elif model_type == "Flux.1-dev":
    #     required_pipeline = FluxPipeline

    else:
        raise ValueError(f"Unsupported model type: {model_type}")

    pipeline = required_pipeline.from_single_file(
        model_path,
        use_safetensors=True,
        variant="fp16",
        requires_safety_checker=False,
        safety_checker=None,
        torch_dtype=precision
    ).to(device)

    pipeline.scheduler = EulerDiscreteScheduler.from_config(pipeline.scheduler.config)
    
    return pipeline

load_pipeline()