import { DrumKit } from './drums.js';

export class Sequencer {
  constructor(kit = 0) {
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
    this.playStep();
    setTimeout(function () {
      this.step();
    }, tempo);
  }

  togglePlay() {
    this.currentStep = 0;
    this.playing = !this.playing;
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

  getTempo(bpm) {
    this.tempo = Math.round((60000/parseInt(bpm))/4);
  }

  selectTrack(i) {
    this.selectedTrack = parseInt(i);
  }

  toggleStepOnOff(step) {
    const currentSequence = this.sequence[this.selectedTrack][this.aOrB];
    currentSequence[parseInt(step)] = (currentSequence[parseInt(step)]) ? 0 : 1;
  }

  changeAB() {
    this.aOrB = (this.aOrB === 0) ? 1 : 0;
  }

  selectKit(kit) {
    this.drumKit = new DrumKit(parseInt(kit));
  }

}
