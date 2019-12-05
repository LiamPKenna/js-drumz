import Pizzicato from 'pizzicato';

export class Doom {
  constructor() {
    this.c = new Pizzicato.Sound({
      source: 'wave',
      options: {
        volume: .20,
        type: 'triangle',
        frequency: 440,
        attack: 1
      }
    });
    this.d = new Pizzicato.Sound({
      source: 'wave',
      options: {
        volume: .20,
        type: 'sawtooth',
        frequency: 440,
        attack: 1
      }
    });
    this.dub = new Pizzicato.Effects.DubDelay({
      feedback: .3,
      time: 1,
      mix: 1,
      cutoff: 600
    });
    this.ping = new Pizzicato.Effects.PingPongDelay({
      feedback: 0.6,
      time: 0.4,
      mix: 0.8
    });
    this.c.addEffect(this.dub);
    this.d.addEffect(this.ping);
  }
  changeNote(cNote, dNote) {
    this.c.frequency = cNote;
    this.d.frequency = dNote;
  }
}
