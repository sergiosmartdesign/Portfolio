# Certificate Gallery - Usage Guide

## Overview
A 3D card carousel gallery for displaying certificate images with the capsule glow effect from the About section.

## Features
- ✨ 3D card rotation and stacking effect
- 🎨 Capsule glow effect (#ee9b00 color)
- 🖱️ Drag to navigate between cards
- ⌨️ Keyboard navigation (Arrow keys, ESC)
- 📱 Touch-enabled for mobile devices
- 🎯 Customizable positioning
- 🔘 Prev/Next buttons

## File Structure
```
/css/cert-gallery.css   - Gallery styles
/js/cert-gallery.js     - Gallery functionality
/images/cert/           - Certificate images
```

## How to Use

### 1. Open/Close the Gallery

The gallery is hidden by default. To show it, you have several options:

#### Option A: Add a button to open the gallery
```html
<!-- Add this button anywhere in your HTML -->
<button onclick="window.certGallery.open()">View Certificates</button>
```

#### Option B: Open gallery on page load (remove 'hidden' class)
```html
<!-- In index.html, change this: -->
<div class="cert-gallery hidden with-backdrop">

<!-- To this: -->
<div class="cert-gallery with-backdrop">
```

#### Option C: Open gallery from JavaScript
```javascript
// Open gallery
window.certGallery.open();

// Close gallery
window.certGallery.close();
```

### 2. Customize Position

Edit `/css/cert-gallery.css` at line 8-11:

```css
.cert-gallery {
  position: fixed; /* or absolute */

  /* Center positioning (default) */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  /* OR use manual positioning */
  /* top: 100px; */
  /* left: 100px; */
  /* transform: none; */
}
```

### 3. Customize Card Size

Edit the width in `/css/cert-gallery.css` at line 24:

```css
.cert-gallery .cards {
  width: 150px; /* Change this value */
  height: calc(150px * 1.414); /* Height adjusts automatically */
}
```

And in line 40:
```css
.cert-gallery .cards li {
  width: 150px; /* Match the container width */
  height: calc(150px * 1.414);
}
```

### 4. Change Glow Color

To change the glow color, edit lines 56-58 in `/css/cert-gallery.css`:

```css
.cert-gallery .cards li {
  /* Current: Capsule glow effect #ee9b00 */
  box-shadow: 0 0 10px #ee9b00,
              0 0 20px #ee9b00,
              0 0 30px #ee9b00;

  /* Optional: Use cyan glow */
  /* box-shadow: 0 0 10px #00ffff,
              0 0 20px #00ffff,
              0 0 30px #00ffff; */
}
```

### 5. Navigation Controls

#### Mouse/Touch:
- **Drag cards** left/right to navigate
- **Click** on any card to bring it to center
- **Hover** over cards for enhanced glow effect

#### Buttons:
- **Prev button** - Go to previous certificate
- **Next button** - Go to next certificate
- **Close button (×)** - Hide the gallery

#### Keyboard:
- **Arrow Left** - Previous card
- **Arrow Right** - Next card
- **Escape** - Close gallery

### 6. JavaScript API

Access the gallery programmatically:

```javascript
// Navigate to next card
window.certGallery.next();

// Navigate to previous card
window.certGallery.prev();

// Go to specific card (0-indexed)
window.certGallery.goTo(3); // Go to 4th card

// Open gallery
window.certGallery.open();

// Close gallery
window.certGallery.close();

// Get current card index
const currentIndex = window.certGallery.getCurrentIndex();
```

### 7. Add/Remove Certificates

Edit the `<ul class="cards">` section in `index.html`:

```html
<ul class="cards">
    <li style="background-image: url('images/cert/certificadoplatzi1.png')"></li>
    <li style="background-image: url('images/cert/certificadoplatzi2.png')"></li>
    <!-- Add more cards here -->
    <li style="background-image: url('images/cert/yournewcert.png')"></li>
</ul>
```

### 8. Styling Options

#### Remove the dark backdrop:
```html
<!-- Change from: -->
<div class="cert-gallery hidden with-backdrop">

<!-- To: -->
<div class="cert-gallery hidden">
```

#### Change button styles:
Edit `.cert-gallery .actions button` in `/css/cert-gallery.css` (lines 80-98)

#### Adjust card spacing:
Edit `spacing` value in `/js/cert-gallery.js` line 13:
```javascript
const config = {
  spacing: 30, // Increase for more space between cards
};
```

## Integration Examples

### Example 1: Button in About Section
```html
<!-- Add this to your About section -->
<div class="about-left">
    <button class="view-certs-btn" onclick="window.certGallery.open()">
        View My Certificates
    </button>
</div>
```

### Example 2: Auto-open on Scroll
```javascript
// Add this to your script.js
window.addEventListener('scroll', function() {
    const aboutSection = document.getElementById('about');
    const rect = aboutSection.getBoundingClientRect();

    // Open gallery when About section is in view
    if (rect.top < window.innerHeight && rect.bottom >= 0) {
        window.certGallery.open();
    }
});
```

### Example 3: Open from Navigation
```html
<!-- Add to header navigation -->
<a href="#" class="nav-btn" onclick="window.certGallery.open(); return false;">
    Certificates
</a>
```

## Browser Compatibility
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS/Android)

## Troubleshooting

**Gallery not showing:**
- Check if 'hidden' class is removed
- Ensure CSS and JS files are loaded
- Check browser console for errors

**Images not loading:**
- Verify image paths in index.html
- Check that images exist in `/images/cert/` folder

**Drag not working:**
- Ensure `dragEnabled: true` in `/js/cert-gallery.js` config
- Check for JavaScript errors in console

## Credits
Based on the card carousel example with custom enhancements for certificate display.
