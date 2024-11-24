import torch
from pathlib import Path

class ModelDetectionError(Exception):
    pass

def detect_model_type(model_path: str) -> str:
    model_path = Path(model_path).resolve()
    if not model_path.exists():
        raise ModelDetectionError(f"Model path does not exist: {model_path}")
    if model_path.suffix not in {".ckpt", ".safetensors", ".bin"}:
        raise ModelDetectionError(f"Unsupported model format: {model_path}")

    if model_path.suffix == ".safetensors":
        import safetensors.torch
        checkpoint = safetensors.torch.load_file(str(model_path))
    else:
        checkpoint = torch.load(model_path, map_location="mps")

    state_dict = checkpoint.get("state_dict") or checkpoint

    key_name = "model.diffusion_model.input_blocks.2.1.transformer_blocks.0.attn2.to_k.weight"
    if key_name in state_dict and state_dict[key_name].shape[-1] == 768:
        return "SD1.5"

    key_name = "model.diffusion_model.input_blocks.4.1.transformer_blocks.0.attn2.to_k.weight"
    if key_name in state_dict and state_dict[key_name].shape[-1] == 2048:
        return "SDXL"

    # key_name = "model.diffusion_model.joint_blocks.0.context_block.attn.qkv.weight"
    # if key_name in state_dict and state_dict[key_name].shape[-1] == 2432:
    #     return "SD3.5-large"

    # key_name = "double_blocks.0.img_attn.qkv.weight"
    # if key_name in state_dict and state_dict[key_name].shape[-1] == 3072:
    #     return "Flux.1-dev"

    raise ModelDetectionError("Unable to determine model type.")

