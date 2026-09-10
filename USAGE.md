# Cursor Cat - Usage Guide

## Quick Start

1. **Install the extension** in Chrome (see README.md for installation steps)
2. **Click the extension icon** in your browser toolbar
3. **Toggle the cat ON** in the popup
4. **Move your cursor** and watch the cat follow!

## How to Interact

### 1. Basic Movement

**Action**: Move your cursor around the page

**Cat Behavior**:
- Follows cursor smoothly
- Uses **walking animation** at normal speed
- Faces the direction it's moving (8 directions)

**Try this**:
- Move cursor slowly in circles
- Move in straight lines
- Zigzag across the page

---

### 2. Fast Movement

**Action**: Move your cursor quickly or move it far from the cat

**Cat Behavior**:
- Switches to **running animation**
- Moves 2.5x faster to catch up
- Uses simplified 4-direction sprites (down, left, up, right)

**Try this**:
- Flick cursor from one side of screen to other
- Make quick random movements
- Jump cursor to distant locations

---

### 3. Hovering (Short)

**Action**: Place cursor directly on the cat

**Cat Behavior**:
- Stops moving
- Plays **idle animation**
- Faces the last direction it was moving
- Continues idle loop while you hover

**Try this**:
- Hover for 1-2 seconds
- Move away and return
- Hover while cat is facing different directions

---

### 4. Hovering (Long)

**Action**: Keep cursor on cat for 3+ seconds

**Cat Behavior**:
- Transitions to special animations
- Either **sleeps** (curls up) or **waves paw** (playful)
- Animation chosen randomly
- Returns to normal idle if you move away

**Try this**:
- Hover for exactly 3 seconds and watch transition
- Keep hovering for 10+ seconds
- Try multiple times to see both sleep and paw animations

---

### 5. Clicking the Cat

**Action**: Click directly on the cat

**Cat Behavior**:
- Plays **meow sound** 🔊
- Shows reaction animation (meow or scratch)
- Locks animation for ~600ms
- Returns to normal behavior after reaction

**Try this**:
- Click once and listen
- Click rapidly (each click triggers new meow)
- Click while cat is moving
- Click while cat is idle

---

### 6. Collecting Bowls

**Action**: Guide cat near food bowls (🍜)

**Cat Behavior**:
- Automatically collects bowl when close enough
- Plays **collection sound** 🔊
- Score increases (+1)
- Bowl respawns in new location after 4 seconds

**Try this**:
- Collect all bowls on page
- See how fast you can collect 10 bowls
- Watch bowls respawn
- Notice bowls only spawn in text paragraphs

**Score Display**: Top-left corner shows "🍜 [collected] [remaining] left"

---

### 7. Text Interaction

**Action**: Move cat through paragraphs of text

**Cat Behavior**:
- Text becomes transparent in original location
- Re-rendered on canvas with "hole" around cat
- Text parts around cat like water
- Text restores when cat leaves paragraph

**Try this**:
- Move cat through long paragraphs
- Position cat in middle of paragraph and keep still
- Move cat from paragraph to paragraph
- Notice text returns when cat leaves

---

## Settings

Click extension icon to access settings:

### Enable/Disable
- Toggle cat on/off
- Settings persist between sessions
- Cat state saved per-website

### Speed (Default: 1.8)
- **Slow (1.0)**: Leisurely cat, easy to interact with
- **Normal (1.8)**: Balanced, responsive
- **Fast (3.0)**: Hyperactive cat, challenging to catch

### Size (Default: 3)
- **Small (2)**: Subtle, doesn't cover much text
- **Medium (3)**: Perfect visibility
- **Large (5)**: Big, bold cat presence

### Sound (Default: ON)
- **ON**: Hear walk, collect, and meow sounds
- **OFF**: Silent mode for quiet browsing

---

## Tips & Tricks

### Getting High Scores
1. Learn bowl spawn patterns (always in paragraphs)
2. Use fast movements to collect quickly
3. Don't hover - keep moving!
4. Bowls respawn in 4 seconds - circle back

### Making Cat Perform Tricks
1. **Figure-8 Movement**: Create smooth curves
2. **Chase Mode**: Move in circles, cat follows
3. **Freeze Tag**: Hover briefly, move, repeat
4. **Speed Test**: See how fast cat can run

### Best Websites to Try
- **Wikipedia**: Long articles with many paragraphs
- **News Sites**: Multiple text blocks
- **Blogs**: Extended content areas
- **Documentation**: Technical pages with long text
- **Test Page**: Use included `test.html` for controlled testing

### Easter Eggs
- Try clicking cat 10 times rapidly
- Hover for 30+ seconds
- Collect 50 bowls in one session
- Visit the test.html page for surprises

---

## Troubleshooting

### Cat Doesn't Follow Cursor
- **Check**: Is cat enabled in popup?
- **Try**: Reload the page
- **Note**: Some websites may block extensions

### No Text Hole Effect
- **Cause**: Page doesn't have suitable paragraphs
- **Need**: Paragraphs with 60+ characters
- **Check**: Console shows "Prepared X paragraphs"

### Cat Follows Slowly
- **Fix**: Increase speed in settings
- **Try**: Move cursor farther to trigger run
- **Note**: Default speed is balanced for most users

### No Sound
- **Check**: Sound enabled in settings?
- **Browser**: Check browser autoplay policy
- **Volume**: System volume not muted?

### Bowls Don't Appear
- **Cause**: No suitable paragraphs found
- **Fix**: Visit page with more text content
- **Try**: Scroll down (bowls in visible area)

### Cat Stuck or Glitching
- **Fix**: Click extension icon, toggle off then on
- **Or**: Reload the page
- **Rare**: Report issue if persistent

---

## Keyboard Shortcuts

Currently no keyboard shortcuts. All interaction is cursor-based.

**Potential future additions**:
- `Space` - Make cat jump
- `C` - Call cat to cursor instantly
- `R` - Respawn cat at center
- `S` - Toggle sleep mode

---

## Performance

### Optimized For
- Modern Chrome/Chromium browsers
- Pages with 5-50 paragraphs
- Standard webpage layouts
- Desktop/laptop displays

### May Lag On
- Very long pages (100+ paragraphs)
- Low-end devices
- Pages with heavy JavaScript
- While recording screen

**Tip**: If experiencing lag, try:
1. Reduce cat size to 2
2. Disable sound
3. Close other tabs
4. Reload page

---

## Privacy & Permissions

### What Extension Accesses
- **Mouse position**: To track cursor
- **Page text**: To create text holes
- **Audio**: To play sounds
- **Canvas**: To render cat

### What Extension Does NOT Access
- Passwords or form data
- Browsing history
- Personal information
- Network requests

### Data Storage
- Settings stored locally (Chrome storage)
- No data sent to external servers
- No tracking or analytics

---

## Uninstallation

To remove extension:
1. Go to `chrome://extensions/`
2. Find "Cursor Cat"
3. Click "Remove"
4. Confirm removal

All settings and data are deleted automatically.

---

## Support

### Bug Reports
If you encounter issues:
1. Open browser DevTools (F12)
2. Check Console for errors
3. Note: Browser, page URL, error message
4. Disable other extensions to test conflict

### Feature Requests
Ideas for new features? Consider:
- What behavior would be fun?
- How would it interact with existing features?
- Is it technically feasible?

### Contributing
Code is open and well-commented. Feel free to:
- Add new animations
- Improve text rendering
- Create new collectibles
- Optimize performance

---

## Fun Challenges

### Speed Run
Collect 20 bowls as fast as possible

### No-Lift Challenge
Never let cursor leave screen while collecting 10 bowls

### Perfect Circle
Move cursor in perfect circle, watch cat follow

### Stealth Mode
Collect bowls without triggering run animation

### Marathon
Keep cat active for 30 minutes straight

### Artist
Use cat to "draw" patterns in text

---

Enjoy your new feline browsing companion! 🐱✨
