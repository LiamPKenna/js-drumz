import { DrumKit } from './drums.js';
import { Ghost } from './ghost.js';
import { Chaos } from './chaos.js';
import { Doom } from './doom.js';
import { Hank } from './hank.js';
import { getContext, resumeAudio } from './audio.js';

const STEPS = 16;
const DRUM_TRACKS = 10;
const GHOST_TRACK = 10;
const MIN_BPM = 20;
const MAX_BPM = 300;

// Steps are scheduled on the audio clock up to LOOKAHEAD seconds ahead by a
// timer that runs every TICK_MS, so main-thread delays don't affect timing.
const LOOKAHEAD = 0.1;
const TICK_MS = 25;
const START_DELAY = 0.05;

const audioClock = {
  get currentTime() {
    return getContext().currentTime;
  },
  resume: resumeAudio,
};

const browserFrames = {
  request: (callback) => requestAnimationFrame(callback),
  cancel: (id) => cancelAnimationFrame(id),
};

/**
 * The 16-step sequencer. Dispatches a `step` event (detail: { step }) when each
 * step is heard, so the UI can follow the playhead.
 *
 * `clock` and `frames` default to the AudioContext and requestAnimationFrame;
 * tests pass stand-ins.
 */
export class Sequencer extends EventTarget {
  #clock;
  #frames;
  #timer = null;
  #frame = null;
  #nextStepTime = 0;
  #pendingSteps = [];

  constructor(kit = 1, { clock = audioClock, frames = browserFrames } = {}) {
    super();
    this.#clock = clock;
    this.#frames = frames;
    this.kits = new Map();
    this.drumKit = this.#getKit(kit);
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

  // Kits are created once and reused, so their samples are only fetched and
  // decoded the first time they're selected.
  #getKit(number) {
    if (!this.kits.has(number)) this.kits.set(number, new DrumKit(number));
    return this.kits.get(number);
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

  #emitStep(step) {
    this.dispatchEvent(new CustomEvent('step', { detail: { step } }));
  }

  // Schedules every step that falls inside the lookahead window.
  #tick() {
    const horizon = this.#clock.currentTime + LOOKAHEAD;
    while (this.#nextStepTime < horizon) {
      const step = this.currentStep;
      const time = this.#nextStepTime;
      this.playStep(time);
      this.#pendingSteps.push({ step, time });
      this.#nextStepTime += (this.tempo + this.getSwing()) / 1000;
    }
  }

  // Each frame, shows the most recent step that has started sounding.
  #draw = () => {
    const now = this.#clock.currentTime;
    let due = null;
    while (this.#pendingSteps.length && this.#pendingSteps[0].time <= now) {
      due = this.#pendingSteps.shift();
    }
    if (due) this.#emitStep(due.step);
    this.#frame = this.#frames.request(this.#draw);
  };

  togglePlay() {
    if (this.playing) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    this.#reset();
    this.#clock.resume();
    this.playing = true;
    this.#nextStepTime = this.#clock.currentTime + START_DELAY;
    this.#tick();
    this.#timer = setInterval(() => this.#tick(), TICK_MS);
    this.#frame = this.#frames.request(this.#draw);
  }

  stop() {
    this.#reset();
    this.playing = false;
    this.#emitStep(0);
  }

  #reset() {
    clearInterval(this.#timer);
    this.#timer = null;
    if (this.#frame !== null) this.#frames.cancel(this.#frame);
    this.#frame = null;
    this.#pendingSteps = [];
    for (const kit of this.kits.values()) kit.cancelScheduled();
    this.ghost.stop();
    this.currentStep = 0;
  }

  // Plays the current step's drums and ghost note at `time`, then advances.
  playStep(time) {
    this.drumKit.drums.forEach((drum, index) => {
      if (this.sequence[index][this.aOrB][this.currentStep]) {
        drum.play(time);
      }
    });
    const note = this.sequence[GHOST_TRACK][this.aOrB][this.currentStep];
    if (note) this.ghost.oOoO(note, time);
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
    if (!this.playing) this.drumKit.drums[this.selectedTrack].play();
  }

  toggleStepOnOff(step, pattern = this.aOrB) {
    const currentSequence = this.sequence[this.selectedTrack][pattern];
    const index = Number(step);
    currentSequence[index] = currentSequence[index] ? 0 : 1;
  }

  changeAB(index) {
    this.aOrB = Number(index);
  }

  // Switches kits, even mid-playback; a kit's drums join in once its
  // samples have loaded.
  selectKit(kit) {
    this.drumKit = this.#getKit(Number(kit));
    return this.drumKit.ready;
  }

  changePitch(track, pitch) {
    const value = Number(pitch);
    const rate = value <= 64 ? this.convertMidi(value) + 0.5 : this.convertMidi(value) * 2;
    this.drumKit.drums[track].rate = rate;
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
    this.drumKit.drums[track].volume = newVolume;
  }

  // Maps a 0-127 MIDI-style value to 0-1, rounded to two decimals.
  convertMidi(n) {
    return Math.round((Number(n) / 127) * 100) / 100;
  }
}
