from PIL import Image

# Target background color hex #B09D7F -> RGB (176, 157, 127)
TARGET_BG = (176, 157, 127)

img = Image.open("frontend/public/farmer_avatar.png").convert("RGBA")
width, height = img.size

pixels = img.load()

# Identify checkerboard pattern pixels:
# The checkerboard in the original image consists of alternating light gray (~#e0e0e0 to #ffffff)
# and medium gray (~#808080 to #b0b0b0) square grid pixels surrounding the head.
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        
        # Calculate color variance to detect grayscale background grid
        is_gray = abs(r - g) < 15 and abs(g - b) < 15 and abs(r - b) < 15
        
        # Check if pixel is part of the background grid (outside skin tones / shirt)
        # Skin tones and shirt have warmer red/yellow tones where R > G and R > B
        is_background = is_gray and (r > 110 or g > 110)
        
        # Don't touch the farmer's cap (white) which is near top-center
        # The farmer's head is roughly x: [width*0.35 .. width*0.65], y: [height*0.15 .. height*0.35]
        is_farmer_cap = (0.35 * width <= x <= 0.65 * width) and (0.15 * height <= y <= 0.35 * height) and (r > 200 and g > 200 and b > 200)
        
        if is_background and not is_farmer_cap:
            pixels[x, y] = (TARGET_BG[0], TARGET_BG[1], TARGET_BG[2], 255)

img.save("frontend/public/farmer_avatar_clean.png")
print("Clean avatar saved successfully to frontend/public/farmer_avatar_clean.png")
