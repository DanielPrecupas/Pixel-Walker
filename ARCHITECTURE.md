# Cursor Cat Extension - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Chrome Browser                          │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────────┐  │
│  │   Popup UI   │    │  Background  │    │  Content Script │  │
│  │  (popup.js)  │───▶│   Service    │◀───│  (content.js)   │  │
│  │              │    │   Worker     │    │                 │  │
│  └──────────────┘    └──────────────┘    └─────────────────┘  │
│         │                                         │             │
│         │ Settings                                │ Render      │
│         │ Messages                                │ Loop        │
│         ▼                                         ▼             │
│  ┌──────────────┐                       ┌─────────────────┐    │
│  │   Storage    │                       │   Web Page DOM  │    │
│  │  (sync/local)│                       │   + Canvas      │    │
│  └──────────────┘                       └─────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Popup Interface (popup.js + popup.html)
**Purpose**: User controls and settings
- Settings panel (enable/disable, speed, size, sound)
- Preview animation (sprite preview with text warp demo)
- Status display (bowls collected, paragraphs found)
- Respawn button

**Key Functions**:
- `updateUI()`: Sync UI with stored settings
- `sendToTab(msg)`: Send messages to active tab's content script
- `pollStatus()`: Get real-time stats from content script
- `animatePreview()`: Render sprite animation in preview canvas

### 2. Background Service Worker (background.js)
**Purpose**: Extension lifecycle management
- Minimal implementation (Manifest V3 requirement)
- Could handle cross-tab coordination (future)
- Could manage extension-wide state (future)

### 3. Content Script (content.js)
**Purpose**: Main game logic and rendering

#### 3.1 Canvas System
```javascript
createCanvas()      // Create full-screen overlay
destroyCanvas()     // Clean up on disable
renderFrame()       // Main render loop (60fps)
```

#### 3.2 Cursor Tracking
```javascript
initCursorTracking()     // Add event listeners
handleMouseMove(e)       // Track position & velocity
handleClick(e)           // Detect clicks on cat
cursor = {
  x, y,                  // Screen coordinates
  pageX, pageY,          // Page coordinates
  velocity,              // Movement speed
  isOnCat               // Hover state
}
```

#### 3.3 Cat Behavior State Machine
```javascript
updateCatBehavior(timestamp) {
  // Priority 1: Click reaction (600ms)
  if (clickReaction) → meow/scratch animation

  // Priority 2: Hover detection
  if (cursor.isOnCat) {
    if (hoverTime > 3s) → sleep/paw animation
    else → idle animation (8-way)
  }

  // Priority 3: Movement
  else {
    if (distance > 6px) {
      if (velocity > 15 OR distance > 200) → run (4-way)
      else → walk (8-way)
    }
    else → idle
  }
}
```

#### 3.4 Text Layout Engine
```javascript
prepareParagraphs()          // Find and cache paragraphs
findExclusionZones()         // Detect images/figures
findNearestParagraph()       // Get active paragraph
hideTextInParagraph()        // Make original text transparent
renderTextWithHole()         // Render on canvas with holes
  ├─ Build obstacle list (cat + images)
  ├─ Line-by-line processing
  ├─ Calculate blocked ranges
  ├─ Merge overlapping ranges
  └─ Render text segments
```

#### 3.5 Sprite Rendering
```javascript
renderCat() {
  // Get animation row and frame
  const row = ANIM_ROWS[cat.currentAnimation]
  const col = cat.frameIndex

  // Special handling for 8-frame run animations
  if (run animation && frameIndex >= 4) {
    actualRow = row + 1
    col = frameIndex - 4
  }

  // Draw sprite at cat position
  ctx.drawImage(catSprite, col*64, row*64, 64, 64, ...)
}
```

#### 3.6 Collectibles System
```javascript
initBowls()          // Spawn bowls in paragraphs
updateBowls()        // Check collisions
renderBowls()        // Draw animated bowls
  ├─ 4-frame animation cycle
  ├─ Bob effect (sin wave)
  └─ Scale pulse effect
```

#### 3.7 Audio System
```javascript
loadSound(filename)           // Load WAV via Web Audio API
playSound(name, variation)    // Play with pitch variation
soundBuffers = {
  walk,      // Walk_Alt01.wav
  collect,   // Collect_Big_Point.wav
  touch,     // Touch01.wav
  meow       // Cat_Meow.wav (1-second)
}
```

## Data Flow Diagrams

### User Interaction Flow
```
User moves cursor
       │
       ▼
handleMouseMove() ──────┐
       │                │
       ├─ Update cursor.x, cursor.y, cursor.pageX, cursor.pageY
       │                │
       ├─ Calculate velocity
       │                │
       └─ Check if cursor is on cat (collision detection)
                        │
                        ▼
              cursor.isOnCat updated
                        │
                        ▼
         ┌──────────────┴──────────────┐
         │                             │
     YES │                             │ NO
         ▼                             ▼
   Hover behavior              Movement behavior
    - Track hover time          - Calculate direction
    - Idle animation           - Determine walk/run
    - Sleep/paw if > 3s        - Update cat position
                                - Set animation
```

### Text Rendering Flow
```
renderFrame()
    │
    ├─ findNearestParagraph()
    │      │
    │      ├─ Check if cat is inside any paragraph
    │      └─ Find closest paragraph within 300px
    │
    ├─ hideTextInParagraph(para)
    │      └─ Set element color to transparent
    │
    └─ renderTextWithHole(para)
           │
           ├─ Get paragraph bounds and style
           │
           ├─ Calculate cat hole (circular, radius based on size)
           │
           ├─ Find overlapping exclusion zones (images/figures)
           │      └─ Convert to local coordinates
           │
           ├─ For each text line:
           │      │
           │      ├─ Check intersection with obstacles
           │      │      ├─ Cat (circular): chord calculation
           │      │      └─ Images (rect): bounds check
           │      │
           │      ├─ Merge overlapping blocked ranges
           │      │
           │      └─ Render text segments around blocks
           │
           └─ Restore context
```

### Animation State Transitions
```
                    ┌─────────────────────┐
                    │   Initial State     │
                    │   (idleDown)        │
                    └──────────┬──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
    ┌───────▼────────┐  ┌──────▼─────┐  ┌────────▼────────┐
    │   User Click   │  │ Cursor on  │  │  Cursor away    │
    │                │  │    Cat     │  │   from Cat      │
    └───────┬────────┘  └──────┬─────┘  └────────┬────────┘
            │                  │                  │
            │                  │                  │
    ┌───────▼────────┐  ┌──────▼─────┐  ┌────────▼────────┐
    │ Click Reaction │  │   Hover    │  │    Movement     │
    │  (600ms)       │  │   Timer    │  │   Behavior      │
    │                │  │            │  │                 │
    │ • meow/scratch │  │ < 3s: idle │  │ distance > 6px: │
    │ • play sound   │  │ > 3s:sleep │  │  • walk/run     │
    └───────┬────────┘  │      /paw  │  │ distance ≤ 6px: │
            │           └──────┬─────┘  │  • idle         │
            │                  │        └────────┬────────┘
            │                  │                 │
            └──────────────────┴─────────────────┘
                               │
                               ▼
                   ┌───────────────────────┐
                   │  Return to Idle or    │
                   │  Continue Movement    │
                   └───────────────────────┘
```

## Performance Considerations

### Render Loop Optimization
```javascript
renderFrame(timestamp) {
  // 1. Clear canvas (full repaint)
  ctx.clearRect(0, 0, width, height)

  // 2. Update logic (minimal computation)
  updateCatBehavior(timestamp)
  updateBowls()

  // 3. Find active paragraph (cached with getters)
  const nearPara = findNearestParagraph()

  // 4. Render layers (back to front)
  renderBowls()          // Collectibles
  renderCat()            // Main character
  renderUI()             // HUD overlay

  // 5. Schedule next frame
  requestAnimationFrame(renderFrame)
}
```

### Memory Management
- **Lazy evaluation**: Paragraph/exclusion zone positions use getters
- **Event cleanup**: Listeners removed on stop()
- **Resource cleanup**: Canvas/context nulled on destroy
- **No memory leaks**: No circular references, proper cleanup

### CPU Optimization
- **Off-screen culling**: Skip rendering bowls/paragraphs outside viewport
- **Cached queries**: Paragraph list built once, reused
- **Minimal DOM access**: Read-only queries, no frequent mutations
- **Efficient collision**: Simple distance checks, no complex physics

## Security Considerations

### Content Security Policy (CSP)
- No inline scripts (all code in .js files)
- No eval() or Function() constructors
- No external resource loading (all assets bundled)

### Permissions
- `storage`: For settings persistence (minimal data)
- `activeTab`: Only active tab access (not all tabs)
- `scripting`: For content script injection
- `<all_urls>`: Required for content script (could be restricted per-site)

### Data Privacy
- No external API calls
- No analytics/tracking
- No user data collection
- All processing local to browser

## Extension Manifest (V3)

```json
{
  "manifest_version": 3,
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }],
  "web_accessible_resources": [{
    "resources": ["sprites/*", "catchar.png", "items.png"],
    "matches": ["<all_urls>"]
  }]
}
```

## File Structure
```
pixel-walker/
├── manifest.json              # Extension configuration
├── background.js              # Service worker
├── content.js                 # Main game logic (1012 lines)
├── popup.html                 # Settings UI
├── popup.js                   # Settings logic
├── popup.css                  # UI styling
├── catchar.png                # 64x64 cat sprite sheet (247KB)
├── items.png                  # 64x64 items sprite sheet (94KB)
├── sprites/
│   ├── Cat_Meow.wav          # 1-second meow (188KB)
│   ├── Walk_Alt01.wav        # Walk sound (19KB)
│   ├── Collect_Big_Point.wav # Collection sound (407KB)
│   └── Touch01.wav           # Touch sound (21KB)
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── docs/
    ├── IMPLEMENTATION_SUMMARY.md
    ├── SPRITE_MAPPING.md
    ├── TESTING_CHECKLIST.md
    └── ARCHITECTURE.md (this file)
```

## Future Architecture Enhancements

### Potential Optimizations
1. **IntersectionObserver**: Replace manual paragraph detection
2. **OffscreenCanvas**: Move rendering off main thread
3. **Web Workers**: Heavy computation (exclusion zones) in worker
4. **Spatial indexing**: Quadtree for collision detection

### Feature Extensions
1. **Multi-character support**: Different pets (dog, hamster, etc.)
2. **Particle effects**: Paw prints, sparkles on collection
3. **Advanced AI**: More complex behavior trees
4. **Social features**: Cat-to-cat interactions across tabs
5. **Customization**: User-uploaded sprite sheets

### Code Quality
1. **TypeScript migration**: Type safety for large codebase
2. **Module system**: Split content.js into focused modules
3. **Unit tests**: Jest/Vitest for behavior logic
4. **E2E tests**: Puppeteer for full integration testing

---

**Architecture Version**: 1.0
**Last Updated**: 2026-04-03
**Total Lines of Code**: ~1500 (content.js: 1012, popup.js: 182, background.js: minimal)
