// Pure Web Audio API Synthesizer for Anime Spells

export class AnimeAudioSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;

  public init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  public setVolume(val: number) {
    if (this.masterGain) this.masterGain.gain.value = val;
  }

  public toggleMute() {
    this.enabled = !this.enabled;
  }

  private playTone(freq: number, type: OscillatorType, dur: number, vol: number = 0.5) {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, t + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + dur);
  }

  public playKamehamehaCharge() {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(50, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 2.0); // pitch rising
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 2.0);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(t);
    osc.stop(t + 2.0);
  }

  public playKamehamehaBeam() {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    const t = this.ctx.currentTime;
    
    // Low sub-bass drop
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(150, t);
    subOsc.frequency.exponentialRampToValueAtTime(40, t + 0.2);
    subGain.gain.setValueAtTime(0.8, t);
    subGain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 1.5);

    // Noise blast
    const bufferSize = this.ctx.sampleRate * 2.0;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Filter noise for beam sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.linearRampToValueAtTime(400, t + 1.5);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    
    noise.start(t);
    noise.stop(t + 1.5);
  }

  public playHollowPurpleMerge() {
    if (!this.ctx || !this.enabled) return;
    this.playTone(329.63, 'square', 1.0, 0.4); // E4
    this.playTone(392.00, 'sawtooth', 1.0, 0.4); // G4
  }

  public playHollowPurpleBlast() {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    const t = this.ctx.currentTime;
    // Reality shatter sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.5);
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.0);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 1.0);
  }

  public playChidori() {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Rapidly modulating frequency for electric crackle
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.linearRampToValueAtTime(2000, t + 0.1);
    osc.frequency.linearRampToValueAtTime(1000, t + 0.2);
    osc.frequency.linearRampToValueAtTime(3000, t + 0.3);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(t);
    osc.stop(t + 0.5);
  }

  public playDomainExpansion() {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    const t = this.ctx.currentTime;
    // Temple bell / deep gong
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(120, t);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(123, t); // Slight detune for resonance
    
    gain.gain.setValueAtTime(1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 4.0);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);
    
    osc1.start(t);
    osc1.stop(t + 4.0);
    osc2.start(t);
    osc2.stop(t + 4.0);
  }
  
  public playEldritchShield() {
    this.playTone(880, 'sine', 0.5, 0.2);
    this.playTone(1760, 'sine', 0.5, 0.1);
  }

  public playShieldDeflect() {
    this.playTone(1200, 'square', 0.2, 0.3);
  }
  
  public playThanosSnap() {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(4000, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
    gain.gain.setValueAtTime(1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }


}

export const animeAudio = new AnimeAudioSynth();
