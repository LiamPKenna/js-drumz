import NoAge from './../mp3/noage.mp3';
import Sun from './../mp3/sun.mp3';

const kicks = [NoAge, Sun];

export class DrumKit {
  constructor(k) {
    this.kick = kicks[k];
  }
}
