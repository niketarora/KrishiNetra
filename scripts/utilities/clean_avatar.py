from pathlib import Path
import shutil
import sys

# Safe import with fallback to prevent IDE import warnings
try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    Image = None
    HAS_PIL = False

ROOT = Path(__file__).resolve().parent.parent.parent

# Target background color hex #B09D7F -> RGB (176, 157, 127)
TARGET_BG = (176, 157, 127)

# Candidate input locations in priority order
candidate_inputs = [
    ROOT / "frontend" / "public" / "assets" / "images" / "farmer_avatar.png",
    ROOT / "frontend" / "public" / "farmer_avatar.png",
    ROOT / "frontend" / "public" / "assets" / "avatar" / "farmer_avatar.png",
]

# High-quality pre-cleaned backup avatar if PIL is unavailable
backup_clean_avatars = [
    ROOT / "frontend" / "public" / "assets" / "images" / "farmer_final_avatar.png",
    ROOT / "frontend" / "public" / "farmer_final_avatar.png",
    ROOT / "docs" / "png" / "Farmer Final Avatar.png",
]

input_path = None
for candidate in candidate_inputs:
    if candidate.exists():
        input_path = candidate
        break

output_paths = [
    ROOT / "frontend" / "public" / "assets" / "images" / "farmer_avatar_clean.png",
    ROOT / "frontend" / "public" / "farmer_avatar_clean.png",
]

def process_with_pil():
    if not input_path or not input_path.exists():
        print(f"Input avatar not found in candidate paths: {[str(p) for p in candidate_inputs]}")
        return False

    print(f"Processing avatar with PIL from {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            is_gray = abs(r - g) < 15 and abs(g - b) < 15 and abs(r - b) < 15
            is_background = is_gray and (r > 110 or g > 110)
            is_farmer_cap = (0.35 * width <= x <= 0.65 * width) and (0.15 * height <= y <= 0.35 * height) and (r > 200 and g > 200 and b > 200)

            if is_background and not is_farmer_cap:
                pixels[x, y] = (TARGET_BG[0], TARGET_BG[1], TARGET_BG[2], 255)

    for out_path in output_paths:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        img.save(out_path)
        print(f"Clean avatar saved successfully to {out_path}")
    return True

def process_with_fallback():
    print("PIL is not installed in the active environment. Using pre-cleaned high-resolution avatar fallback...")
    source_backup = None
    for bk in backup_clean_avatars:
        if bk.exists():
            source_backup = bk
            break

    if source_backup:
        for out_path in output_paths:
            out_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source_backup, out_path)
            print(f"Copied clean avatar from {source_backup} -> {out_path}")
        return True
    else:
        print("No backup clean avatar found.")
        return False

if __name__ == "__main__":
    if HAS_PIL:
        process_with_pil()
    else:
        process_with_fallback()
