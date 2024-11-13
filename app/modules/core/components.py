import os
from diffusers import EulerDiscreteScheduler

def get_model_path():
    return os.path.join(os.path.dirname(__file__), "../../../models/main/sdxl/any-sdxl-model.safetensors")

def get_scheduler():
    return EulerDiscreteScheduler.from_pretrained("stabilityai/stable-diffusion-xl")