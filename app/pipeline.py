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

# INITIALIZE PIPELINE
pipeline = None
def load_pipeline():
    global pipeline
    pipeline = None
    pipeline = StableDiffusionXLPipeline.from_single_file(
        "models/ReMixxxPonyXL-V1.0.safetensors",
        use_safetensors=True,
        variant="fp16",
        requires_safety_checker=False,
        safety_checker=None,
        torch_dtype=precision
    ).to(device)
    pipeline.scheduler = EulerDiscreteScheduler.from_config(pipeline.scheduler.config)
    return pipeline