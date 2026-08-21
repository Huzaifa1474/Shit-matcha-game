type ChipSound = "step" | "strike" | "impact" | "guard" | "round" | "victory" | "defeat";

const MUSIC_URL = "/manus-storage/rustbelt-arena-8bit-loop_907a823b.mp3";

export class AudioManager {
  private readonly music = new Audio(MUSIC_URL);
  private context: AudioContext | null = null;
  private unlocked = false;
  private enabled = true;

  constructor() {
    this.music.loop = true;
    this.music.volume = 0.18;
    this.music.preload = "auto";
  }

  get isEnabled() { return this.enabled; }

  unlock() {
    this.unlocked = true;
    this.context ??= new AudioContext();
    void this.context.resume();
    if (this.enabled) void this.music.play().catch(() => undefined);
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) this.music.pause();
    else if (this.unlocked) void this.music.play().catch(() => undefined);
    return this.enabled;
  }

  play(sound: ChipSound) {
    if (!this.enabled || !this.unlocked) return;
    this.context ??= new AudioContext();
    const now = this.context.currentTime;
    const recipes: Record<ChipSound, { frequency: number; end: number; duration: number; type: OscillatorType; gain: number }> = {
      step: { frequency: 132, end: 96, duration: 0.055, type: "square", gain: 0.035 },
      strike: { frequency: 355, end: 126, duration: 0.13, type: "sawtooth", gain: 0.07 },
      impact: { frequency: 92, end: 43, duration: 0.16, type: "square", gain: 0.09 },
      guard: { frequency: 232, end: 460, duration: 0.16, type: "triangle", gain: 0.06 },
      round: { frequency: 330, end: 660, duration: 0.22, type: "square", gain: 0.06 },
      victory: { frequency: 392, end: 784, duration: 0.34, type: "square", gain: 0.075 },
      defeat: { frequency: 220, end: 82, duration: 0.38, type: "sawtooth", gain: 0.055 },
    };
    const recipe = recipes[sound];
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = recipe.type;
    oscillator.frequency.setValueAtTime(recipe.frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(25, recipe.end), now + recipe.duration);
    gain.gain.setValueAtTime(recipe.gain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + recipe.duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + recipe.duration + 0.02);
  }

  dispose() {
    this.music.pause();
    this.music.currentTime = 0;
    void this.context?.close();
  }
}

