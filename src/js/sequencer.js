import { DrumKit } from './drums.js';

export class Sequencer {
  constructor(kit = 1) {
    this.drumKit = new DrumKit(kit);
    this.currentStep = 0;
    this.playing = false;
    this.sequence = this.makeNewSequence();
    this.tempo = 125;
    this.aOrB = 0;
    this.selectedTrack = 0;
  }

  makeNewSequence() {
    return Array.from(new Array(10)).map(() => [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ]);
  }

  step(tempo = this.tempo) {
    if (!this.playing) return;
    if (this.frontEndFunction) this.frontEndFunction(this.currentStep);
    const thisSequence = this;
    this.playStep();
    setTimeout(function () {
      thisSequence.step();
    }, tempo);
  }

  togglePlay() {
    this.currentStep = 0;
    this.playing = !this.playing;
    if (this.frontEndFunction) this.frontEndFunction(this.currentStep);
    if (this.playing) this.step();
  }

  playStep() {
    this.drumKit.drums.forEach((drum, index) => {
      if (this.sequence[index][this.aOrB][this.currentStep]) {
        drum.play();
      }
    });
    this.incrementStep();
  }

  incrementStep() {
    if (this.currentStep === 15) {
      this.currentStep = 0;
    } else {
      this.currentStep++;
    }
  }

  changeTempo(bpm) {
    this.tempo = Math.round((60000/parseInt(bpm))/4);
  }

  selectTrack(i) {
    this.selectedTrack = parseInt(i);
  }

  loadSequence(array) {
    array.forEach(xy => {
      this.selectedTrack = xy[0];
      this.toggleStepOnOff(xy[1]);
    });
    this.selectedTrack = 0;
  }

  toggleStepOnOff(step) {
    const currentSequence = this.sequence[this.selectedTrack][this.aOrB];
    currentSequence[parseInt(step)] = (currentSequence[parseInt(step)]) ? 0 : 1;
  }

  changeAB() {
    this.aOrB = (this.aOrB) ? 0 : 1;
  }

  selectKit(kit) {
    this.drumKit = new DrumKit(parseInt(kit));
  }

  changeVolume(track, volume) {
    const newVolume = parseInt(volume)/127;
    this.drumKit.drums[track].volume(newVolume);
  }

  changePitch(track, pitch) {
    const switchPitch = (n) => {
      let pitch;
      if (n <= 64) {
        pitch = Math.round((n/127)*100)/100 + .5;
      } else {
        pitch = Math.round((n/127)*100)/100 * 2;
      }
      return pitch;
    };
    const newPitch = switchPitch(pitch);
    this.drumKit.drums[track].rate(newPitch);
  }

}
