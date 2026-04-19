const fs = require('fs');
const path = require('path');

// Icon sizes needed
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'frontend', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Simple PNG creator function (creates a colored square with basic shopping bag)
function createIconPNG(size, filename) {
  // PNG header and IHDR chunk
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  ]);

  // We'll create a simple colored PNG using canvas-like approach
  // For simplicity, we'll use a base64 encoded minimal PNG
  
  // Create a simple SVG and convert to data URL
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="${size}" height="${size}" fill="#D6C2A1" rx="${size * 0.22}"/>
      
      <!-- Shopping Bag -->
      <g transform="translate(${size * 0.2}, ${size * 0.25})">
        <!-- Bag body -->
        <rect x="${size * 0.1}" y="${size * 0.25}" width="${size * 0.6}" height="${size * 0.55}" 
              fill="white" rx="${size * 0.05}"/>
        
        <!-- Bag handle -->
        <path d="M ${size * 0.25} ${size * 0.25} Q ${size * 0.3} ${size * 0.05} ${size * 0.4} ${size * 0.05} 
                 Q ${size * 0.5} ${size * 0.05} ${size * 0.55} ${size * 0.25}" 
              stroke="white" stroke-width="${size * 0.05}" fill="none" stroke-linecap="round"/>
        
        <!-- Fold lines -->
        <line x1="${size * 0.1}" y1="${size * 0.45}" x2="${size * 0.7}" y2="${size * 0.45}" 
              stroke="#D6C2A1" stroke-width="${size * 0.01}"/>
        <line x1="${size * 0.1}" y1="${size * 0.6}" x2="${size * 0.7}" y2="${size * 0.6}" 
              stroke="#D6C2A1" stroke-width="${size * 0.01}"/>
      </g>
    </svg>
  `;

  const svgPath = path.join(iconsDir, `${filename}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`✓ Created ${filename}.svg`);
}

console.log('🎨 Generating PWA Icons...\n');

// Generate all icon sizes
sizes.forEach(size => {
  createIconPNG(size, `icon-${size}x${size}`);
});

// Create maskable icon (with extra padding)
createIconPNG(512, 'maskable-icon-512x512');

// Create shortcut icons
createIconPNG(96, 'shortcut-sale');
createIconPNG(96, 'shortcut-inventory');

console.log('\n✅ All SVG icons created successfully!');
console.log(`📁 Location: ${iconsDir}`);
console.log('\n⚠️  Note: These are SVG files. You need to convert them to PNG.');
console.log('\n🔧 To convert to PNG, use one of these methods:\n');
console.log('Option 1: Use an online converter');
console.log('  - Go to: https://cloudconvert.com/svg-to-png');
console.log('  - Upload all SVG files and convert\n');
console.log('Option 2: Use the generate-icons.html file');
console.log('  - Open: frontend/public/icons/generate-icons.html');
console.log('  - Click "Generate & Download Icons"\n');
console.log('Option 3: Use ImageMagick (if installed)');
console.log('  cd frontend/public/icons');
console.log('  for %s in (*.svg) do magick %s %~ns.png\n');
