import os

def save_image(image, seed):
    output_dir = os.path.join(os.path.dirname(__file__), "../../../outputs")
    os.makedirs(output_dir, exist_ok=True)

    filename = next(
        (os.path.join(output_dir, f"{seed}-{i}.png") for i in range(1, 1000)
         if not os.path.exists(os.path.join(output_dir, f"{seed}-{i}.png"))),
        os.path.join(output_dir, f"{seed}.png")
    )
    image.save(filename)
    print(f"Image saved to {filename}")
    return filename
