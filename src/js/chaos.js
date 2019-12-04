import Pizzicato from 'pizzicato';

export class Chaos {
  constructor() {
    this.a = new Pizzicato.Sound({
      source: 'wave',
      options: {
        volume: 0.79,
        type: 'sine',
        frequency: 440,
        attack: 1
      }
    });
    this.b = new Pizzicato.Sound({
      source: 'wave',
      options: {
        volume: 0.79,
        type: 'sine',
        frequency: 440,
        attack: 1
      }
    });
    this.dub = new Pizzicato.Effects.DubDelay({
      feedback: 0.8,
      time: 1,
      mix: 1,
      cutoff: 3600
    });
    this.a.addEffect(this.dub);
    this.b.addEffect(this.dub);

  }

  changeNote(aNote, bNote) {
    this.a.frequency = aNote;
    this.b.frequency = bNote;
  }
}
