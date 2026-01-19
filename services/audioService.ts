
class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuteStatus(): boolean {
    return this.isMuted;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playSelect() {
    // 短促的敲擊聲
    this.playTone(600, 'sine', 0.1, 0.1);
  }

  playMatch() {
    // 愉快的上升音
    setTimeout(() => this.playTone(523.25, 'sine', 0.3, 0.1), 0); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.3, 0.1), 50); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.4, 0.1), 100); // G5
  }

  playFail() {
    // 低沉的錯誤聲
    this.playTone(150, 'triangle', 0.2, 0.1);
  }

  playWin() {
    // 勝利歡慶音階
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.6, 0.1), i * 150);
    });
  }
}

export const audioService = new AudioService();
