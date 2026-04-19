"""
Create beautiful PWA icons with shopping bag design
Run: python create-beautiful-icons.py
"""

import os
import struct
import zlib
import math

def create_png_with_shopping_bag(width, height, filepath):
    """Create a PNG with beige background and white shopping bag icon"""
    
    def make_chunk(chunk_type, data):
        chunk = chunk_type + data
        crc = zlib.crc32(chunk) & 0xffffffff
        return struct.pack(">I", len(data)) + chunk + struct.pack(">I", crc)
    
    # PNG signature
    signature = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    ihdr = make_chunk(b'IHDR', ihdr_data)
    
    # Create image data
    raw_data = b''
    
    # Background color: #D6C2A1 (RGB: 214, 194, 161)
    bg_color = (214, 194, 161)
    # Icon color: White (RGB: 255, 255, 255)
    icon_color = (255, 255, 255)
    # Accent color: #B89B72 (RGB: 184, 155, 114)
    accent_color = (184, 155, 114)
    
    # Calculate icon dimensions (centered, 60% of canvas)
    icon_size = int(width * 0.6)
    icon_x = (width - icon_size) // 2
    icon_y = (height - icon_size) // 2
    
    # Bag dimensions
    bag_width = int(icon_size * 0.8)
    bag_height = int(icon_size * 0.7)
    bag_x = icon_x + (icon_size - bag_width) // 2
    bag_y = icon_y + int(icon_size * 0.25)
    
    # Handle dimensions
    handle_width = int(bag_width * 0.6)
    handle_height = int(icon_size * 0.25)
    handle_x = icon_x + (icon_size - handle_width) // 2
    handle_y = bag_y - handle_height + int(icon_size * 0.05)
    
    for y in range(height):
        raw_data += b'\x00'  # Filter byte
        for x in range(width):
            # Determine pixel color
            r, g, b = bg_color  # Default to background
            
            # Check if pixel is in bag body (rounded rectangle)
            corner_radius = int(bag_width * 0.08)
            in_bag = False
            
            # Main bag body
            if (bag_x + corner_radius <= x < bag_x + bag_width - corner_radius and
                bag_y <= y < bag_y + bag_height):
                in_bag = True
            
            # Left rounded edge
            elif (bag_x <= x < bag_x + corner_radius and
                  bag_y <= y < bag_y + bag_height):
                # Check if within rounded corner
                dx = x - (bag_x + corner_radius)
                dy = 0
                if y < bag_y + corner_radius:
                    dy = y - (bag_y + corner_radius)
                elif y >= bag_y + bag_height - corner_radius:
                    dy = y - (bag_y + bag_height - corner_radius)
                if dx*dx + dy*dy <= corner_radius*corner_radius:
                    in_bag = True
            
            # Right rounded edge
            elif (bag_x + bag_width - corner_radius <= x < bag_x + bag_width and
                  bag_y <= y < bag_y + bag_height):
                dx = x - (bag_x + bag_width - corner_radius)
                dy = 0
                if y < bag_y + corner_radius:
                    dy = y - (bag_y + corner_radius)
                elif y >= bag_y + bag_height - corner_radius:
                    dy = y - (bag_y + bag_height - corner_radius)
                if dx*dx + dy*dy <= corner_radius*corner_radius:
                    in_bag = True
            
            # Check if pixel is in handle (arc)
            in_handle = False
            if (handle_x <= x < handle_x + handle_width and
                handle_y <= y < bag_y):
                # Simple arc approximation
                center_x = handle_x + handle_width // 2
                center_y = bag_y
                radius_x = handle_width // 2
                radius_y = handle_height
                
                dx = (x - center_x) / radius_x
                dy = (y - center_y) / radius_y
                
                if dx*dx + dy*dy <= 1.0 and dy < 0:
                    # Make handle thicker
                    if dy > -0.3:
                        in_handle = True
            
            if in_bag or in_handle:
                r, g, b = icon_color
            
            raw_data += bytes([r, g, b])
    
    # Compress image data
    compressed = zlib.compress(raw_data, 9)
    idat = make_chunk(b'IDAT', compressed)
    
    # IEND chunk
    iend = make_chunk(b'IEND', b'')
    
    # Write PNG file
    with open(filepath, 'wb') as f:
        f.write(signature + ihdr + idat + iend)

# Icon sizes needed
sizes = [72, 96, 128, 144, 152, 192, 384, 512]

# Create icons directory
icons_dir = os.path.join(os.path.dirname(__file__), 'frontend', 'public', 'icons')
os.makedirs(icons_dir, exist_ok=True)

print("🎨 Creating Beautiful PWA Icons with Shopping Bag Design...\n")

# Generate all icon sizes
for size in sizes:
    filename = f"icon-{size}x{size}.png"
    filepath = os.path.join(icons_dir, filename)
    create_png_with_shopping_bag(size, size, filepath)
    print(f"✓ Created {filename}")

# Create maskable icon
filename = "maskable-icon-512x512.png"
filepath = os.path.join(icons_dir, filename)
create_png_with_shopping_bag(512, 512, filepath)
print(f"✓ Created {filename}")

# Create shortcut icons
for shortcut in ['shortcut-sale', 'shortcut-inventory']:
    filename = f"{shortcut}.png"
    filepath = os.path.join(icons_dir, filename)
    create_png_with_shopping_bag(96, 96, filepath)
    print(f"✓ Created {filename}")

print(f"\n✅ All beautiful icons created successfully!")
print(f"📁 Location: {icons_dir}")
print(f"\n🎯 Next steps:")
print(f"1. Restart your dev server (Ctrl+C, then npm run dev)")
print(f"2. Hard refresh browser (Ctrl+Shift+R)")
print(f"3. Install the app - icon will show shopping bag!")
