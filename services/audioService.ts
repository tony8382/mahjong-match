
class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: any = null;
  private bgmGain: GainNode | null = null;

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
    if (this.isMuted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
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
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  // 柔和的五聲音階旋律 (宮商角徵羽)
  startBGM() {
    if (this.isMuted || this.bgmInterval) return;
    this.init();
    if (!this.ctx) return;

    const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00]; // C4, D4, E4, G4, A4
    let step = 0;

    this.bgmInterval = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      
      const freq = pentatonic[step % pentatonic.length];
      // 使用非常柔和的 sine 波，音量極低
      this.playTone(freq, 'sine', 1.5, 0.02);
      
      // 隨機跳動增加旋律感
      step += Math.floor(Math.random() * 2) + 1;
    }, 1200);
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  playSelect() {
    this.playTone(600, 'sine', 0.1, 0.1);
    this.vibrate(10);
  }

  playMatch() {
    setTimeout(() => this.playTone(523.25, 'sine', 0.3, 0.1), 0);
    setTimeout(() => this.playTone(659.25, 'sine', 0.3, 0.1), 50);
    setTimeout(() => this.playTone(783.99, 'sine', 0.4, 0.1), 100);
    this.vibrate([30, 30, 30]);
  }

  playFail() {
    this.playTone(150, 'triangle', 0.2, 0.1);
    this.vibrate(120);
  }

  playWin() {
    this.stopBGM(); // 獲勝時先停掉背景音樂
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.6, 0.1), i * 150);
    });
    this.vibrate([100, 50, 100, 50, 200]);
  }
}

export const audioService = new AudioService();
