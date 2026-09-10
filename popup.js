// Animate the sprite preview in the popup header
const spriteCanvas = document.getElementById('spritePreview');
const spriteCtx = spriteCanvas.getContext('2d');
spriteCtx.imageSmoothingEnabled = false;

const previewCanvas = document.getElementById('previewCanvas');
const pCtx = previewCanvas.getContext('2d');
pCtx.imageSmoothingEnabled = false;

let spriteImg = null;
let frameIdx = 0;
let previewDir = 0; // row

// Load sprite for popup preview (using catchar.png with 64x64 sprites)
const img = new Image();
img.onload = () => {
  spriteImg = img;
  animatePreview();
};
img.src = chrome.runtime.getURL('catchar.png');

let lastFrame = 0;
function animatePreview(now = 0) {
  if (!spriteImg) return;
  if (now - lastFrame > 140) {
    frameIdx = (frameIdx + 1) % 4;
    lastFrame = now;
    // Cycle direction every 8 frames
    if (frameIdx === 0) previewDir = (previewDir + 1) % 8;
  }

  // Header sprite (small, just walking down) - now using 64x64 sprites
  spriteCtx.clearRect(0, 0, 16, 16);
  // Row 8 is walk down animation in catchar.png
  spriteCtx.drawImage(spriteImg, frameIdx * 64, 8 * 64, 64, 64, 0, 0, 16, 16);

  // Preview canvas — show character walking with text warp illustration
  pCtx.clearRect(0, 0, 456, 128);

  // Background text lines
  pCtx.font = '9px monospace';
  pCtx.fillStyle = 'rgba(180,220,180,0.5)';
  const lines = [
    'The quick brown fox jumps over the',
    'lazy dog. Pack my box with five',
    'dozen liquor jugs. How vexingly',
    'quick daft zebras jump! The five',
    'boxing wizards jump quickly now.',
    'Sphinx of black quartz judge vow.',
    'Blowzy red vixens fight for a jag.',
  ];

  // Character pos in preview
  const cx = 228 + Math.sin(Date.now() / 800) * 60;
  const cy = 64;
  const obsR = 22;

  lines.forEach((line, i) => {
    const y = 14 + i * 16;
    const lineY = y - 12;
    // Check if this line intersects the character circle
    const dy = cy - Math.max(lineY, Math.min(cy, lineY + 12));
    const overlap = Math.abs(cy - (lineY + 6)) < obsR + 6;

    if (overlap) {
      const halfChord = Math.sqrt(Math.max(0, obsR * obsR - Math.pow(cy - (lineY + 6), 2)));
      const blockLeft = cx - halfChord;
      const blockRight = cx + halfChord;
      // Left part
      const leftText = line.substring(0, Math.floor(blockLeft / 5.4));
      pCtx.fillText(leftText, 10, y);
      // Right part
      const rightText = line.substring(Math.floor(blockRight / 5.4));
      pCtx.fillText(rightText, blockRight + 4, y);
    } else {
      pCtx.fillText(line, 10, y);
    }
  });

  // Draw coin in preview
  pCtx.save();
  pCtx.shadowColor = 'rgba(255,215,0,0.6)';
  pCtx.shadowBlur = 4;
  pCtx.beginPath();
  pCtx.arc(150 + Math.sin(Date.now() / 600) * 10, 40, 5, 0, Math.PI * 2);
  pCtx.fillStyle = '#FFD700';
  pCtx.fill();
  pCtx.restore();

  // Draw character sprite in preview - using 64x64 sprites
  pCtx.imageSmoothingEnabled = false;
  // Use walk animations: rows 8-15 are walk animations
  const walkRow = 8 + previewDir; // Walk down, downLeft, left, upLeft, up, upRight, right, downRight
  pCtx.drawImage(spriteImg, frameIdx * 64, walkRow * 64, 64, 64,
    cx - 24, cy - 28, 48, 48);

  requestAnimationFrame(animatePreview);
}

// ─── State ────────────────────────────────────────────────────────────────────
let state = { enabled: false, speed: 1.4, size: 3, sound: true };

function updateUI() {
  document.getElementById('mainToggle').checked = state.enabled;
  document.getElementById('mainBtn').textContent = state.enabled ? 'Disable' : 'Enable';
  document.getElementById('mainBtn').className = state.enabled ? 'btn' : 'btn btn-primary';
  document.getElementById('speedSlider').value = state.speed;
  document.getElementById('speedVal').textContent = state.speed + '×';
  document.getElementById('sizeSlider').value = state.size;
  document.getElementById('sizeVal').textContent = state.size + '×';
  document.getElementById('soundToggle').checked = state.sound;
}

function sendToTab(msg) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]?.id) chrome.tabs.sendMessage(tabs[0].id, msg);
  });
}

// Poll status from content script
function pollStatus() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs[0]?.id) return;
    chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_STATUS' }, resp => {
      if (chrome.runtime.lastError) return;
      if (resp) {
        document.getElementById('statScore').textContent = resp.score ?? 0;
        document.getElementById('statParas').textContent = resp.paragraphCount ?? '—';
      }
    });
  });
}

// ─── Events ───────────────────────────────────────────────────────────────────
document.getElementById('mainToggle').addEventListener('change', e => {
  state.enabled = e.target.checked;
  chrome.storage.sync.set({ enabled: state.enabled });
  sendToTab({ type: 'SET_ENABLED', enabled: state.enabled, speed: state.speed, size: state.size, sound: state.sound });
  updateUI();
});

document.getElementById('mainBtn').addEventListener('click', () => {
  state.enabled = !state.enabled;
  chrome.storage.sync.set({ enabled: state.enabled });
  sendToTab({ type: 'SET_ENABLED', enabled: state.enabled, speed: state.speed, size: state.size, sound: state.sound });
  updateUI();
  document.getElementById('mainBtn').textContent = '✓ Done!';
  setTimeout(() => updateUI(), 800);
});

document.getElementById('speedSlider').addEventListener('input', e => {
  state.speed = parseFloat(e.target.value);
  document.getElementById('speedVal').textContent = state.speed + '×';
  sendToTab({ type: 'UPDATE_SETTINGS', speed: state.speed });
  chrome.storage.sync.set({ speed: state.speed });
});

document.getElementById('sizeSlider').addEventListener('input', e => {
  state.size = parseInt(e.target.value);
  document.getElementById('sizeVal').textContent = state.size + '×';
  sendToTab({ type: 'UPDATE_SETTINGS', size: state.size });
  chrome.storage.sync.set({ size: state.size });
});

document.getElementById('soundToggle').addEventListener('change', e => {
  state.sound = e.target.checked;
  sendToTab({ type: 'UPDATE_SETTINGS', sound: state.sound });
  chrome.storage.sync.set({ sound: state.sound });
});

document.getElementById('respawnBtn').addEventListener('click', () => {
  sendToTab({ type: 'RESPAWN' });
  document.getElementById('respawnBtn').textContent = '✓ Done!';
  setTimeout(() => { document.getElementById('respawnBtn').textContent = '↺ Respawn'; }, 800);
});

// ─── Init ─────────────────────────────────────────────────────────────────────
chrome.storage.sync.get({ enabled: false, speed: 1.4, size: 3, sound: true }, saved => {
  state = { ...state, ...saved };
  updateUI();
  pollStatus();
});

setInterval(pollStatus, 2000);
