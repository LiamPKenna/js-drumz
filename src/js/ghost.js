import { Sound, Effects } from './audio.js';
import notes from './notes.js';

const NOTE_LENGTH = 0.1;

export class Ghost {
  constructor() {
    this.sound = new Sound({
      source: 'wave',
      options: {
        volume: 0.47,
        attack: 0.01
      }
    });
    this.dub = new Effects.DubDelay({
      feedback: 0.4,
      time: 0.25,
      mix: 0.4,
      cutoff: 600
    });
    this.pan =  new Effects.StereoPanner({
      pan: 0.0
    });
    this.grime = new Effects.Distortion({
      gain: 0.0
    });
    this.sound.addEffect(this.grime);
    this.sound.addEffect(this.pan);
    this.sound.addEffect(this.dub);
    this.notes = notes;
  }

  // Plays a 100ms note at an AudioContext time (now by default).
  oOoO(note, when = 0) {
    const frequency = this.notes[note];
    if (frequency) this.sound.playNote(frequency, when, NOTE_LENGTH);
  }

  stop() {
    this.sound.stopNotes();
  }

  changeVolume(inputVolume) {
    const newVolume = Math.round((parseInt(inputVolume)*100)/127)/100 * 0.6;
    this.sound.volume = newVolume;
  }

  changeDub(slider, value) {
    const newValue = Math.round((parseInt(value)*100)/127)/100;
    this.dub[slider] = newValue;
  }

  changePanOrGrime(slider, value) {
    let newValue;
    if (slider === 'pan') {
      newValue = Math.round((parseInt(value)*100)/127)/100-0.5;
      this.pan.pan = newValue;
    } else {
      newValue = Math.round((parseInt(value)*100)/127)/100;
      this.grime.gain = newValue;
    }
  }

}
