import {Howl} from 'howler';
import kits from './drumimporter.js';

export class DrumKit {
  constructor(number) {
    this.sounds = kits[`kit${number}`];
    this.drums = this.assignSounds();
  }


  assignSounds() {
    const allDrums = [];
    for(i=0;i<this.sounds.length;i++) {
      let sound = new Howl({src: [this.sounds[i]
      });
      allDrums.push(sound)
    }
    return allDrums;
  }
}
