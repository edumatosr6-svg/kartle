// Optional synthesized feedback. No downloads; created only from a user gesture.
export class RaceAudio {
  private context?: AudioContext;
  private engine?: OscillatorNode;
  private gain?: GainNode;
  enabled = false;
  async toggle() {
    if (!this.context) {
      this.context = new AudioContext();
      this.engine = this.context.createOscillator();
      this.engine.type = 'triangle';
      this.gain = this.context.createGain();
      this.gain.gain.value = 0;
      this.engine.connect(this.gain).connect(this.context.destination);
      this.engine.start();
    }
    await this.context.resume();
    this.enabled = !this.enabled;
    if (!this.enabled) this.gain!.gain.setTargetAtTime(0, this.context.currentTime, 0.03);
    return this.enabled;
  }
  update(speed: number, throttle: number, active: boolean) {
    if (!this.context) return;
    const time = this.context.currentTime;
    this.engine!.frequency.setTargetAtTime(45 + speed * 6 + throttle * 12, time, 0.08);
    this.gain!.gain.setTargetAtTime(this.enabled && active ? 0.025 + throttle * 0.02 : 0, time, 0.04);
  }
  reward(tier: number) {
    if (!this.context || !this.enabled) return;
    const context = this.context;
    for (let i = 0; i < tier + 1; i++) {
      const tone = context.createOscillator(), gain = context.createGain();
      const start = context.currentTime + i * 0.07;
      tone.frequency.value = 440 * Math.pow(2, (i * 4 + 7) / 12);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.035, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
      tone.connect(gain).connect(context.destination);
      tone.start(start); tone.stop(start + 0.2);
      tone.onended = () => { tone.disconnect(); gain.disconnect(); };
    }
  }
}
