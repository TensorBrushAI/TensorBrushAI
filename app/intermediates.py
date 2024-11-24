from PIL import Image, ImageFilter
import torch

RGB_FACTORS = [
    [ 0.50,  0.60,  0.65],
    [-0.35,  0.10,  0.20],
    [ 0.10,  0.25, -0.10],
    [-0.55, -0.30, -0.45],
]

def latents_to_rgb(latents):
    latent_rgb_factors = torch.tensor(RGB_FACTORS, dtype=latents.dtype).to(latents.device)
    latent_image = latents[0].permute(1, 2, 0) @ latent_rgb_factors
    latents_ubyte = (
        ((latent_image + 1) / 2).clamp(0, 1).mul(255).byte()
    ).cpu().numpy()
    return Image.fromarray(latents_ubyte)

def decode_tensors(latents, output_dir="outputs/image_utils/", blur_radius=1.5):
    if latents is not None:
        image = latents_to_rgb(latents)
        image = image.filter(ImageFilter.GaussianBlur(blur_radius))
        image.save(f"{output_dir}/intermediate.png")