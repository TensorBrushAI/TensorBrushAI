import os

# SAVE OUTPUT IMAGE
def save_image(output, seed):
    os.makedirs("outputs", exist_ok=True)
    for i in range(1, 1000):
        filename = f"{seed}-{i}.png"
        filepath = os.path.join("outputs", filename)
        if not os.path.exists(filepath):
            break

    output.images[0].save(filepath)
    print(f"Image saved to outputs as {filename}.")
    return filename