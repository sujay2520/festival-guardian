// Lightweight synthesized Web Audio effects for Festival Guardian (Zero assets, zero latency)
type SoundType = 'click' | 'ping' | 'sos' | 'hold';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private unlocked = false;

  private getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    return this.ctx;
  }

  unlock() {
    if (this.unlocked) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    this.unlocked = true;
  }

  play(type: SoundType, volume = 0.15) {
    try {
      const ctx = this.getCtx();
      if (!ctx || ctx.state !== 'running') {
        this.unlock();
      }
      if (!ctx || ctx.state !== 'running') return;

      const t = ctx.currentTime;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.connect(ctx.destination);

      switch (type) {
        case 'click':
          this.playClick(ctx, gain, t, volume);
          break;
        case 'hold':
          this.playHoldTick(ctx, gain, t, volume * 0.5);
          break;
        case 'ping':
          this.playAlertPing(ctx, gain, t, volume);
          break;
        case 'sos':
          this.playSosAlarm(ctx, gain, t, volume);
          break;
      }
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }
  }

  private playClick(ctx: AudioContext, gain: GainNode, t: number, vol: number) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.03);
    gain.gain.setValueAtTime(vol * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  private playHoldTick(ctx: AudioContext, gain: GainNode, t: number, vol: number) {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    gain.gain.setValueAtTime(vol * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  private playAlertPing(ctx: AudioContext, gain: GainNode, t: number, vol: number) {
    // 2-tone tactical chime for risk surge
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(1174, t + 0.08); // D6
    gain.gain.setValueAtTime(vol * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  private playSosAlarm(ctx: AudioContext, gain: GainNode, t: number, vol: number) {
    // 3 short ascending pings for emergency trigger
    const notes = [800, 1000, 1200];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const startTime = t + i * 0.09;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      noteGain.gain.setValueAtTime(vol * 0.6, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
      osc.connect(noteGain).connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.09);
    });
  }
}

export const audioEngine = new AudioEngine();
