// Web Audio API Synthesizer for Medical Notification Sounds
class SoundAlertService {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playSound(type = 'new_request') {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      if (type === 'new_request') {
        // High double chime
        this.playTone(800, now, 0.15);
        this.playTone(1040, now + 0.18, 0.25);
      } else if (type === 'handover') {
        // Smooth triple chime
        this.playTone(520, now, 0.12);
        this.playTone(660, now + 0.14, 0.12);
        this.playTone(880, now + 0.28, 0.25);
      } else if (type === 'overdue_alert') {
        // Urgent warning beep
        this.playTone(440, now, 0.2);
        this.playTone(880, now + 0.22, 0.3);
      }
    } catch (e) {
      console.warn('Audio playback inhibited by browser autoplay policy', e);
    }
  }

  playTone(freq, startTime, duration) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const soundAlert = new SoundAlertService();
