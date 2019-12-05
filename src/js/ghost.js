import Pizzicato from 'pizzicato';
import notes from './notes.js';

export class Ghost {
  constructor() {
    this.sound = new Pizzicato.Sound({
      source: 'wave',
      options: {
        volume: 0.47,
        attack: 0.01
      }
    });
    this.dub = new Pizzicato.Effects.DubDelay({
      feedback: 0.4,
      time: 0.25,
      mix: 0.4,
      cutoff: 600
    });
    this.sound.addEffect(this.dub);
    this.notes = notes;
  }

  changeNote(n) {
    this.sound.frequency = this.notes[n];
  }

  oOoO(note) {
    this.changeNote(note);
    this.sound.play();
    setTimeout(() => {
      this.sound.stop();
    }, 100);
  }

  changeVolume(inputVolume) {
    const newVolume = Math.round((parseInt(inputVolume)*100)/127)/100 * 0.6;
    this.sound.volume = newVolume;
  }

  changeDub(slider, value) {
    let newValue = Math.round((parseInt(value)*100)/127)/100;
    if (slider === 'cutoff') newValue = newValue * 700;
    this.dub[slider] = newValue;
  }

}
