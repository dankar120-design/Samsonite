/* ==========================================================================
   SAMSONITE - WEB AUDIO API SYNTHESIZER (100% OFFLINE & ZERO LATENCY)
   ========================================================================== */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isUnlocked = false;
  }

  // Initialize & unlock Web Audio Context for iOS Safari
  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      this.ctx = new AudioCtx();
    }
  }

  unlock() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.isUnlocked = true;
      });
    } else if (this.ctx) {
      this.isUnlocked = true;
    }
  }

  // Helper for creating tone nodes
  createTone(freq, type = 'sine', duration = 0.1, gainVal = 0.2) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio play error:", e);
    }
  }

  // Sound 1: Memory Card Flip
  playFlip() {
    if (!this.ctx) return;
    this.createTone(440, 'triangle', 0.08, 0.15);
  }

  // Sound 2: Pair Match Found
  playMatch() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.createTone(523.25, 'sine', 0.12, 0.2); // C5
    setTimeout(() => this.createTone(659.25, 'sine', 0.18, 0.25), 80); // E5
  }

  // Sound 3: Supply Drop Click / Hit
  playDropClick() {
    if (!this.ctx) return;
    this.createTone(180, 'square', 0.1, 0.3);
  }

  // Sound 4: Victory Royale Fanfare (Arpeggiated Pentatonic Melody)
  playVictory() {
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.createTone(freq, 'triangle', 0.4, 0.3);
      }, idx * 120);
    });
  }
}

// Global Singleton Instance
const soundEngine = new SoundEngine();
