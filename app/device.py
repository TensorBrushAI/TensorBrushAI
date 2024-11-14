import torch

if torch.cuda.is_available():
    device = "cuda"
    precision = torch.float16
    print("Device: CUDA\nPrecision: FP16")
elif torch.backends.mps.is_available():
    device = "mps"
    precision = torch.float32
    print("Device: MPS\nPrecision: FP32")
else:
    device = "cpu"
    precision = torch.float32
    print("Device: CPU\nPrecision: FP32")