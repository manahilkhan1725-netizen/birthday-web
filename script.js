/* ==========================================================================
   BIRTHDAY CINEMA - INTERACTIVE ENGINE
   ========================================================================== */

// --- Global State ---
const state = {
  currentScene: 'opening',
  name: 'Alex',
  year: '2026',
  filmIndex: 0,
  totalFilmFrames: 4,
  isLetterOpen: false,
  isCandlesBlown: false,
  isMusicPlaying: false,
  audioContext: null
};

// --- DOM Elements ---
const bgm = document.getElementById('bgm');
const soundBtn = document.getElementById('sound-btn');
const soundLabel = document.getElementById('sound-label');
const customModal = document.getElementById('customModal');
const inputName = document.getElementById('inputName');
const inputYear = document.getElementById('inputYear');
const inputMessage = document.getElementById('inputMessage');
const inputPhotos = document.getElementById('inputPhotos');
const customLetterText = document.getElementById('customLetterText');

// --- Initialization ---
window.addEventListener('DOMContentLoaded', () => {
  loadSavedCustomizations();
  initAmbientCanvas();
  initConfettiCanvas();
  initTouchGestures();
  updateFilmReel();
});

// ==========================================================================
// SCENE NAVIGATION
// ==========================================================================
function goToScreen(screenName) {
  unlockAudio();
  playChimeSound();

  const allScenes = document.querySelectorAll('.scene');
  allScenes.forEach(scene => scene.classList.remove('active'));

  const target = document.getElementById(`screen-${screenName}`);
  if (target) {
    target.classList.add('active');
    state.currentScene = screenName;
  }
}

// ==========================================================================
// AUDIO & SOUND SYNTHESIS
// ==========================================================================
function unlockAudio() {
  if (!state.audioContext) {
    state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (state.audioContext.state === 'suspended') {
    state.audioContext.resume();
  }
  if (!state.isMusicPlaying && bgm) {
    bgm.volume = 0.65;
    bgm.play().then(() => {
      state.isMusicPlaying = true;
      soundBtn.classList.add('sound-playing');
      soundLabel.textContent = 'Mute';
    }).catch(() => {
      // Autoplay restriction, waiting for direct user gesture
    });
  }
}

// Sound Toggle Button
soundBtn.addEventListener('click', () => {
  unlockAudio();
  if (bgm.paused) {
    bgm.play();
    state.isMusicPlaying = true;
    soundBtn.classList.add('sound-playing');
    soundLabel.textContent = 'Mute';
  } else {
    bgm.pause();
    state.isMusicPlaying = false;
    soundBtn.classList.remove('sound-playing');
    soundLabel.textContent = 'Music';
  }
});

// Web Audio API Synthesized Sound Effects (100% reliable offline)
function playTearSound() {
  try {
    unlockAudio();
    const ctx = state.audioContext;
    if (!ctx) return;
    
    // White noise burst shaped like tearing paper
    const bufferSize = ctx.sampleRate * 0.45;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, ctx.currentTime);
    filter.Q.setValueAtTime(3.0, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch(e) {}
}

function playChimeSound() {
  try {
    const ctx = state.audioContext;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4); // A5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch(e) {}
}

function playProjectorClick() {
  try {
    const ctx = state.audioContext;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch(e) {}
}

function playBlowSound() {
  try {
    const ctx = state.audioContext;
    if (!ctx) return;
    // Low whoosh noise for blowing candles
    const bufferSize = ctx.sampleRate * 0.7;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch(e) {}
}

function playCelebrationFanfare() {
  try {
    const ctx = state.audioContext;
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.65);
    });
  } catch(e) {}
}

// ==========================================================================
// SCREEN 2: TICKET TEARING
// ==========================================================================
function tearTicket() {
  const ticketCard = document.getElementById('ticket-card');
  const tearBtn = document.getElementById('tear-ticket-btn');
  
  if (ticketCard.classList.contains('tearing')) return;

  unlockAudio();
  playTearSound();

  ticketCard.classList.add('tearing');
  tearBtn.disabled = true;

  setTimeout(() => {
    goToScreen('chapter1');
    // Reset ticket after animation completes
    setTimeout(() => {
      ticketCard.classList.remove('tearing');
      tearBtn.disabled = false;
    }, 600);
  }, 750);
}

// ==========================================================================
// SCREEN 4: CHAPTER 02 - THE MEMORY FILM CAROUSEL
// ==========================================================================
function updateFilmReel() {
  const track = document.getElementById('filmTrack');
  const frames = document.querySelectorAll('.film-frame');
  const counter = document.getElementById('filmCounter');

  frames.forEach((frame, idx) => {
    if (idx === state.filmIndex) {
      frame.classList.add('active');
    } else {
      frame.classList.remove('active');
    }
  });

  // Calculate slide offset: each frame is 220px + 16px gap = 236px
  const frameWidth = 236;
  const offset = -(state.filmIndex * frameWidth);
  track.style.transform = `translateX(${offset}px)`;

  counter.textContent = `0${state.filmIndex + 1} / 0${state.totalFilmFrames}`;
}

function prevFilmSlide() {
  playProjectorClick();
  if (state.filmIndex > 0) {
    state.filmIndex--;
    updateFilmReel();
  } else {
    state.filmIndex = state.totalFilmFrames - 1;
    updateFilmReel();
  }
}

function nextFilmSlide() {
  playProjectorClick();
  if (state.filmIndex < state.totalFilmFrames - 1) {
    state.filmIndex++;
    updateFilmReel();
  } else {
    state.filmIndex = 0;
    updateFilmReel();
  }
}

// ==========================================================================
// SCREEN 6: PRIVATE LETTER & ENVELOPE
// ==========================================================================
function toggleLetter() {
  unlockAudio();
  playChimeSound();

  const wrapper = document.getElementById('envelopeWrapper');
  const actionBar = document.getElementById('letterActionBar');

  wrapper.classList.toggle('open');
  state.isLetterOpen = wrapper.classList.contains('open');

  if (state.isLetterOpen) {
    setTimeout(() => {
      actionBar.classList.add('visible');
    }, 450);
  }
}

// ==========================================================================
// SCREEN 7: THE BIRTHDAY TRAILER (KINETIC TYPOGRAPHY)
// ==========================================================================
function startTrailer() {
  goToScreen('trailer');

  const words = ['SMILE.', 'BELIEVE.', 'CREATE.', 'DREAM.', 'LOVE.'];
  const wordEl = document.getElementById('kineticWord');
  let currentIdx = 0;

  function showNextWord() {
    if (currentIdx >= words.length) {
      setTimeout(() => {
        goToScreen('cake');
      }, 700);
      return;
    }

    wordEl.textContent = words[currentIdx];
    wordEl.classList.remove('flash-out');
    wordEl.classList.add('flash-in');

    playChimeSound();

    setTimeout(() => {
      wordEl.classList.remove('flash-in');
      wordEl.classList.add('flash-out');
      currentIdx++;
      setTimeout(showNextWord, 200);
    }, 1100);
  }

  setTimeout(showNextWord, 400);
}

// ==========================================================================
// SCREEN 8: THE BIG REVEAL & INTERACTIVE CAKE
// ==========================================================================
function blowCandles() {
  if (state.isCandlesBlown) return;

  unlockAudio();
  playBlowSound();

  const flames = [document.getElementById('flame1'), document.getElementById('flame2'), document.getElementById('flame3')];
  flames.forEach(flame => flame.classList.add('extinguished'));

  const instruction = document.getElementById('cakeInstruction');
  const makeWishBtn = document.getElementById('makeWishBtn');
  const seeCreditsBtn = document.getElementById('seeCreditsBtn');

  state.isCandlesBlown = true;
  instruction.innerHTML = 'HAPPY BIRTHDAY 💖<br>May all your wishes come true!';

  makeWishBtn.classList.add('hidden');
  seeCreditsBtn.classList.remove('hidden');

  // Trigger celebration explosion
  setTimeout(() => {
    playCelebrationFanfare();
    launchConfetti();
  }, 250);
}

// ==========================================================================
// SCREEN 9: ROLLING CREDITS & RESTART
// ==========================================================================
function restartCinema() {
  state.filmIndex = 0;
  state.isLetterOpen = false;
  state.isCandlesBlown = false;

  const wrapper = document.getElementById('envelopeWrapper');
  if (wrapper) wrapper.classList.remove('open');
  const actionBar = document.getElementById('letterActionBar');
  if (actionBar) actionBar.classList.remove('visible');

  const flames = [document.getElementById('flame1'), document.getElementById('flame2'), document.getElementById('flame3')];
  flames.forEach(flame => flame.classList.remove('extinguished'));

  const instruction = document.getElementById('cakeInstruction');
  if (instruction) instruction.textContent = 'Make a wish before the candles blow out... ✨';

  const makeWishBtn = document.getElementById('makeWishBtn');
  if (makeWishBtn) makeWishBtn.classList.remove('hidden');

  const seeCreditsBtn = document.getElementById('seeCreditsBtn');
  if (seeCreditsBtn) seeCreditsBtn.classList.add('hidden');

  updateFilmReel();
  goToScreen('opening');
}

// ==========================================================================
// AMBIENT PARTICLES (FAIRY DUST & STARS)
// ==========================================================================
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2.2 + 0.8;
      this.speedY = -(Math.random() * 0.45 + 0.15);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.7 + 0.2;
      this.pulseSpeed = Math.random() * 0.03 + 0.01;
      this.isGold = Math.random() > 0.4;
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.alpha += Math.sin(Date.now() * this.pulseSpeed) * 0.015;

      if (this.y < 0 || this.x < 0 || this.x > width) {
        this.y = height + 10;
        this.x = Math.random() * width;
      }
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0.1, Math.min(1, this.alpha));
      ctx.fillStyle = this.isGold ? '#e6c575' : '#ffffff';
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.isGold ? '#e6c575' : '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 45; i++) {
    particles.push(new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(loop);
  }
  loop();
}

// ==========================================================================
// CONFETTI ENGINE (CELEBRATORY BURST)
// ==========================================================================
let confettiParticles = [];
let confettiCtx = null;
let confettiWidth = 0, confettiHeight = 0;

function initConfettiCanvas() {
  const canvas = document.getElementById('confetti-canvas');
  confettiCtx = canvas.getContext('2d');

  function resize() {
    confettiWidth = canvas.width = window.innerWidth;
    confettiHeight = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function renderConfetti() {
    confettiCtx.clearRect(0, 0, confettiWidth, confettiHeight);
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.update();
      p.draw(confettiCtx);
      if (p.y > confettiHeight + 20) {
        confettiParticles.splice(i, 1);
      }
    }
    requestAnimationFrame(renderConfetti);
  }
  renderConfetti();
}

class ConfettiPiece {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 9 + 6;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 12 + 6;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 5;
    this.gravity = 0.28;
    this.rotation = Math.random() * 360;
    this.rotSpeed = (Math.random() - 0.5) * 10;
    const colors = ['#e6c575', '#faeac2', '#e91e63', '#ff4081', '#9c27b0', '#ffffff', '#ffd700', '#ff80ab'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.vx *= 0.98;
    this.rotation += this.rotSpeed;
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    ctx.restore();
  }
}

function launchConfetti() {
  const originX = confettiWidth / 2;
  const originY = confettiHeight * 0.45;
  for (let i = 0; i < 120; i++) {
    confettiParticles.push(new ConfettiPiece(originX, originY));
  }
}

// ==========================================================================
// SWIPE GESTURES FOR MOBILE FILM STRIP
// ==========================================================================
function initTouchGestures() {
  const track = document.getElementById('filmTrack');
  let startX = 0;
  let endX = 0;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextFilmSlide();
      } else {
        prevFilmSlide();
      }
    }
  }, { passive: true });
}

// ==========================================================================
// CUSTOMIZATION & LOCAL STORAGE
// ==========================================================================
document.getElementById('customize-btn').addEventListener('click', () => {
  customModal.classList.add('active');
});

function closeCustomizeModal() {
  customModal.classList.remove('active');
}

function applyName(name) {
  state.name = name || 'Alex';
  const nameTargets = document.querySelectorAll('.recipient-name');
  nameTargets.forEach(el => el.textContent = state.name);
}

function applyYear(year) {
  state.year = year || '2026';
  const yearTargets = document.querySelectorAll('.ticket-year');
  yearTargets.forEach(el => el.textContent = state.year);
}

function saveCustomizations() {
  const name = inputName.value.trim() || 'Alex';
  const year = inputYear.value.trim() || '2026';
  const msg = inputMessage.value.trim();

  applyName(name);
  applyYear(year);

  if (msg) {
    customLetterText.textContent = msg;
  }

  // Handle uploaded images
  if (inputPhotos.files && inputPhotos.files.length > 0) {
    const files = Array.from(inputPhotos.files).slice(0, 4);
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.querySelector(`.memory-img-${index}`);
        if (img) img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  localStorage.setItem('birthdayCinemaData', JSON.stringify({
    name,
    year,
    message: msg
  }));

  closeCustomizeModal();
  playChimeSound();
}

function loadSavedCustomizations() {
  try {
    const saved = localStorage.getItem('birthdayCinemaData');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.name) {
        inputName.value = data.name;
        applyName(data.name);
      }
      if (data.year) {
        inputYear.value = data.year;
        applyYear(data.year);
      }
      if (data.message) {
        inputMessage.value = data.message;
        customLetterText.textContent = data.message;
      }
    } else {
      applyName('Alex');
      applyYear('2026');
    }
  } catch(e) {}
}
