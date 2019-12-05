import { DrumKit } from './drums.js';
import { Ghost } from './ghost.js';
import { Chaos } from './chaos.js';
import { Doom } from './doom.js';
import { Hank } from './hank.js';


export class Sequencer {
  constructor(kit = 1) {
    this.drumKit = new DrumKit(kit);
    this.currentStep = 0;
    this.playing = false;
    this.sequence = this.makeNewSequence();
    this.tempo = 125;
    this.aOrB = 0;
    this.selectedTrack = 0;
    this.swing = 0;
    this.ghost = new Ghost();
    this.chaos = new Chaos();
    this.doom = new Doom();
    this.hank = new Hank();
    this.ghostOctaveDown = true;
  }

  getSwing() {
    const swingShift = Math.round((this.tempo * 100)*this.swing)/100;
    if (this.currentStep === 0 || (this.currentStep % 2) === 0) {
      return swingShift;
    } else {
      return swingShift * -1;
    }
  }

  makeNewSequence() {
    return Array.from(new Array(11)).map(() => [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ]);
  }

  step(tempo = this.tempo) {
    if (!this.playing) return;
    if (this.frontEndFunction) this.frontEndFunction(this.currentStep);
    const thisSequence = this;
    this.playStep();
    const newTempo = tempo + this.getSwing();
    setTimeout(function () {
      thisSequence.step();
    }, newTempo);
  }

  togglePlay() {
    this.ghost.sound.stop();
    this.currentStep = 0;
    this.playing = !this.playing;
    if (this.frontEndFunction) this.frontEndFunction(this.currentStep);
    if (this.playing) this.step();
  }

  playStep() {
    this.drumKit.drums.forEach((drum, index) => {
      if (this.sequence[index][this.aOrB][this.currentStep]) {
        drum.play('go');
      }
    });
    if (this.sequence[10][this.aOrB][this.currentStep]) {
      const note = this.sequence[10][this.aOrB][this.currentStep];
      this.ghost.oOoO(note);
    }
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
    if (!this.playing) this.drumKit.drums[this.selectedTrack].play('go');
  }

  toggleStepOnOff(step) {
    const currentSequence = this.sequence[this.selectedTrack][this.aOrB];
    currentSequence[parseInt(step)] = (currentSequence[parseInt(step)]) ? 0 : 1;
  }

  changeAB(index) {
    this.aOrB = parseInt(index);
  }

  selectKit(kit) {
    this.drumKit = new DrumKit(parseInt(kit));
  }

  changeVolume(track, volume) {
    const newVolume = this.convertMidi(volume);
    this.drumKit.drums[track].volume(newVolume);
  }

  changePitch(track, pitch) {
    const switchPitch = (n) => {
      let pitch;
      if (n <= 64) {
        pitch = this.convertMidi(n) + .5;
      } else {
        pitch = this.convertMidi(n) * 2;
      }
      return pitch;
    };
    const newPitch = switchPitch(pitch);
    this.drumKit.drums[track].rate(newPitch);
  }

  changeSwing(swing) {
    const swingPercent = this.convertMidi(swing);
    this.swing = ((swingPercent*100)/2)/100;
  }

  loadSequence(array) {
    array.forEach(xy => {
      this.selectedTrack = xy[0];
      this.toggleStepOnOff(xy[1]);
    });
    this.selectedTrack = 0;
  }

  loadGhostSequence(array) {
    array.forEach(stepAndNote => {
      this.toggleGhostNote(stepAndNote);
    });
  }

  toggleGhostNote(stepAndNote) {
    const currentSequence = this.sequence[10][this.aOrB];
    currentSequence[stepAndNote[0]] = stepAndNote[1];
  }

  getGhost(index) {
    const currentNote = this.sequence[10][this.aOrB][index];
    return (this.ghostOctaveDown) ? currentNote : currentNote - 12;
  }

  changeVolumeChaosAndDoom(volume) {
    const chaosVolume = this.convertMidi(volume) * 0.6;
    const doomVolume = this.convertMidi(volume) * 0.3;
    this.chaos.a.volume = chaosVolume;
    this.chaos.b.volume = chaosVolume;
    this.doom.c.volume = doomVolume;
    this.doom.d.volume = doomVolume;
  }

  changeVolumeMaster(track, faderVolume, inputVolume) {
    const newVolume = this.convertMidi(inputVolume) * this.convertMidi(faderVolume);
    this.drumKit.drums[track].volume(newVolume);
  }

  convertMidi(n) {
    return Math.round((parseInt(n)/127)*100)/100;
  }

}
