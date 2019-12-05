import Pizzicato from 'pizzicato';

export class Hank {
  constructor() {
    this.e = new Pizzicato.Sound({
      source: 'wave',
      options: {
        volume: .45,
        type: 'triangle',
        frequency: 10,
        attack: 1
      }
    });
    this.f = new Pizzicato.Sound({
      source: 'wave',
      options: {
        volume: .45,
        type: 'triangle',
        frequency: 10,
        attack: 1
      }
    });
    this.tremolo = new Pizzicato.Effects.Tremolo({
      speed: 5,
      depth: 1,
      mix: 1
    });

    this.dub = new Pizzicato.Effects.PingPongDelay({
      feedback: 0.3,
      time: .5,
      mix: .5
    });



    this.e.addEffect(this.tremolo);
    this.e.addEffect(this.dub);
    this.f.addEffect(this.tremolo);



  }
  changeNote(e,f) {
    this.e.frequency = e;
    this.f.frequency = f;
  }
}
