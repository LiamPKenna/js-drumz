import { DrumKit } from './drums.js';
import { Ghost } from './ghost.js';
import { Chaos } from './chaos.js';
import { Doom } from './doom.js';
import { Hank } from './hank.js';

const STEPS = 16;
const DRUM_TRACKS = 10;
const GHOST_TRACK = 10;
const MIN_BPM = 20;
const MAX_BPM = 300;

/**
 * The 16-step sequencer. Dispatches a `step` event (detail: { step }) each time
 * the playhead moves, so the UI can follow along.
 */
export class Sequencer extends EventTarget {
  #timer = null;

  constructor(kit = 1) {
    super();
    this.drumKit = new DrumKit(kit);
    this.currentStep = 0;
    this.playing = false;
    this.sequence = this.makeNewSequence();
    this.bpm = 120;
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
    const swingShift = Math.round((this.tempo * 100) * this.swing) / 100;
    return this.currentStep % 2 === 0 ? swingShift : -swingShift;
  }

  // Ten drum tracks plus the ghost track, each with an A and a B pattern.
  makeNewSequence() {
    return Array.from({ length: DRUM_TRACKS + 1 }, () => [
      new Array(STEPS).fill(0),
      new Array(STEPS).fill(0),
    ]);
  }

  #emitStep() {
    this.dispatchEvent(new CustomEvent('step', { detail: { step: this.currentStep } }));
  }

  step() {
    if (!this.playing) return;
    this.#emitStep();
    this.playStep();
    this.#timer = setTimeout(() => this.step(), this.tempo + this.getSwing());
  }

  togglePlay() {
    if (this.playing) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    this.#reset();
    this.playing = true;
    this.step();
  }

  stop() {
    this.#reset();
    this.playing = false;
    this.#emitStep();
  }

  #reset() {
    clearTimeout(this.#timer);
    this.#timer = null;
    this.ghost.sound.stop();
    this.currentStep = 0;
  }

  playStep() {
    this.drumKit.drums.forEach((drum, index) => {
      if (this.sequence[index][this.aOrB][this.currentStep]) {
        drum.play('go');
      }
    });
    const note = this.sequence[GHOST_TRACK][this.aOrB][this.currentStep];
    if (note) this.ghost.oOoO(note);
    this.incrementStep();
  }

  incrementStep() {
    this.currentStep = (this.currentStep + 1) % STEPS;
  }

  // Sets the step length in ms from beats per minute (four steps per beat).
  // Invalid input is ignored; out-of-range values are clamped.
  changeTempo(bpm) {
    const value = Number(bpm);
    if (!Number.isFinite(value) || value <= 0) return;
    this.bpm = Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(value)));
    this.tempo = Math.round((60000 / this.bpm) / 4);
  }

  selectTrack(i) {
    this.selectedTrack = Number(i);
    if (!this.playing) this.drumKit.drums[this.selectedTrack].play('go');
  }

  toggleStepOnOff(step, pattern = this.aOrB) {
    const currentSequence = this.sequence[this.selectedTrack][pattern];
    const index = Number(step);
    currentSequence[index] = currentSequence[index] ? 0 : 1;
  }

  changeAB(index) {
    this.aOrB = Number(index);
  }

  selectKit(kit) {
    this.drumKit = new DrumKit(Number(kit));
  }

  changeVolume(track, volume) {
    this.drumKit.drums[track].volume(this.convertMidi(volume));
  }

  changePitch(track, pitch) {
    const value = Number(pitch);
    const rate = value <= 64 ? this.convertMidi(value) + 0.5 : this.convertMidi(value) * 2;
    this.drumKit.drums[track].rate(rate);
  }

  changeSwing(swing) {
    const swingPercent = this.convertMidi(swing);
    this.swing = ((swingPercent * 100) / 2) / 100;
  }

  // Loads [track, step] pairs into a pattern (the current one by default).
  loadSequence(pairs, pattern = this.aOrB) {
    const previousTrack = this.selectedTrack;
    pairs.forEach(([track, step]) => {
      this.selectedTrack = track;
      this.toggleStepOnOff(step, pattern);
    });
    this.selectedTrack = previousTrack;
  }

  loadGhostSequence(pairs) {
    pairs.forEach((stepAndNote) => this.toggleGhostNote(stepAndNote));
  }

  // Sets the ghost note for a step (0 clears it).
  toggleGhostNote([step, note]) {
    this.sequence[GHOST_TRACK][this.aOrB][step] = note;
  }

  getGhost(index) {
    const currentNote = this.sequence[GHOST_TRACK][this.aOrB][index];
    return this.ghostOctaveDown ? currentNote : currentNote - 12;
  }

  changeMangleVolume(volume) {
    const level = this.convertMidi(volume);
    this.chaos.a.volume = this.chaos.b.volume = level * 0.6;
    this.doom.c.volume = this.doom.d.volume = level * 0.3;
    this.hank.e.volume = this.hank.f.volume = level * 0.45;
  }

  changeVolumeMaster(track, faderVolume, inputVolume) {
    const newVolume = this.convertMidi(inputVolume) * this.convertMidi(faderVolume);
    this.drumKit.drums[track].volume(newVolume);
  }

  // Maps a 0-127 MIDI-style value to 0-1, rounded to two decimals.
  convertMidi(n) {
    return Math.round((Number(n) / 127) * 100) / 100;
  }
}
