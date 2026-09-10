# Cursor Cat - Chrome Extension

A playful pixel cat that follows your cursor across webpages, collecting food bowls while text parts around it. Interactive, fun, and surprisingly engaging!

## Features

### Core Behaviors

- **Cursor Following**: The cat smoothly follows your cursor position across the page
- **Smart Movement**:
  - Walks at normal speed when cursor is nearby
  - Runs faster when cursor moves quickly or is far away
  - Stops and idles when cursor is directly on the cat
- **Interactive Animations**:
  - Click the cat to hear it meow and see a reaction animation
  - Hover for 3+ seconds to see special idle animations (sleeping or paw waving)
  - Directional animations for all 8 directions (down, up, left, right, and diagonals)
- **Food Bowl Collection**: Cat collects bowls scattered across paragraphs
- **Text Hole Effect**: Text parts around the cat, creating a visual "hole" effect

### Visual Effects

- Pixel art style (16x16 sprites scaled 3x)
- Smooth animations (walk, run, idle, sleep, paw, scratch, meow)
- Shadow beneath the cat
- Animated bobbing food bowls with glow effect
- Score counter showing collected bowls

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `pixel-walker` directory
6. The extension is now installed!

## Usage

1. Click the extension icon in Chrome toolbar
2. Toggle the cat ON using the popup
3. Move your cursor around any webpage
4. Watch the cat follow you!
5. Interact by:
   - Moving cursor to make cat walk/run
   - Hovering over cat to see idle animations
   - Clicking cat to hear meow sound
   - Collecting bowls to increase your score

## Files

### Core Files
- **content.js** - Main cat behavior and rendering logic (completely rewritten)
- **manifest.json** - Extension configuration
- **popup.html** / **popup.js** - Extension control popup
- **background.js** - Service worker for settings

### Assets
- **catchar.png** - Cat sprite sheet (16x16 frames, multiple animation rows)
- **items.png** - Food bowls and other collectibles
- **sprites/Cat_Meow.wav** - Meow sound effect (trimmed to 1 second)
- **sprites/Walk_Alt01.wav** - Walking sound
- **sprites/Collect_Big_Point.wav** - Bowl collection sound
- **sprites/Touch01.wav** - Touch/boundary sound

### Testing
- **test.html** - Comprehensive test page with instructions

## Sprite Sheet Layout

The cat sprite sheet (`catchar.png`) uses a 16x16 grid with the following row layout:

| Rows | Animation Type | Directions |
|------|---------------|------------|
| 0-7  | Idle | Down, DownLeft, Left, UpLeft, Up, UpRight, Right, DownRight |
| 8-15 | Walk | Down, DownLeft, Left, UpLeft, Up, UpRight, Right, DownRight |
| 16-23 | Run | Down (16-17), Left (18-19), Up (20-21), Right (22-23) |
| 24-31 | Sleep | Down (24-25), Left (26-27), Up (28-29), Right (30-31) |
| 32-39 | Paw | Down (32-33), Left (34-35), Up (36-37), Right (38-39) |
| 40-47 | Scratch | Down (40-41), Left (42-43), Up (44-45), Right (46-47) |
| 48-55 | Meow | Down (48-49), Left (50-51), Up (52-53), Right (54-55) |

Each animation has 4 frames (walk) or 8 frames (run) depending on the action.

## Technical Details

### Cursor Following Algorithm

The cat uses a velocity-based pursuit system:
1. Calculate distance and direction to cursor
2. Determine if cat should walk or run based on cursor velocity and distance
3. Move cat towards cursor with appropriate speed
4. Update animation based on movement direction and speed
5. Handle special cases (cursor on cat, boundaries, etc.)

### Text Hole Rendering

The text rendering system:
1. Finds paragraphs on the page
2. Hides the original text (makes it transparent)
3. Re-renders text on canvas with a circular hole around the cat
4. Uses line-by-line rendering with intersection detection
5. Splits lines that intersect with the cat's position

### Collision Detection

Bowl collection uses simple distance-based collision:
```javascript
distance = Math.hypot(cat.x - bowl.x, cat.y - bowl.y)
if (distance < collisionRadius) {
  // Collect bowl
}
```

## Settings

Accessible via extension popup:
- **Enable/Disable**: Toggle cat on/off
- **Speed**: Adjust cat movement speed
- **Size**: Change cat display size
- **Sound**: Enable/disable sound effects

## Browser Compatibility

- Chrome/Chromium-based browsers (tested on Chrome 90+)
- Manifest V3 compliant
- Uses modern Web APIs (Canvas, AudioContext, Intersection Observer)

## Performance

- Optimized rendering loop using `requestAnimationFrame`
- Efficient paragraph detection and caching
- Sound preloading with Web Audio API
- Off-screen culling for bowls and text rendering

## Credits

- Original "Pixel Walker" extension concept
- Cat sprite sheet: `catchar.png`
- Items sprite sheet: `items.png`
- Sound effects from original extension
- Pretext layout engine (simplified version included)

## Version History

### v2.0.0 (Current)
- Complete rewrite from random-walking character to cursor-following cat
- Replaced character.png with catchar.png
- Changed collectibles from coins to food bowls
- Added interactive behaviors (click reaction, hover animations)
- Implemented cursor velocity detection for smart run/walk switching
- Fixed text overlap issues with improved rendering
- Added meow sound effect

### v1.0.0 (Original)
- Random-walking character
- Coin collection
- Text parting effect

## License

This project is for educational and entertainment purposes.

## Development

To modify the cat behavior, edit `content.js`:
- Cat movement: `updateCatBehavior()` function
- Animation logic: `renderCat()` function
- Cursor tracking: `handleMouseMove()` and `handleClick()` functions
- Bowl spawning: `initBowls()` function
- Text rendering: `renderTextWithHole()` function

To adjust sprite mappings, modify the `ANIM_ROWS` object at the top of `content.js`.

## Troubleshooting

**Cat doesn't appear:**
- Check if extension is enabled in popup
- Verify catchar.png loaded in DevTools Network tab
- Check console for errors

**No sound:**
- Ensure sound is enabled in settings
- Check browser autoplay policies
- Verify .wav files are in sprites/ folder

**Text doesn't part:**
- Page must have paragraphs with sufficient text (60+ characters)
- Check console for "Prepared X paragraphs" message
- Some websites may have incompatible layouts

**Cat moves erratically:**
- Adjust speed setting in popup
- Check for JavaScript conflicts with page
- Reload page to reset cat state

## Future Enhancements

Potential features to add:
- Multiple cats with different behaviors
- Customizable cat skins
- More collectible types
- Cat toys that appear on certain websites
- Social features (share your score)
- Different movement modes (jump, climb, fly)
- Seasonal themes and animations

---

Made with ❤️ for cat lovers and pixel art enthusiasts!
