import { Sound, Effects } from './audio.js';

export class Chaos {
  constructor() {
    this.a = new Sound({
      source: 'wave',
      options: {
        volume: .60,
        type: 'triangle',
        frequency: 440,
        attack: 1
      }
    });
    this.b = new Sound({
      source: 'wave',
      options: {
        volume: .60,
        type: 'sine',
        frequency: 440,
        attack: 1
      }
    });
    this.lp = new Effects.LowPassFilter({
      frequency: 2000,
      peak: 11
    });
    this.tremolo1 = new Effects.Tremolo({
      speed: 5,
      depth: 0.8,
      mix: 0.8
    });
    this.tremolo = new Effects.Tremolo({
      speed: 10,
      depth: 1,
      mix: 1
    });
    this.a.addEffect(this.lp);
    this.b.addEffect(this.tremolo);
    this.a.addEffect(this.tremolo1);
  }
  changeNote(aNote, bNote) {
    this.a.frequency = aNote;
    this.b.frequency = bNote;
  }
}
