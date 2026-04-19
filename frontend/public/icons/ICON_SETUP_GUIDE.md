# 🎨 PWA Icons Setup Guide

## Quick Icon Generation (Choose ONE method)

### Method 1: Use Online Generator (EASIEST) ⭐

1. Go to: https://realfavicongenerator.net/
2. Upload the SVG template: `public/icons/icon-template.svg`
3. Configure:
   - Background color: `#D6C2A1`
   - Foreground color: White
   - Padding: 15%
4. Generate and download
5. Extract all icons to: `frontend/public/icons/`

### Method 2: Use Figma/Canva (MANUAL)

1. Open Figma or Canva
2. Create 512x512 canvas
3. Add rounded rectangle background: `#D6C2A1`
4. Add white shopping bag icon in center
5. Export in these sizes:
   - 72x72
   - 96x96
   - 128x128
   - 144x144
   - 152x152
   - 192x192
   - 384x384
   - 512x512
6. Save as PNG in: `frontend/public/icons/`

### Method 3: Use CLI Tool (AUTOMATED)

```bash
# Install pwa-asset-generator
npm install -g pwa-asset-generator

# Generate all icons from template
cd frontend
npx pwa-asset-generator public/icons/icon-template.svg public/icons \
  --background "#D6C2A1" \
  --padding "15%" \
  --type png \
  --quality 100 \
  --overwrite
```

---

## Required Icon Files

After generation, you should have these files in `frontend/public/icons/`:

```
icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
├── icon-512x512.png
└── maskable-icon-512x512.png (with safe zone padding)
```

---

## Icon Design Specifications

### Colors:
- **Background:** `#D6C2A1` (Primary Beige)
- **Foreground:** `#FFFFFF` (White)
- **Safe Zone:** 80% center for maskable icon

### Design Elements:
- Shopping bag silhouette (simple, recognizable)
- Rounded corners (112px radius on 512x512)
- Centered composition
- High contrast for visibility

### Maskable Icon:
- Must have 15% padding around edges
- Important elements in center 70%
- This ensures it looks good on all Android devices

---

## Shortcut Icons (Optional)

For app shortcuts in manifest:

```
icons/
├── shortcut-sale.png (96x96) - Shopping cart icon
└── shortcut-inventory.png (96x96) - Package/box icon
```

**Design:**
- Same background color: `#D6C2A1`
- White icon in center
- Simpler, more recognizable at small size

---

## Testing Icons

After adding icons, test:

1. **Manifest Check:**
   - Open DevTools → Application → Manifest
   - Verify all icons load without errors

2. **Visual Check:**
   - Icons should be clear at all sizes
   - No pixelation or blurriness
   - Shopping bag should be recognizable

3. **Install Dialog:**
   - Chrome: Menu → Install App
   - Should show your custom icon

---

## Troubleshooting

**Icons not showing?**
- Check file names match manifest.json exactly
- Verify files are in `public/icons/` folder
- Clear browser cache and reload

**Icons look blurry?**
- Ensure you're exporting at exact sizes
- Use PNG format (not JPG)
- Check source image is high quality (512x512 minimum)

**Maskable icon cuts off?**
- Add more padding (20% instead of 15%)
- Keep important elements in center 60%

---

## Quick Fix (Temporary Placeholder)

If you need icons NOW for testing, create a simple placeholder:

```bash
# Create a simple colored square using ImageMagick (if installed)
cd frontend/public/icons

convert -size 512x512 xc:#D6C2A1 icon-512x512.png
convert -size 192x192 xc:#D6C2A1 icon-192x192.png
convert -size 96x96 xc:#D6C2A1 icon-96x96.png
# ... repeat for all sizes
```

Or use this online placeholder: https://placeholder.com/

---

## Next Steps After Icons

1. ✅ Icons created and placed in `public/icons/`
2. ✅ Run: `npm run dev`
3. ✅ Open: http://localhost:5173
4. ✅ Check DevTools → Application → Manifest
5. ✅ Test install prompt on mobile or desktop Chrome
6. ✅ Verify icons appear in install dialog

---

**Need Help?**
- Manifest spec: https://web.dev/add-manifest/
- Icon guidelines: https://web.dev/maskable-icon/
- PWA checklist: https://web.dev/pwa-checklist/
