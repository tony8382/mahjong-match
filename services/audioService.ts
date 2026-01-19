
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

  private vibrate(pattern: number | number[]) {
    // 檢查瀏覽器是否支持震動 API
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // 部分環境可能限制震動 API，優雅跳過
      }
    }
  }

  playSelect() {
    // 短促的敲擊聲 + 極微弱觸覺點擊
    this.playTone(600, 'sine', 0.1, 0.1);
    this.vibrate(10);
  }

  playMatch() {
    // 愉快的上升音 + 兩次輕快震動
    setTimeout(() => this.playTone(523.25, 'sine', 0.3, 0.1), 0); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.3, 0.1), 50); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.4, 0.1), 100); // G5
    this.vibrate([30, 30, 30]);
  }

  playFail() {
    // 低沉的錯誤聲 + 明顯的單次震動回饋
    this.playTone(150, 'triangle', 0.2, 0.1);
    this.vibrate(120);
  }

  playWin() {
    // 勝利歡慶音階 + 節奏感慶祝震動
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.6, 0.1), i * 150);
    });
    this.vibrate([100, 50, 100, 50, 200]);
  }
}

export const audioService = new AudioService();
