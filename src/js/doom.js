import Pizzicato from 'pizzicato';

export class Doom {
  constructor() {
    this.a = new Pizzicato.Sound({
      source: 'wave',
      options: {
        volume: 1,
        type: 'triangle',
        frequency: 440,
        attack: 1
      }
    });
    this.b = new Pizzicato.Sound({
      source: 'wave',
      options: {
        volume: .25,
        type: 'sine',
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
    this.a.addEffect(this.dub);
    this.b.addEffect(this.dub);


  }

  changeNote(aNote, bNote) {
    this.a.frequency = aNote;
    this.b.frequency = bNote;
  }
}
