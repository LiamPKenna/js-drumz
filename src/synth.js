import Pizzicato from pizzicato;


const dubDelay = new Pizzicato.Effects.DubDelay({
  feedback: 0.6,
  time: 0.7,
  mix: 0.5,
  cutoff: 700
});

export class Synth {
  constructor(source,frequency,type,release,attack,volume) {
    this.source = source;
    this.frequency = frequency;
    this.type = type;
    this.release = release;
    this.attack = attack;
    this.volume = volume;

  }


  buildSynth() {
  let wave = new Pizzicato.Sound({
        source: this.source,
        options: {
            type: this.type,
            release: this.release,
            attack: this.attack,
            volume: this.volume

        }
        wave.addEffect(dubDelay);
        wave.play();
    });


}
