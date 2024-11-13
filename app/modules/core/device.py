import torch

def get_device():
    return "cuda" if torch.cuda.is_available() else "cpu"

def get_precision(device):
    return torch.float16 if device == "cuda" else torch.float32