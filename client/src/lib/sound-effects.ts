/* Parvaz Focus - Sound Effects Utility
   Soft, gentle sounds for interactions and milestones
   Uses Web Audio API for lightweight, instant sounds
*/

export class SoundEffects {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize audio context on first use
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Soft click sound for button interactions
   * Low frequency, very brief
   */
  playClickSound() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.value = 200;
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Gentle completion sound
   * Two-tone ascending chime
   */
  playCompletionSound() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // First tone
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(this.audioContext.destination);

    osc1.frequency.value = 400;
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second tone (higher)
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(this.audioContext.destination);

    osc2.frequency.value = 600;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.15, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc2.start(now + 0.15);
    osc2.stop(now + 0.45);
  }

  /**
   * Study session start sound
   * Gentle ascending tone
   */
  playStudyStartSound() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.4);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  /**
   * Break time alert sound
   * Two gentle tones
   */
  playBreakAlertSound() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // First tone
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(this.audioContext.destination);

    osc1.frequency.value = 350;
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc1.start(now);
    osc1.stop(now + 0.2);

    // Second tone
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(this.audioContext.destination);

    osc2.frequency.value = 350;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.12, now + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc2.start(now + 0.25);
    osc2.stop(now + 0.45);
  }

  /**
   * XP earned sound
   * Sparkly ascending tone
   */
  playXPEarnedSound() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.3);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Level up sound
   * Triumphant ascending tones
   */
  playLevelUpSound() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Tone 1
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(this.audioContext.destination);

    osc1.frequency.value = 400;
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc1.start(now);
    osc1.stop(now + 0.2);

    // Tone 2
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(this.audioContext.destination);

    osc2.frequency.value = 550;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.15, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc2.start(now + 0.15);
    osc2.stop(now + 0.35);

    // Tone 3
    const osc3 = this.audioContext.createOscillator();
    const gain3 = this.audioContext.createGain();
    osc3.connect(gain3);
    gain3.connect(this.audioContext.destination);

    osc3.frequency.value = 700;
    osc3.type = 'sine';
    gain3.gain.setValueAtTime(0.15, now + 0.3);
    gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc3.start(now + 0.3);
    osc3.stop(now + 0.5);
  }

  /**
   * Error/warning sound
   * Low descending tone
   */
  playErrorSound() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
  }
}

// Singleton instance
let soundEffects: SoundEffects | null = null;

export function getSoundEffects(): SoundEffects {
  if (!soundEffects) {
    soundEffects = new SoundEffects();
  }
  return soundEffects;
}
