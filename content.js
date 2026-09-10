// Cursor-Following Cat Extension
// A playful cat that follows your cursor with interactive behaviors

// ===== CONFIGURATION =====
const SPRITE_SIZE = 64; // Size of each sprite frame (changed from 16 to 64)
const SPRITE_SCALE = 1.5; // Scaling factor for display
const FRAME_DURATION = 110; // milliseconds per animation frame
const WALK_FRAMES = 4;
const RUN_FRAMES = 8;
const IDLE_TIME_THRESHOLD = 3000; // 3 seconds of hover triggers special idle animations
const BOWL_COUNT = 14;
const BOWL_SIZE = 64; // Bowl sprite size
const BOWL_SCALE = 1.2;

// Sprite row indices from catchar.png (64x64 sprites)
// Based on "black cat with text.png" labels
const ANIM_ROWS = {
  // Row 0: Idle down (4 frames)
  idleDown: 0,
  // Row 1: Idle down-left (4 frames)
  idleDownLeft: 1,
  // Row 2: Idle left (4 frames)
  idleLeft: 2,
  // Row 3: Idle up-left (4 frames)
  idleUpLeft: 3,
  // Row 4: Idle up (4 frames)
  idleUp: 4,
  // Row 5: Idle up-right (4 frames)
  idleUpRight: 5,
  // Row 6: Idle right (4 frames)
  idleRight: 6,
  // Row 7: Idle down-right (4 frames)
  idleDownRight: 7,

  // Row 8: Walk down (4 frames)
  walkDown: 8,
  // Row 9: Walk down-left (4 frames)
  walkDownLeft: 9,
  // Row 10: Walk left (4 frames)
  walkLeft: 10,
  // Row 11: Walk up-left (4 frames)
  walkUpLeft: 11,
  // Row 12: Walk up (4 frames)
  walkUp: 12,
  // Row 13: Walk up-right (4 frames)
  walkUpRight: 13,
  // Row 14: Walk right (4 frames)
  walkRight: 14,
  // Row 15: Walk down-right (4 frames)
  walkDownRight: 15,

  // Run animations (8 frames each, 4 directions)
  // Row 16-17: Run down (8 frames across 2 rows)
  runDown: 16,
  // Row 18-19: Run left (8 frames)
  runLeft: 18,
  // Row 20-21: Run up (8 frames)
  runUp: 20,
  // Row 22-23: Run right (8 frames)
  runRight: 22,

  // Sleep animations (4 directions, multiple frames)
  sleepDown: 24,
  sleepLeft: 26,
  sleepUp: 28,
  sleepRight: 30,

  // Paw animations (4 directions)
  pawDown: 32,
  pawLeft: 34,
  pawUp: 36,
  pawRight: 38,

  // Scratch animations (4 directions)
  scratchDown: 40,
  scratchLeft: 42,
  scratchUp: 44,
  scratchRight: 46,

  // Meow animations (4 directions)
  meowDown: 48,
  meowLeft: 50,
  meowUp: 52,
  meowRight: 54
};

// ===== GLOBAL STATE =====
let isEnabled = false;
let soundEnabled = true;
let catSpeed = 1.8;
let catSize = 3;

let audioContext = null;
let soundBuffers = {};

let catSprite = null;
let bowlSprite = null;
let canvas = null;
let ctx = null;
let animationFrameId = null;

// Pretext layout library data
let preparedParagraphs = [];
let currentParagraph = null;
let exclusionZones = []; // For images and other DOM elements

// Cat state
const cat = {
  x: 300,
  y: 300,
  direction: 'down',
  frameIndex: 0,
  lastFrameTime: 0,
  isMoving: false,
  hoverTime: 0,
  hoverStartTime: 0,
  currentAnimation: 'idleDown',
  clickReactionTime: 0
};

// Cursor state
const cursor = {
  x: 0,
  y: 0,
  pageX: 0,
  pageY: 0,
  isOnCat: false,
  velocity: 0,
  lastX: 0,
  lastY: 0
};

// Bowls (collectibles)
let bowls = [];
let collectedBowls = 0;

// ===== UTILITY FUNCTIONS =====
function getResourceURL(filename) {
  return chrome.runtime.getURL(filename);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadSound(filename) {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  const response = await fetch(getResourceURL(`sprites/${filename}`));
  const arrayBuffer = await response.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
}

function playSound(soundName, pitchVariation = 0) {
  if (!soundEnabled || !audioContext || !soundBuffers[soundName]) return;

  try {
    const source = audioContext.createBufferSource();
    source.buffer = soundBuffers[soundName];
    source.playbackRate.value = 1 + (Math.random() - 0.5) * pitchVariation;

    const gain = audioContext.createGain();
    gain.gain.value = soundName === 'walk' ? 0.2 : 0.45;

    source.connect(gain);
    gain.connect(audioContext.destination);
    source.start();
  } catch (e) {
    // Silently fail
  }
}

function getDistance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function getDirection8Way(dx, dy) {
  if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) return cat.direction;

  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  if (angle >= -22.5 && angle < 22.5) return 'right';
  if (angle >= 22.5 && angle < 67.5) return 'downRight';
  if (angle >= 67.5 && angle < 112.5) return 'down';
  if (angle >= 112.5 && angle < 157.5) return 'downLeft';
  if (angle >= 157.5 || angle < -157.5) return 'left';
  if (angle >= -157.5 && angle < -112.5) return 'upLeft';
  if (angle >= -112.5 && angle < -67.5) return 'up';
  return 'upRight';
}

function getDirection4Way(dir8) {
  const mapping = {
    down: 'down', downLeft: 'left', left: 'left', upLeft: 'left',
    up: 'up', upRight: 'right', right: 'right', downRight: 'right'
  };
  return mapping[dir8] || 'down';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===== CANVAS MANAGEMENT =====
function createCanvas() {
  if (canvas) return;

  canvas = document.createElement('canvas');
  canvas.id = 'cat-overlay';
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '2147483640'
  });

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  window.addEventListener('resize', () => {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });
}

function destroyCanvas() {
  if (canvas) {
    canvas.remove();
    canvas = null;
    ctx = null;
  }
}

// ===== CURSOR TRACKING =====
function initCursorTracking() {
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('click', handleClick);
}

function removeCursorTracking() {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('click', handleClick);
}

function handleMouseMove(e) {
  cursor.lastX = cursor.pageX;
  cursor.lastY = cursor.pageY;
  cursor.pageX = e.pageX;
  cursor.pageY = e.pageY;
  cursor.x = e.clientX;
  cursor.y = e.clientY;

  // Calculate cursor velocity
  const dx = cursor.pageX - cursor.lastX;
  const dy = cursor.pageY - cursor.lastY;
  cursor.velocity = Math.hypot(dx, dy);

  // Check if cursor is on cat
  const catScreenX = cat.x - window.scrollX;
  const catScreenY = cat.y - window.scrollY;
  const catHitbox = SPRITE_SIZE * catSize * SPRITE_SCALE;
  const distance = getDistance(cursor.x, cursor.y, catScreenX, catScreenY);

  const wasOnCat = cursor.isOnCat;
  cursor.isOnCat = distance < catHitbox / 2;

  if (cursor.isOnCat && !wasOnCat) {
    cat.hoverStartTime = Date.now();
  } else if (!cursor.isOnCat && wasOnCat) {
    cat.hoverTime = 0;
  }
}

function handleClick(e) {
  if (!cursor.isOnCat) return;

  // Cat reacts to click with meow sound and animation
  cat.clickReactionTime = Date.now();
  playSound('meow', 0.1);

  // Trigger meow or scratch animation based on 4-way direction
  const dir4 = getDirection4Way(cat.direction);
  const animations = Math.random() > 0.5 ?
    ['meowDown', 'meowLeft', 'meowUp', 'meowRight'] :
    ['scratchDown', 'scratchLeft', 'scratchUp', 'scratchRight'];

  const dirIndex = ['down', 'left', 'up', 'right'].indexOf(dir4);
  cat.currentAnimation = animations[dirIndex];
  cat.frameIndex = 0;
}

// ===== IMAGE/ELEMENT EXCLUSION FOR TEXT LAYOUT =====
function findExclusionZones() {
  exclusionZones = [];

  // Find images
  document.querySelectorAll('img').forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.width > 20 && rect.height > 20) {
      exclusionZones.push({
        element: img,
        get rect() { return this.element.getBoundingClientRect(); },
        get pageX() { return this.rect.left + window.scrollX; },
        get pageY() { return this.rect.top + window.scrollY; },
        get width() { return this.rect.width; },
        get height() { return this.rect.height; }
      });
    }
  });

  // Find figures
  document.querySelectorAll('figure').forEach(fig => {
    const rect = fig.getBoundingClientRect();
    if (rect.width > 20 && rect.height > 20) {
      exclusionZones.push({
        element: fig,
        get rect() { return this.element.getBoundingClientRect(); },
        get pageX() { return this.rect.left + window.scrollX; },
        get pageY() { return this.rect.top + window.scrollY; },
        get width() { return this.rect.width; },
        get height() { return this.rect.height; }
      });
    }
  });

  // Find elements with background images
  document.querySelectorAll('*').forEach(el => {
    const style = window.getComputedStyle(el);
    const bgImage = style.backgroundImage;
    if (bgImage && bgImage !== 'none' && !bgImage.includes('gradient')) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 40 && rect.height > 40) {
        exclusionZones.push({
          element: el,
          get rect() { return this.element.getBoundingClientRect(); },
          get pageX() { return this.rect.left + window.scrollX; },
          get pageY() { return this.rect.top + window.scrollY; },
          get width() { return this.rect.width; },
          get height() { return this.rect.height; }
        });
      }
    }
  });

  console.log(`[Cat] Found ${exclusionZones.length} exclusion zones (images/figures)`);
}

// ===== PARAGRAPH TEXT PROCESSING =====
function prepareParagraphs() {
  preparedParagraphs = [];

  // Find paragraphs on page
  const paragraphSelectors = [
    'p',
    'article p',
    'main p',
    '.mw-parser-output > p',
    '.post-content p',
    '.entry-content p',
    '[role="main"] p'
  ];

  document.querySelectorAll(paragraphSelectors.join(', ')).forEach(el => {
    const text = el.innerText?.trim();
    if (!text || text.length < 60) return;

    const rect = el.getBoundingClientRect();
    if (rect.width < 80 || rect.height < 10) return;

    const style = window.getComputedStyle(el);

    preparedParagraphs.push({
      element: el,
      text: text,
      rect: rect,
      style: style,
      hidden: false,
      originalColor: '',
      get pageX() { return el.getBoundingClientRect().left + window.scrollX; },
      get pageY() { return el.getBoundingClientRect().top + window.scrollY; }
    });
  });

  console.log(`[Cat] Prepared ${preparedParagraphs.length} paragraphs`);
}

function findNearestParagraph() {
  if (!preparedParagraphs.length) return null;

  // First check if cat is inside any paragraph
  for (const para of preparedParagraphs) {
    const rect = para.element.getBoundingClientRect();
    const pageX = rect.left + window.scrollX;
    const pageY = rect.top + window.scrollY;

    if (cat.x >= pageX - 10 && cat.x <= pageX + rect.width + 10 &&
        cat.y >= pageY - 10 && cat.y <= pageY + rect.height + 10) {
      return para;
    }
  }

  // Otherwise find closest
  let nearest = null;
  let minDist = Infinity;

  for (const para of preparedParagraphs) {
    const rect = para.element.getBoundingClientRect();
    const centerX = rect.left + window.scrollX + rect.width / 2;
    const centerY = rect.top + window.scrollY + rect.height / 2;
    const dist = getDistance(cat.x, cat.y, centerX, centerY);

    if (dist < minDist) {
      minDist = dist;
      nearest = para;
    }
  }

  return minDist < 300 ? nearest : null;
}

function hideTextInParagraph(para) {
  if (para.hidden) return;

  para.originalColor = para.element.style.color;
  para.element.style.color = 'transparent';
  para.element.querySelectorAll('*').forEach(child => {
    child._catOrigColor = child.style.color;
    child.style.color = 'transparent';
  });
  para.hidden = true;
}

function showTextInParagraph(para) {
  if (!para.hidden) return;

  para.element.style.color = para.originalColor;
  para.element.querySelectorAll('*').forEach(child => {
    child.style.color = child._catOrigColor || '';
  });
  para.hidden = false;
}

function renderTextWithHole(para) {
  const rect = para.element.getBoundingClientRect();
  const x = rect.left;
  const y = rect.top;

  // Skip if off-screen
  if (y + rect.height < -20 || y > window.innerHeight + 20) return;

  // Calculate hole around cat
  const catLocalX = cat.x - window.scrollX - x;
  const catLocalY = cat.y - window.scrollY - y;
  const holeRadius = 20 + catSize * SPRITE_SCALE * 7;

  // Build list of obstacles (cat + exclusion zones)
  const obstacles = [{
    x: catLocalX,
    y: catLocalY,
    radius: holeRadius
  }];

  // Add exclusion zones that overlap this paragraph
  for (const zone of exclusionZones) {
    const zoneRect = zone.rect;
    const paraRect = para.element.getBoundingClientRect();

    // Check if zone overlaps with paragraph
    if (!(zoneRect.right < paraRect.left || zoneRect.left > paraRect.right ||
          zoneRect.bottom < paraRect.top || zoneRect.top > paraRect.bottom)) {

      // Convert to local coordinates
      const zoneLocalX = zone.pageX - window.scrollX - x;
      const zoneLocalY = zone.pageY - window.scrollY - y;

      obstacles.push({
        x: zoneLocalX + zone.width / 2,
        y: zoneLocalY + zone.height / 2,
        width: zone.width,
        height: zone.height,
        isRect: true
      });
    }
  }

  ctx.save();
  ctx.font = para.style.font || '16px sans-serif';
  ctx.fillStyle = para.style.color || '#000';
  ctx.textBaseline = 'alphabetic';

  // Clip to paragraph bounds
  ctx.beginPath();
  ctx.rect(x, y, rect.width, rect.height);
  ctx.clip();

  // Simple line-by-line rendering with holes
  const lineHeight = parseFloat(para.style.lineHeight) || parseFloat(para.style.fontSize) * 1.6;
  const lines = para.text.split('\n');
  let currentY = lineHeight * 0.82;

  for (const line of lines) {
    const lineMiddleY = currentY - lineHeight * 0.3;

    // Check if line intersects with any obstacle
    let blockedRanges = [];

    for (const obs of obstacles) {
      if (obs.isRect) {
        // Rectangle obstacle (image/figure)
        const obsTop = obs.y - obs.height / 2;
        const obsBottom = obs.y + obs.height / 2;

        if (lineMiddleY >= obsTop && lineMiddleY <= obsBottom) {
          const leftEdge = obs.x - obs.width / 2;
          const rightEdge = obs.x + obs.width / 2;
          blockedRanges.push({ left: leftEdge - 5, right: rightEdge + 5 });
        }
      } else {
        // Circular obstacle (cat)
        const distY = Math.abs(obs.y - lineMiddleY);

        if (distY < obs.radius) {
          const distX = Math.sqrt(Math.max(0, obs.radius * obs.radius - distY * distY));
          const leftEdge = obs.x - distX - 2;
          const rightEdge = obs.x + distX + 2;
          blockedRanges.push({ left: leftEdge, right: rightEdge });
        }
      }
    }

    if (blockedRanges.length > 0) {
      // Merge overlapping ranges
      blockedRanges.sort((a, b) => a.left - b.left);
      const merged = [blockedRanges[0]];
      for (let i = 1; i < blockedRanges.length; i++) {
        const last = merged[merged.length - 1];
        const current = blockedRanges[i];
        if (current.left <= last.right) {
          last.right = Math.max(last.right, current.right);
        } else {
          merged.push(current);
        }
      }

      // Render text around blocked ranges
      const metrics = ctx.measureText(line);
      const charWidth = metrics.width / line.length;

      let lastEnd = 0;
      for (const range of merged) {
        const startChar = Math.floor(range.left / charWidth);
        if (startChar > lastEnd + 3) {
          const segment = line.slice(lastEnd, startChar);
          ctx.fillText(segment, x + lastEnd * charWidth, y + currentY);
        }
        lastEnd = Math.ceil(range.right / charWidth);
      }

      // Render remaining text after last blocked range
      if (lastEnd < line.length - 3) {
        const segment = line.slice(lastEnd);
        ctx.fillText(segment, x + lastEnd * charWidth, y + currentY);
      }
    } else {
      // Line doesn't intersect - render normally
      ctx.fillText(line, x, y + currentY);
    }

    currentY += lineHeight;
    if (currentY > rect.height + lineHeight * 2) break;
  }

  ctx.restore();
}

// ===== BOWLS (COLLECTIBLES) =====
function initBowls() {
  bowls = [];

  if (!preparedParagraphs.length) return;

  for (let i = 0; i < BOWL_COUNT; i++) {
    const para = preparedParagraphs[Math.floor(Math.random() * preparedParagraphs.length)];
    const rect = para.element.getBoundingClientRect();
    const margin = 30;

    bowls.push({
      x: para.pageX + margin + Math.random() * Math.max(0, rect.width - margin * 2),
      y: para.pageY + margin + Math.random() * Math.max(0, rect.height - margin * 2),
      collected: false,
      pulse: Math.random() * Math.PI * 2
    });
  }
}

function updateBowls() {
  bowls.forEach(bowl => {
    if (bowl.collected) return;

    // Check collision with cat
    const distance = getDistance(cat.x, cat.y, bowl.x, bowl.y);
    if (distance < 30 + catSize * SPRITE_SCALE * 8) {
      bowl.collected = true;
      collectedBowls++;
      playSound('collect', 0.08);

      // Respawn bowl after delay
      setTimeout(() => {
        if (!preparedParagraphs.length) return;

        const para = preparedParagraphs[Math.floor(Math.random() * preparedParagraphs.length)];
        const rect = para.element.getBoundingClientRect();
        const margin = 30;

        bowl.x = para.pageX + margin + Math.random() * Math.max(0, rect.width - margin * 2);
        bowl.y = para.pageY + margin + Math.random() * Math.max(0, rect.height - margin * 2);
        bowl.collected = false;
      }, 4000);
    }
  });
}

function renderBowls() {
  if (!bowlSprite) return;

  bowls.forEach(bowl => {
    if (bowl.collected) return;

    const screenX = bowl.x - window.scrollX;
    const screenY = bowl.y - window.scrollY;

    // Skip if off-screen
    if (screenY < -50 || screenY > window.innerHeight + 50) return;

    bowl.pulse += 0.055;
    const bobOffset = Math.sin(bowl.pulse) * 2;
    const scale = BOWL_SCALE + Math.sin(bowl.pulse * 2) * 0.1;

    // Draw bowl from items.png (bottom row, 64x64 sprites)
    // Bowls are in row 3 (y=192), frames 0-3
    const frame = Math.floor((bowl.pulse * 2) / Math.PI) % 4;
    const spriteX = frame * 64;
    const spriteY = 192; // Row 3 (64*3)

    ctx.save();
    ctx.shadowColor = 'rgba(139, 69, 19, 0.4)';
    ctx.shadowBlur = 5;
    ctx.drawImage(
      bowlSprite,
      spriteX, spriteY, 64, 64,
      screenX - 32 * scale, screenY + bobOffset - 32 * scale,
      64 * scale, 64 * scale
    );
    ctx.restore();
  });
}

// ===== CAT BEHAVIOR & ANIMATION =====
function updateCatBehavior(timestamp) {
  const dt = timestamp - (cat.lastFrameTime || timestamp);

  // Handle click reaction
  if (cat.clickReactionTime > 0 && timestamp - cat.clickReactionTime < 600) {
    // Stay in reaction animation
    if (timestamp - cat.lastFrameTime > FRAME_DURATION) {
      cat.frameIndex = (cat.frameIndex + 1) % 4;
      cat.lastFrameTime = timestamp;
    }
    return;
  } else if (cat.clickReactionTime > 0) {
    cat.clickReactionTime = 0;
  }

  // Update hover time
  if (cursor.isOnCat) {
    cat.hoverTime = timestamp - cat.hoverStartTime;
  } else {
    cat.hoverTime = 0;
  }

  // Determine behavior based on cursor state
  if (cursor.isOnCat) {
    // Cursor is on cat - idle behavior
    cat.isMoving = false;

    if (cat.hoverTime > IDLE_TIME_THRESHOLD) {
      // Long hover - special animations (sleep or paw)
      const dir8 = cat.direction;
      const dir4 = getDirection4Way(dir8);
      const specialAnims = Math.random() > 0.5 ?
        ['sleepDown', 'sleepLeft', 'sleepUp', 'sleepRight'] :
        ['pawDown', 'pawLeft', 'pawUp', 'pawRight'];

      const dirIndex = ['down', 'left', 'up', 'right'].indexOf(dir4);
      cat.currentAnimation = specialAnims[dirIndex];
    } else {
      // Normal idle
      cat.currentAnimation = `idle${capitalize(cat.direction)}`;
    }
  } else {
    // Cursor is not on cat - follow it
    cat.isMoving = true;

    const dx = cursor.pageX - cat.x;
    const dy = cursor.pageY - cat.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 6) {
      // Determine speed - run if cursor is fast or far
      const shouldRun = cursor.velocity > 15 || distance > 200;
      const speed = (shouldRun ? catSpeed * 2.5 : catSpeed) * (catSize / 3);

      // Move towards cursor
      const vx = (dx / distance) * speed;
      const vy = (dy / distance) * speed;

      cat.x += vx;
      cat.y += vy;

      // Update direction (8-way for walk, 4-way for run)
      cat.direction = getDirection8Way(vx, vy);

      // Set animation
      if (shouldRun) {
        const dir4 = getDirection4Way(cat.direction);
        const runAnims = ['runDown', 'runLeft', 'runUp', 'runRight'];
        const dirIndex = ['down', 'left', 'up', 'right'].indexOf(dir4);
        cat.currentAnimation = runAnims[dirIndex];
      } else {
        cat.currentAnimation = `walk${capitalize(cat.direction)}`;
      }
    } else {
      cat.isMoving = false;
      cat.currentAnimation = `idle${capitalize(cat.direction)}`;
    }
  }

  // Keep cat in bounds
  const maxX = Math.max(document.body.scrollWidth, window.innerWidth);
  const maxY = Math.max(document.body.scrollHeight, window.innerHeight);
  cat.x = Math.max(40, Math.min(maxX - 40, cat.x));
  cat.y = Math.max(40, Math.min(maxY - 40, cat.y));

  // Update animation frame
  if (timestamp - cat.lastFrameTime > FRAME_DURATION) {
    const maxFrames = cat.currentAnimation.includes('run') ? RUN_FRAMES : WALK_FRAMES;
    cat.frameIndex = (cat.frameIndex + 1) % maxFrames;
    cat.lastFrameTime = timestamp;

    // Play walk sound occasionally
    if (cat.isMoving && cat.frameIndex % 2 === 0) {
      playSound('walk', 0.12);
    }
  }
}

function renderCat() {
  if (!catSprite) return;

  const screenX = cat.x - window.scrollX;
  const screenY = cat.y - window.scrollY;

  const spriteW = SPRITE_SIZE;
  const spriteH = SPRITE_SIZE;
  const displayW = spriteW * catSize * SPRITE_SCALE;
  const displayH = spriteH * catSize * SPRITE_SCALE;

  // Draw shadow
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.beginPath();
  ctx.ellipse(screenX, screenY + displayH * 0.38, displayW * 0.3, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Get sprite row for current animation
  const row = ANIM_ROWS[cat.currentAnimation] || 0;

  // For run animations, handle 8-frame layout across 2 rows
  let col = cat.frameIndex;
  let actualRow = row;

  if (cat.currentAnimation.includes('run')) {
    // Run animations have 8 frames across 2 rows (4 frames per row)
    if (cat.frameIndex >= 4) {
      actualRow = row + 1;
      col = cat.frameIndex - 4;
    }
  }

  // Draw cat sprite
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    catSprite,
    col * spriteW, actualRow * spriteH, spriteW, spriteH,
    screenX - displayW / 2, screenY - displayH / 2,
    displayW, displayH
  );
  ctx.restore();
}

// ===== UI RENDERING =====
function renderUI() {
  const uncollectedBowls = bowls.filter(b => !b.collected).length;

  ctx.save();

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.roundRect(8, 8, 116, 26, 6);
  ctx.fill();

  // Text
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`🍜 ${collectedBowls}   ${uncollectedBowls} left`, 16, 21);

  ctx.restore();
}

// ===== MAIN RENDER LOOP =====
function renderFrame(timestamp) {
  if (!isEnabled) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update cat behavior
  updateCatBehavior(timestamp);

  // Update bowls
  updateBowls();

  // Find and process current paragraph
  const nearPara = findNearestParagraph();

  if (currentParagraph && currentParagraph !== nearPara) {
    showTextInParagraph(currentParagraph);
  }

  if (nearPara) {
    hideTextInParagraph(nearPara);
    renderTextWithHole(nearPara);
  }

  currentParagraph = nearPara;

  // Render game elements
  renderBowls();
  renderCat();
  renderUI();

  animationFrameId = requestAnimationFrame(renderFrame);
}

// ===== INITIALIZATION & CLEANUP =====
async function start() {
  if (isEnabled) return;

  isEnabled = true;
  createCanvas();

  // Load cat sprite from root directory (catchar.png, 64x64 sprites)
  try {
    catSprite = await loadImage(chrome.runtime.getURL('catchar.png'));
    console.log('[Cat] Loaded catchar.png sprite sheet');
  } catch (e) {
    console.error('[Cat] Failed to load cat sprite:', e);
  }

  // Load bowl sprite from items.png (64x64 sprites)
  try {
    bowlSprite = await loadImage(chrome.runtime.getURL('items.png'));
    console.log('[Cat] Loaded items.png sprite sheet');
  } catch (e) {
    console.error('[Cat] Failed to load items sprite:', e);
  }

  // Load sounds
  try {
    const [walk, collect, touch, meow] = await Promise.all([
      loadSound('Walk_Alt01.wav'),
      loadSound('Collect_Big_Point.wav'),
      loadSound('Touch01.wav'),
      loadSound('Cat_Meow.wav') // 1-second version
    ]);

    soundBuffers = { walk, collect, touch, meow };
    console.log('[Cat] Loaded sounds');
  } catch (e) {
    console.error('[Cat] Failed to load sounds:', e);
  }

  // Prepare page content
  prepareParagraphs();
  findExclusionZones();

  // Initialize cat position
  cat.x = window.scrollX + window.innerWidth / 2;
  cat.y = window.scrollY + window.innerHeight / 2;

  // Initialize bowls
  initBowls();

  // Start cursor tracking
  initCursorTracking();

  // Start render loop
  animationFrameId = requestAnimationFrame(renderFrame);

  console.log('[Cat] Started!');
}

function stop() {
  isEnabled = false;

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (currentParagraph) {
    showTextInParagraph(currentParagraph);
    currentParagraph = null;
  }

  removeCursorTracking();
  destroyCanvas();

  bowls = [];
  collectedBowls = 0;
  preparedParagraphs = [];
  exclusionZones = [];

  console.log('[Cat] Stopped!');
}

function respawn() {
  cat.x = window.scrollX + window.innerWidth / 2;
  cat.y = window.scrollY + window.innerHeight / 2;
  cursor.velocity = 0;
}

// ===== MESSAGE HANDLERS =====
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SET_ENABLED') {
    soundEnabled = message.sound ?? true;
    catSpeed = message.speed ?? 1.8;
    catSize = message.size ?? 3;

    if (message.enabled) {
      start();
    } else {
      stop();
    }
  }

  if (message.type === 'UPDATE_SETTINGS') {
    if (message.speed !== undefined) catSpeed = message.speed;
    if (message.size !== undefined) catSize = message.size;
    if (message.sound !== undefined) soundEnabled = message.sound;
  }

  if (message.type === 'RESPAWN') {
    respawn();
  }

  if (message.type === 'GET_STATUS') {
    sendResponse({
      enabled: isEnabled,
      score: collectedBowls,
      paragraphCount: preparedParagraphs.length,
      coinsLeft: bowls.filter(b => !b.collected).length
    });
    return true;
  }
});

// ===== AUTO-START =====
chrome.storage.sync.get({
  enabled: false,
  speed: 1.8,
  size: 3,
  sound: true
}, settings => {
  catSpeed = settings.speed;
  catSize = settings.size;
  soundEnabled = settings.sound;

  if (settings.enabled) {
    start();
  }
});
