/* ==========================================================================
   SAMSONITE - APP STATE CONTROLLER & DOM ROUTER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Views
  const lobbyView = document.getElementById('lobby-view');
  const memoryView = document.getElementById('memory-view');
  const supplyDropView = document.getElementById('supply-drop-view');
  const victoryView = document.getElementById('victory-view');

  // DOM Elements
  const btnStart = document.getElementById('btn-start');
  const btnReplay = document.getElementById('btn-replay');
  const memoryGrid = document.getElementById('memory-grid');
  const matchCounterEl = document.getElementById('match-counter');
  const supplyCrate = document.getElementById('supply-drop-crate');
  const progressFill = document.getElementById('drop-progress-fill');

  // Game Instances & State
  let memoryGame = null;
  let crateClicks = 0;
  const REQUIRED_CRATE_CLICKS = 5;

  // View Switcher
  function switchView(targetView) {
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });
    targetView.classList.add('active');
  }

  // 1. Initial State Check (localStorage)
  const isAlreadyUnlocked = localStorage.getItem('SamsoniteVictoryUnlocked') === 'true';
  if (isAlreadyUnlocked) {
    // Show Lobby, but Start button says "VISA DEIN SEGERPASS 👑"
    btnStart.querySelector('span').textContent = 'VISA DITT SEGERPASS 👑';
  }

  // Handle iOS Safari visibility change (audio context suspension recovery)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && soundEngine && soundEngine.ctx) {
      if (soundEngine.ctx.state === 'suspended') {
        soundEngine.ctx.resume();
      }
    }
  });

  // 2. Start Button Click Handler
  btnStart.addEventListener('click', () => {
    // Unlock iOS Web Audio API
    soundEngine.unlock();

    if (localStorage.getItem('SamsoniteVictoryUnlocked') === 'true') {
      // Direct jump to Victory Royale if already completed
      triggerVictoryRoyale();
    } else {
      // Start Memory Game
      startMemoryPhase();
    }
  });

  // 3. Phase 1: Start Memory Game
  function startMemoryPhase() {
    switchView(memoryView);
    if (!memoryGame) {
      memoryGame = new MemoryGame(memoryGrid, matchCounterEl, onMemoryComplete);
    }
    memoryGame.init();
  }

  // Memory Completion Callback -> Phase 2: Supply Drop
  function onMemoryComplete() {
    switchView(supplyDropView);
    crateClicks = 0;
    progressFill.style.width = '0%';
  }

  // 4. Phase 2: Supply Drop Click Handler
  supplyCrate.addEventListener('click', () => {
    soundEngine.playDropClick();
    crateClicks++;

    // Shake animation feedback
    supplyCrate.classList.remove('shake');
    void supplyCrate.offsetWidth; // Trigger reflow
    supplyCrate.classList.add('shake');

    // Progress percentage
    const percentage = Math.min((crateClicks / REQUIRED_CRATE_CLICKS) * 100, 100);
    progressFill.style.width = `${percentage}%`;

    if (crateClicks >= REQUIRED_CRATE_CLICKS) {
      // Mark unlocked in localStorage
      localStorage.setItem('SamsoniteVictoryUnlocked', 'true');
      btnStart.querySelector('span').textContent = 'VISA DITT SEGERPASS 👑';

      // Transition to Victory Royale!
      setTimeout(() => {
        triggerVictoryRoyale();
      }, 300);
    }
  });

  // 5. Phase 3: Trigger Victory Royale
  function triggerVictoryRoyale() {
    switchView(victoryView);

    // Play Victory Sound Fanfare
    soundEngine.playVictory();

    // Trigger Canvas Confetti Explosion
    if (typeof confetti === 'function') {
      // First burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Gold celebratory stream
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ffea00', '#ffb703', '#fb8500']
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ffea00', '#ffb703', '#fb8500']
        });
      }, 250);
    }
  }

  // 6. Replay Button Click Handler
  btnReplay.addEventListener('click', () => {
    soundEngine.playFlip();
    crateClicks = 0;
    if (progressFill) progressFill.style.width = '0%';
    startMemoryPhase();
  });
});
