from PIL import Image

def save_first_frame(gif_path, output_path):
    try:
        with Image.open(gif_path) as gif:
            # Save the first frame
            gif.seek(0)  # Go to the first frame
            gif.convert("RGBA").save(output_path, format="PNG")
            print(f"First frame saved as: {output_path}")
    except Exception as e:
        print(f"Error saving first frame: {e}")

# Input and output paths
gif_path = "images/default.gif"
output_path = "images/default.png"

# Save the first frame
save_first_frame(gif_path, output_path)
