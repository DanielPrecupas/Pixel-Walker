# Testing Checklist for Cursor Cat Extension

## Pre-Testing Setup
- [ ] Extension loaded in Chrome (chrome://extensions)
- [ ] Developer mode enabled
- [ ] Extension enabled via popup
- [ ] Test page with paragraphs open (Wikipedia, blog, news article)

## 1. Sprite Rendering Tests

### Cat Sprite Display
- [ ] Cat sprite displays at correct size (64x64 base, scaled by settings)
- [ ] Cat sprite is crisp and not blurry (image smoothing disabled)
- [ ] Shadow appears beneath cat
- [ ] Cat sprite changes with size slider in popup

### Animation Quality
- [ ] All frames animate smoothly (no stuttering)
- [ ] Frame transitions are clean (no artifacts)
- [ ] Animation speed feels natural (~110ms per frame)

## 2. Movement Behavior Tests

### Cursor Following
- [ ] Cat moves toward cursor when cursor moves
- [ ] Cat stops moving when cursor reaches cat position
- [ ] Movement is smooth and continuous (no teleporting)
- [ ] Cat stays within page bounds (doesn't go off-screen)

### Walk Animation
- [ ] Cat walks when cursor moves slowly nearby
- [ ] Walk animation plays in all 8 directions:
  - [ ] Down
  - [ ] Down-left
  - [ ] Left
  - [ ] Up-left
  - [ ] Up
  - [ ] Up-right
  - [ ] Right
  - [ ] Down-right
- [ ] Direction changes smoothly when cursor changes direction

### Run Animation
- [ ] Cat runs when cursor moves quickly (fast mouse movement)
- [ ] Cat runs when cursor is far away (> 200px)
- [ ] Run animation is faster than walk (2.5x speed)
- [ ] Run animation plays in 4 cardinal directions:
  - [ ] Down
  - [ ] Left
  - [ ] Up
  - [ ] Right
- [ ] 8-frame run animation cycles properly (frames 0-7)

## 3. Idle Behavior Tests

### Normal Idle
- [ ] Cat idles when cursor is on it
- [ ] Idle animation matches last movement direction (8-way)
- [ ] Cat stops moving immediately when cursor enters hitbox

### Hover Detection
- [ ] Cursor hitbox feels accurate (covers cat sprite)
- [ ] Hover state activates when cursor is over cat
- [ ] Hover state deactivates when cursor leaves cat

### Long Hover (3+ seconds)
- [ ] Cat transitions to special animation after 3 seconds
- [ ] Sleep animation plays (cat sleeping)
- [ ] Paw animation plays (cat playing with paw)
- [ ] Animations alternate randomly on different hovers
- [ ] Animation direction matches cat's facing (4-way)

## 4. Click Interaction Tests

### Click Detection
- [ ] Click registers when clicking on cat sprite
- [ ] Click doesn't register when clicking outside cat
- [ ] Click works in all cat positions (screen, scrolled page)

### Click Reaction
- [ ] Meow sound plays on click (1-second duration)
- [ ] Sound plays at appropriate volume (0.45 gain)
- [ ] Sound has subtle pitch variation (±10%)
- [ ] Scratch OR meow animation plays (random)
- [ ] Reaction animation lasts ~600ms
- [ ] Reaction animation direction matches facing (4-way)
- [ ] Cat returns to normal behavior after reaction

## 5. Bowl Collection Tests

### Bowl Rendering
- [ ] Bowls display from items.png (row 3, 64x64 sprites)
- [ ] 14 bowls spawn in paragraphs
- [ ] Bowls animate through 4 frames
- [ ] Bowls have subtle bob animation (floating effect)
- [ ] Bowls have slight scale pulse effect
- [ ] Bowl shadow renders correctly

### Collection Mechanics
- [ ] Bowls are collected when cat touches them
- [ ] Collection sound plays (Collect_Big_Point.wav)
- [ ] Bowl count increments in UI (top-left corner)
- [ ] "Bowls left" count decrements correctly
- [ ] Collected bowls disappear from screen
- [ ] Bowls respawn after 4 seconds
- [ ] Respawned bowls appear in new random positions

### UI Display
- [ ] Top-left UI shows "🍜 [count]   [remaining] left"
- [ ] UI has semi-transparent black background
- [ ] UI text is gold (#FFD700)
- [ ] UI updates in real-time as bowls are collected

## 6. Text Layout Tests

### Basic Text Wrapping (Cat)
- [ ] Text becomes transparent when cat enters paragraph
- [ ] Text re-renders on canvas with hole around cat
- [ ] Hole shape follows cat movement in real-time
- [ ] Text shows normally when cat leaves paragraph
- [ ] Original paragraph text color restored after cat leaves
- [ ] Multiple paragraphs can be affected simultaneously

### Text Hole Shape
- [ ] Circular hole around cat is appropriate size
- [ ] Hole doesn't leave text fragments (< 3 chars removed)
- [ ] Hole maintains readability (text flows naturally)
- [ ] Hole size scales with cat size setting

### Image Exclusion
- [ ] Text wraps around `<img>` elements in paragraphs
- [ ] Text wraps around `<figure>` elements in paragraphs
- [ ] Text wraps around elements with background-images
- [ ] Multiple images in same paragraph create multiple holes
- [ ] Text doesn't overlap with images
- [ ] Cat hole AND image holes both work together

### Text Rendering Quality
- [ ] Font matches original paragraph font
- [ ] Text color matches original paragraph color
- [ ] Line height matches original paragraph spacing
- [ ] Text stays within paragraph bounds
- [ ] No visible seams or gaps in rendered text
- [ ] Text renders correctly on different font sizes

## 7. Sound Tests

### Walk Sound
- [ ] Walk sound plays while cat is moving
- [ ] Walk sound plays every 2 frames (not too frequent)
- [ ] Walk sound has pitch variation (±12%)
- [ ] Walk sound is quieter than other sounds (0.2 gain)
- [ ] Walk sound doesn't play when cat is idle/hovering

### Collection Sound
- [ ] Plays when bowl is collected
- [ ] Pitch variation (±8%)
- [ ] Appropriate volume (0.45 gain)

### Meow Sound
- [ ] Plays on cat click
- [ ] 1-second duration (not the full 4-second version)
- [ ] Pitch variation (±10%)
- [ ] Appropriate volume (0.45 gain)

### Sound Settings
- [ ] Sound toggle in popup works
- [ ] Disabling sound stops all sounds
- [ ] Re-enabling sound allows sounds to play again
- [ ] Sound state persists across page reloads

## 8. Popup Tests

### Preview Animations
- [ ] Header sprite animates (walking down)
- [ ] Preview canvas shows cat walking
- [ ] Preview cat cycles through 8 directions
- [ ] Preview uses 64x64 sprites (not blurry)
- [ ] Text warp visualization works in preview

### Settings Controls
- [ ] Enable/Disable toggle works
- [ ] Speed slider changes cat movement speed (0.5x to 3x)
- [ ] Size slider changes cat sprite size (1x to 5x)
- [ ] Sound toggle enables/disables audio
- [ ] Respawn button repositions cat to center screen
- [ ] Settings persist across popup close/reopen

### Status Display
- [ ] Bowls collected count updates in real-time
- [ ] Paragraph count displays correctly
- [ ] Status polls every 2 seconds

## 9. Edge Cases & Stress Tests

### Page Scrolling
- [ ] Cat position updates correctly when page scrolls
- [ ] Cat can be followed to any scroll position
- [ ] Text wrapping works after scrolling
- [ ] Bowls remain in correct positions after scroll

### Multiple Paragraphs
- [ ] Extension works on pages with 1-2 paragraphs
- [ ] Extension works on pages with 50+ paragraphs
- [ ] Extension works on pages with no paragraphs (graceful fallback)
- [ ] Paragraph detection works on different website layouts (Wikipedia, blogs, news sites)

### Performance
- [ ] No noticeable lag when cat moves
- [ ] Frame rate stays consistent (60fps)
- [ ] CPU usage is reasonable (< 20% single core)
- [ ] Memory usage doesn't grow over time (no leaks)

### Window Resize
- [ ] Canvas resizes when window resizes
- [ ] Cat remains visible after resize
- [ ] Text rendering continues working after resize
- [ ] No visual glitches during/after resize

### Extension Toggle
- [ ] Disabling extension removes cat and canvas
- [ ] Original paragraph text is restored
- [ ] Re-enabling extension re-initializes cat properly
- [ ] Settings are remembered between enable/disable cycles

## 10. Browser Compatibility

### Chrome Features
- [ ] Extension installs without errors
- [ ] Service worker registers correctly
- [ ] Content script injects successfully
- [ ] Web accessible resources load (sprites, sounds)
- [ ] Storage API persists settings
- [ ] Message passing works between popup and content script

### Console Errors
- [ ] No JavaScript errors in console
- [ ] No failed resource loads (404s)
- [ ] No CORS errors
- [ ] Helpful debug messages appear (e.g., "[Cat] Started!")

## Test Environment Recommendations

### Test Pages
1. **Wikipedia article** (complex layout, images, multiple paragraphs)
2. **Blog post** (various paragraph styles, figures)
3. **News site** (ads, images, mixed content)
4. **Simple HTML page** (basic paragraphs, minimal styling)
5. **Empty page** (edge case: no content)

### Test Scenarios
1. **Fresh load**: Install extension, enable, test immediately
2. **After reload**: Refresh page, verify auto-start
3. **Multiple tabs**: Open in several tabs, verify independence
4. **Long session**: Leave running for 10+ minutes, check for issues

## Automated Testing Notes
The following could be automated with Puppeteer/Playwright:
- Sprite loading verification
- Animation frame counting
- Collision detection accuracy
- UI update responsiveness
- Performance benchmarking

---

## Sign-Off
- [ ] All critical tests passed
- [ ] All high-priority tests passed
- [ ] Known issues documented
- [ ] Ready for release / user testing
