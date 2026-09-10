# Cat Sprite Sheet Mapping Reference

## catchar.png Sprite Sheet Layout
**Sprite Size**: 64x64 pixels per frame
**Layout**: Grid of 4 columns (frames) × multiple rows (animation types)

## Animation Rows (based on black cat with text.png)

### Idle Animations (Rows 0-7) - 4 frames each
```
Row 0:  Idle Down        [🐱]
Row 1:  Idle Down-Left   [🐱]
Row 2:  Idle Left        [🐱]
Row 3:  Idle Up-Left     [🐱]
Row 4:  Idle Up          [🐱]
Row 5:  Idle Up-Right    [🐱]
Row 6:  Idle Right       [🐱]
Row 7:  Idle Down-Right  [🐱]
```
**Usage**: When cursor is hovering on cat (< 3 seconds)

### Walk Animations (Rows 8-15) - 4 frames each
```
Row 8:  Walk Down        [🚶]
Row 9:  Walk Down-Left   [🚶]
Row 10: Walk Left        [🚶]
Row 11: Walk Up-Left     [🚶]
Row 12: Walk Up          [🚶]
Row 13: Walk Up-Right    [🚶]
Row 14: Walk Right       [🚶]
Row 15: Walk Down-Right  [🚶]
```
**Usage**: Following cursor at normal speed (velocity ≤ 15, distance ≤ 200)

### Run Animations (Rows 16-23) - 8 frames each (split across 2 rows)
```
Row 16-17: Run Down   [frames 0-3 in row 16, frames 4-7 in row 17]  [🏃]
Row 18-19: Run Left   [frames 0-3 in row 18, frames 4-7 in row 19]  [🏃]
Row 20-21: Run Up     [frames 0-3 in row 20, frames 4-7 in row 21]  [🏃]
Row 22-23: Run Right  [frames 0-3 in row 22, frames 4-7 in row 23]  [🏃]
```
**Usage**: Following cursor at high speed (velocity > 15 OR distance > 200)

### Sleep Animations (Rows 24-31) - 4 frames each
```
Row 24-25: Sleep Down   [💤]
Row 26-27: Sleep Left   [💤]
Row 28-29: Sleep Up     [💤]
Row 30-31: Sleep Right  [💤]
```
**Usage**: Long hover (> 3 seconds) - random choice

### Paw Animations (Rows 32-39) - 4 frames each
```
Row 32-33: Paw Down   [🐾]
Row 34-35: Paw Left   [🐾]
Row 36-37: Paw Up     [🐾]
Row 38-39: Paw Right  [🐾]
```
**Usage**: Long hover (> 3 seconds) - random choice, alternates with sleep

### Scratch Animations (Rows 40-47) - 4 frames each
```
Row 40-41: Scratch Down   [😺]
Row 42-43: Scratch Left   [😺]
Row 44-45: Scratch Up     [😺]
Row 46-47: Scratch Right  [😺]
```
**Usage**: Click interaction - random choice

### Meow Animations (Rows 48-55) - 4 frames each
```
Row 48-49: Meow Down   [😸]
Row 50-51: Meow Left   [😸]
Row 52-53: Meow Up     [😸]
Row 54-55: Meow Right  [😸]
```
**Usage**: Click interaction - random choice, plays Cat_Meow.wav sound

## items.png Sprite Sheet Layout
**Sprite Size**: 64x64 pixels per frame

### Bowl Collectibles
```
Row 3 (y=192): Bowls [🍜🍜🍜🍜]
  Frame 0 (x=0):   Bowl variant 1
  Frame 1 (x=64):  Bowl variant 2
  Frame 2 (x=128): Bowl variant 3
  Frame 3 (x=192): Bowl variant 4
```

## Code Usage Examples

### Drawing Cat Sprite
```javascript
const SPRITE_SIZE = 64;
const row = ANIM_ROWS[cat.currentAnimation]; // e.g., ANIM_ROWS.walkDown = 8
const col = cat.frameIndex; // 0-3 for most animations, 0-7 for run

// Special handling for run animations (8 frames across 2 rows)
let actualRow = row;
if (cat.currentAnimation.includes('run') && cat.frameIndex >= 4) {
  actualRow = row + 1;
  col = cat.frameIndex - 4;
}

ctx.drawImage(
  catSprite,
  col * 64,        // Source X (frame column)
  actualRow * 64,  // Source Y (animation row)
  64, 64,          // Source width/height
  screenX - displayW / 2,  // Destination X (centered)
  screenY - displayH / 2,  // Destination Y (centered)
  displayW,        // Display width (64 * scale)
  displayH         // Display height (64 * scale)
);
```

### Drawing Bowl Sprite
```javascript
const BOWL_ROW = 3; // Row 3 in items.png
const frame = Math.floor((bowl.pulse * 2) / Math.PI) % 4;

ctx.drawImage(
  bowlSprite,
  frame * 64,  // Source X (0, 64, 128, or 192)
  192,         // Source Y (row 3 = 64 * 3)
  64, 64,      // Source dimensions
  screenX - 32 * scale,  // Destination X (centered)
  screenY - 32 * scale,  // Destination Y (centered)
  64 * scale,  // Display width
  64 * scale   // Display height
);
```

## Direction Mapping

### 8-Way Direction (Idle & Walk)
```javascript
// Based on angle from movement vector
angle = Math.atan2(dy, dx) * 180 / Math.PI

-22.5° to 22.5°     → right
22.5° to 67.5°      → downRight
67.5° to 112.5°     → down
112.5° to 157.5°    → downLeft
±157.5° to 180°     → left
-157.5° to -112.5°  → upLeft
-112.5° to -67.5°   → up
-67.5° to -22.5°    → upRight
```

### 4-Way Direction (Run, Sleep, Paw, Scratch, Meow)
```javascript
// Simplified from 8-way
down/downLeft/downRight → down
left/upLeft             → left
up/upRight              → up
right                   → right
```

## Animation State Priority

1. **Click Reaction** (highest priority, 600ms duration)
   - Overrides all other states
   - Plays meow or scratch animation
   - Plays meow sound

2. **Hover - Long** (3+ seconds on cat)
   - Plays sleep or paw animation
   - Randomly alternates between the two

3. **Hover - Normal** (< 3 seconds on cat)
   - Plays idle animation
   - Uses 8-way direction

4. **Following Cursor** (cursor not on cat)
   - Distance > 6px: Move toward cursor
     - High speed (velocity > 15 OR distance > 200): Run (4-way, 8 frames)
     - Normal speed: Walk (8-way, 4 frames)
   - Distance ≤ 6px: Idle (8-way, 4 frames)

## Frame Timing
- **Frame Duration**: 110ms per frame
- **Walk Cycle**: 4 frames × 110ms = 440ms (2.27 fps)
- **Run Cycle**: 8 frames × 110ms = 880ms (1.14 fps)
- **Idle Cycle**: 4 frames × 110ms = 440ms (2.27 fps)

## Visual Reference
See **black cat with text.png** for the labeled sprite sheet showing all animation types.
