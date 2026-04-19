# PWA Documentation - Cecilia Boutique Management

## 📱 Overview

Cecilia Boutique Management is a fully functional Progressive Web App (PWA) that can be installed on any device (Desktop, Android, iOS) and works offline with proper caching strategies.

## ✨ PWA Features

### 1. Installability
- **Desktop**: Install prompt in browser address bar
- **Android**: "Add to Home Screen" option
- **iOS**: "Add to Home Screen" via Safari share menu

### 2. Offline Support
- Service Worker caches essential assets
- Offline fallback page
- Cached API responses for better performance

### 3. Push Notifications
- Real-time notifications support
- Notification actions (View, Dismiss)
- Custom notification icons

### 4. App Shortcuts
Quick access to frequently used features:
- **Record Sale**: Direct access to sales page
- **View Inventory**: Direct access to inventory page

### 5. Theme Color Integration
- Status bar theming on mobile
- Consistent brand colors (#D6C2A1)
- Dark mode support

## 🔧 PWA Configuration

### Web App Manifest (`public/manifest.json`)

```json
{
  "name": "Cecilia Boutique",
  "short_name": "Cecilia",
  "description": "Manage your boutique with elegance",
  "theme_color": "#D6C2A1",
  "background_color": "#F5EFE6",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "icons": [
    // 9 different icon sizes for optimal display
  ],
  "categories": ["business", "shopping", "productivity"],
  "shortcuts": [
    // Quick access shortcuts
  ]
}
```

**Key Properties:**
- `name`: Full app name (shown on install splash screen)
- `short_name`: Short name (shown under icon)
- `theme_color`: Browser UI color (#D6C2A1 - Beige)
- `background_color`: Splash screen background (#F5EFE6 - Cream)
- `display`: `standalone` (hides browser UI)
- `orientation`: `portrait` (locks to portrait mode)

### Service Worker (`public/service-worker.js`)

The service worker implements multiple caching strategies:

#### 1. Install Event
Caches static assets immediately:
- HTML pages
- CSS/JS files
- Icons
- Manifest

```javascript
const CACHE_NAME = 'cecilia-static-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];
```

#### 2. Fetch Strategies

**HTML Pages - Network First**
```javascript
// Try network first, fallback to cache
fetch(event.request)
  .then(response => {
    // Update cache with fresh data
    cache.put(event.request, response.clone());
    return response;
  })
  .catch(() => caches.match(OFFLINE_URL));
```

**API Calls - Network Only**
```javascript
// Don't cache sensitive API data
fetch(event.request).catch(() => {
  return new Response(
    JSON.stringify({ error: 'Offline' }),
    { status: 503 }
  );
});
```

**Images - Cache First**
```javascript
// Serve from cache, update in background
caches.match(event.request)
  .then(cached => cached || fetch(event.request));
```

**CSS/JS/Fonts - Cache First with Update**
```javascript
// Fast load from cache, update for next time
caches.match(event.request).then(cached => {
  fetch(event.request).then(response => {
    cache.put(event.request, response.clone());
  });
  return cached;
});
```

#### 3. Background Sync

Syncs offline actions when connection is restored:

```javascript
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sales') {
    event.waitUntil(syncPendingSales());
  }
});
```

#### 4. Push Notifications

Handles incoming push notifications:

```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png'
  });
});
```

### Meta Tags (`index.html`)

```html
<!-- PWA Meta Tags -->
<meta name="theme-color" content="#D6C2A1" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Cecilia" />
<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
<link rel="manifest" href="/manifest.json" />
```

## 📲 Installation Guide

### Desktop (Chrome/Edge)

1. **Visit the App**
   - Navigate to your deployed URL

2. **Install Prompt**
   - Click the install icon in the address bar (looks like a monitor with arrow)
   - OR click "Install" button in the app

3. **Confirm Installation**
   - Click "Install" in the prompt
   - App opens in standalone window

### Android (Chrome)

1. **Open in Chrome**
   - Navigate to your app URL

2. **Add to Home Screen**
   - Tap menu (⋮) → "Add to Home Screen"
   - OR tap the install banner if it appears

3. **Confirm**
   - Tap "Add" or "Install"
   - Icon appears on home screen

### iOS (Safari)

1. **Open in Safari**
   - Navigate to your app URL
   - Must use Safari (not Chrome)

2. **Share Menu**
   - Tap the Share button (box with arrow)

3. **Add to Home Screen**
   - Scroll down and tap "Add to Home Screen"
   - Edit name if desired
   - Tap "Add"

4. **Launch**
   - Tap the icon on home screen
   - Opens in full-screen mode

## 🎨 PWA Icons

### Icon Sizes

| Size | Purpose | Location |
|------|---------|----------|
| 72x72 | Small Android | `/icons/icon-72x72.png` |
| 96x96 | Android, Badge | `/icons/icon-96x96.png` |
| 128x128 | Chrome Web Store | `/icons/icon-128x128.png` |
| 144x144 | Windows tiles | `/icons/icon-144x144.png` |
| 152x152 | iOS iPad | `/icons/icon-152x152.png` |
| 192x192 | Android splash | `/icons/icon-192x192.png` |
| 384x384 | High-res displays | `/icons/icon-384x384.png` |
| 512x512 | Splash screen | `/icons/icon-512x512.png` |
| 512x512 | Android adaptive | `/icons/maskable-icon-512x512.png` |

### Shortcut Icons

- **Record Sale**: `/icons/shortcut-sale.png` (96x96)
- **View Inventory**: `/icons/shortcut-inventory.png` (96x96)

## 🌐 Offline Support

### What Works Offline

✅ **Available Offline:**
- Previously visited pages (cached)
- Static assets (CSS, JS, images)
- App shell and UI components
- Offline fallback page

❌ **Requires Connection:**
- New API calls (sales, inventory, etc.)
- Real-time data updates
- Authentication
- Data submission

### Offline Experience

When offline, users see:
1. **Cached Pages**: Previously visited pages load from cache
2. **Offline Page**: Custom offline.html with retry option
3. **Error Messages**: Clear indication of offline status
4. **Queue Actions**: (Future) Actions queued for sync

## 🔔 Push Notifications

### Notification Types

1. **Sales Alerts**
   - New sale recorded
   - Large transaction alert

2. **Low Stock Alerts**
   - Item quantity below threshold
   - Critical stock level

3. **Expense Alerts**
   - New expense added
   - High expense warning

4. **Reports**
   - Daily summary
   - Weekly analytics
   - Monthly performance

### Notification Permissions

The app requests notification permission when:
- User enables notifications in Settings
- First important notification is triggered

### Notification Actions

Each notification supports:
- **View**: Opens relevant page
- **Dismiss**: Closes notification

## 🛠️ PWA Testing

### Lighthouse Audit

Run PWA audit in Chrome DevTools:

1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Analyze page load"

**Expected Scores:**
- PWA: 90-100 ✅
- Performance: 85-100 ✅
- Accessibility: 90-100 ✅
- Best Practices: 90-100 ✅

### Manual Testing Checklist

- [ ] App installs on desktop
- [ ] App installs on Android
- [ ] App installs on iOS
- [ ] Offline page loads
- [ ] Cached pages work offline
- [ ] Service worker registers
- [ ] Push notifications work
- [ ] App shortcuts work
- [ ] Theme color displays
- [ ] Splash screen shows
- [ ] App runs in standalone mode

### Chrome DevTools Testing

**Service Worker:**
1. Open DevTools → Application → Service Workers
2. Verify service worker is registered
3. Check cache storage
4. Test offline mode

**Manifest:**
1. Open DevTools → Application → Manifest
2. Verify all fields are correct
3. Check icons load properly
4. Test shortcuts

**Storage:**
1. Open DevTools → Application → Cache Storage
2. Verify caches are created
3. Check cached assets
4. Monitor cache updates

## 🐛 Troubleshooting

### App Won't Install

**Desktop:**
- Ensure HTTPS is enabled
- Check manifest.json is valid
- Verify service worker is registered

**Android:**
- Clear browser cache
- Check Chrome version (must be 70+)
- Verify HTTPS connection

**iOS:**
- Must use Safari (not Chrome)
- iOS version must be 11.3+
- Check "Add to Home Screen" is enabled in Settings

### Service Worker Not Registering

1. Check browser console for errors
2. Verify `/service-worker.js` is accessible
3. Check HTTPS is enabled
4. Clear service worker cache and re-register

### Offline Not Working

1. Verify service worker is active
2. Check cache storage in DevTools
3. Ensure pages are visited while online first
4. Check offline.html exists

### Push Notifications Not Working

1. Check notification permissions
2. Verify push service is configured
3. Check backend notification endpoint
4. Test with notification test tool

### Icons Not Showing

1. Verify icons exist in `/icons/` directory
2. Check manifest.json paths are correct
3. Ensure icon files are valid PNG
4. Test icon URLs in browser

## 📊 PWA Performance

### Caching Strategy Summary

| Resource Type | Strategy | Cache Duration |
|--------------|----------|----------------|
| HTML Pages | Network First | Until update |
| API Data | Network Only | No cache |
| Images | Cache First | Until storage limit |
| CSS/JS | Cache First | Until update |
| Fonts | Cache First | Long-term |

### Storage Management

- **Static Cache**: ~2-5 MB
- **Image Cache**: ~10-50 MB (auto-managed)
- **Total PWA Size**: ~15-55 MB

### Performance Optimization

1. **Lazy Loading**: Load data only when needed
2. **Code Splitting**: Vite automatically splits code
3. **Asset Optimization**: Compressed images and minified code
4. **Efficient Caching**: Smart cache invalidation

## 🔄 Updates

### App Update Process

1. **New Deployment**: Code pushed to GitHub
2. **Service Worker Update**: New cache version created
3. **User Refresh**: User revisits app
4. **Background Update**: New service worker installs
5. **Activation**: New version activates on next visit

### Force Update

Users can force update by:
1. Closing all app windows
2. Reopening the app
3. Or clearing site data and reloading

## 📱 Platform-Specific Notes

### Android

- Supports full PWA features
- Can use WebAPK for better integration
- Supports background sync
- Push notifications via FCM

### iOS

- Limited service worker support
- No background sync
- No push notifications (yet)
- Must use Safari for installation
- Splash screen auto-generated

### Desktop

- Full PWA support (Chrome/Edge)
- Can run in standalone window
- File system access (optional)
- Clipboard access

## 🔐 Security

### HTTPS Requirement

PWA features require HTTPS in production:
- Service workers only work on HTTPS
- Push notifications require HTTPS
- Installation requires secure context

**Exception:** `localhost` works for development

### Security Headers

Recommended headers:
```
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
```

## 📈 Analytics

### Track PWA Metrics

Monitor these metrics:
- Installation rate
- Offline usage
- Push notification engagement
- Platform distribution
- Performance scores

### Google Analytics PWA Tracking

```javascript
// Track PWA installation
window.addEventListener('appinstalled', () => {
  gtag('event', 'pwa_installed');
});

// Track offline usage
navigator.serviceWorker.ready.then(registration => {
  if (registration.active) {
    gtag('event', 'service_worker_active');
  }
});
```

## 🚀 Future Enhancements

- [ ] IndexedDB for offline data storage
- [ ] Background sync for offline sales
- [ ] Push notification server integration
- [ ] Periodic background sync
- [ ] Share target API
- [ ] Contact picker API
- [ ] File system access API

---

**PWA Status:** ✅ Fully Functional and Production Ready

For PWA issues or questions, please open an issue on GitHub.
