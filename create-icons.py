"""
Quick icon generator - Creates simple colored PNG icons
Run: python create-icons.py
"""

import os
import struct
import zlib

def create_png(width, height, color_bg, filepath):
    """Create a simple PNG with background color"""
    
    def make_chunk(chunk_type, data):
        chunk = chunk_type + data
        crc = zlib.crc32(chunk) & 0xffffffff
        return struct.pack(">I", len(data)) + chunk + struct.pack(">I", crc)
    
    # PNG signature
    signature = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    ihdr = make_chunk(b'IHDR', ihdr_data)
    
    # Create image data (simple colored rectangle)
    raw_data = b''
    r, g, b = color_bg
    
    for y in range(height):
        raw_data += b'\x00'  # Filter byte
        for x in range(width):
            raw_data += bytes([r, g, b])
    
    # Compress image data
    compressed = zlib.compress(raw_data)
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

# Background color: #D6C2A1 (RGB: 214, 194, 161)
bg_color = (214, 194, 161)

print("🎨 Generating PWA Icons...\n")

# Generate all icon sizes
for size in sizes:
    filename = f"icon-{size}x{size}.png"
    filepath = os.path.join(icons_dir, filename)
    create_png(size, size, bg_color, filepath)
    print(f"✓ Created {filename}")

# Create maskable icon
filename = "maskable-icon-512x512.png"
filepath = os.path.join(icons_dir, filename)
create_png(512, 512, bg_color, filepath)
print(f"✓ Created {filename}")

# Create shortcut icons
for shortcut in ['shortcut-sale', 'shortcut-inventory']:
    filename = f"{shortcut}.png"
    filepath = os.path.join(icons_dir, filename)
    create_png(96, 96, bg_color, filepath)
    print(f"✓ Created {filename}")

print(f"\n✅ All icons created successfully!")
print(f"📁 Location: {icons_dir}")
print(f"\n🎯 Next step: Restart your app and test install!")
