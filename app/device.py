import torch

# Device and Precision Setup
if torch.cuda.is_available():
    device = torch.device("cuda")
    precision = torch.float16
    print("Device: CUDA\nPrecision: FP16")
elif torch.backends.mps.is_available():
    device = torch.device("mps")
    precision = torch.float16
    print("Device: MPS\nPrecision: FP16")
else:
    device = torch.device("cpu")
    precision = torch.float32
    print("Device: CPU\nPrecision: FP32")
