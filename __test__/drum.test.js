import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Sequencer } from './../src/js/sequencer.js';

// The sequencer's logic is pure; stub the audio-producing instruments so the
// tests don't need a browser AudioContext or audio files.
vi.mock('./../src/js/drums.js', () => ({
  DrumKit: class {
    drums = [];
  },
}));
vi.mock('./../src/js/ghost.js', () => ({
  Ghost: class {
    sound = { stop() {} };
    oOoO() {}
  },
}));
vi.mock('./../src/js/chaos.js', () => ({ Chaos: class {} }));
vi.mock('./../src/js/doom.js', () => ({ Doom: class {} }));
vi.mock('./../src/js/hank.js', () => ({ Hank: class {} }));

describe('Sequencer', () => {
  let sequencer;

  beforeEach(() => {
    sequencer = new Sequencer();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('creates ten drum tracks plus a ghost track, each with A and B patterns of 16 empty steps', () => {
    expect(sequencer.sequence).toHaveLength(11);
    for (const track of sequencer.sequence) {
      expect(track).toEqual([new Array(16).fill(0), new Array(16).fill(0)]);
    }
  });

  test('increments the step and loops back to 0 after 15', () => {
    sequencer.incrementStep();
    expect(sequencer.currentStep).toBe(1);
    for (let i = 0; i < 14; i++) sequencer.incrementStep();
    expect(sequencer.currentStep).toBe(15);
    sequencer.incrementStep();
    expect(sequencer.currentStep).toBe(0);
  });

  describe('changeTempo', () => {
    test('converts bpm to a step length in ms', () => {
      sequencer.changeTempo(135);
      expect(sequencer.tempo).toBe(111);
      expect(sequencer.bpm).toBe(135);
    });

    test('ignores empty, zero and non-numeric input', () => {
      for (const bad of ['', '0', '-5', 'abc']) sequencer.changeTempo(bad);
      expect(sequencer.bpm).toBe(120);
      expect(sequencer.tempo).toBe(125);
    });

    test('clamps to 20-300 bpm', () => {
      sequencer.changeTempo(1000);
      expect(sequencer.bpm).toBe(300);
      sequencer.changeTempo(1);
      expect(sequencer.bpm).toBe(20);
    });
  });

  test('loads a given sequence into the current pattern', () => {
    sequencer.loadSequence([[0,0],[0,8],[1,4],[1,12]]);
    expect(sequencer.sequence[1][0][12]).toBe(1);
  });

  test('loads a sequence into a specific pattern without changing the current one', () => {
    sequencer.loadSequence([[2,3]], 1);
    expect(sequencer.sequence[2][1][3]).toBe(1);
    expect(sequencer.sequence[2][0][3]).toBe(0);
    expect(sequencer.aOrB).toBe(0);
    expect(sequencer.selectedTrack).toBe(0);
  });

  test('sets and clears ghost notes per step', () => {
    sequencer.toggleGhostNote([3, 10]);
    expect(sequencer.getGhost(3)).toBe(10);
    sequencer.ghostOctaveDown = false;
    expect(sequencer.getGhost(3)).toBe(-2);
    sequencer.toggleGhostNote([3, 0]);
    expect(sequencer.sequence[10][0][3]).toBe(0);
  });

  describe('playback', () => {
    test('dispatches a step event for each step played', () => {
      vi.useFakeTimers();
      const steps = [];
      sequencer.addEventListener('step', (event) => steps.push(event.detail.step));
      sequencer.togglePlay();
      vi.advanceTimersByTime(125 * 3);
      expect(steps).toEqual([0, 1, 2, 3]);
    });

    test('stopping and restarting quickly does not run two playback loops', () => {
      vi.useFakeTimers();
      const steps = [];
      sequencer.addEventListener('step', (event) => steps.push(event.detail.step));
      sequencer.togglePlay();
      sequencer.togglePlay();
      sequencer.togglePlay();
      steps.length = 0;
      vi.advanceTimersByTime(125 * 4);
      expect(steps).toEqual([1, 2, 3, 4]);
    });

    test('stop resets the playhead to step 0', () => {
      vi.useFakeTimers();
      sequencer.togglePlay();
      vi.advanceTimersByTime(125 * 5);
      sequencer.stop();
      expect(sequencer.playing).toBe(false);
      expect(sequencer.currentStep).toBe(0);
    });
  });
});
