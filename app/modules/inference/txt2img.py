import random
import torch
from ..core.pipeline import pipeline, load_pipeline
from ..core.image_outputs import save_image

def generate_image(prompt, negative_prompt, iterations, guidance, width, height, seed):
    global pipeline
    
    if pipeline is None:
        print("Pipeline was not preloaded... Attempting to reload pipeline now.")
        load_pipeline()
        
        if pipeline is None:
            print("Pipeline failed to load.")
            return {"error": "Pipeline failed to load. Please check the configuration."}

    if seed is None:
        seed = random.randint(0, 2**32 - 1)
    generator = torch.Generator().manual_seed(seed)

    output = pipeline(
        prompt=prompt,
        negative_prompt=negative_prompt,
        num_inference_steps=iterations,
        guidance_scale=guidance,
        width=width,
        height=height,
        generator=generator
    )

    return save_image(output.images[0], seed)
