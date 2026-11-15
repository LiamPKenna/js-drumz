import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Sequencer } from './../src/js/sequencer.js';

// The sequencer's logic is pure; stub the audio-producing instruments so the
// tests don't need a browser AudioContext or audio files. Stub drums record the
// audio-clock time of every hit.
vi.mock('./../src/js/drums.js', () => ({
  DrumKit: class {
    constructor(number) {
      this.number = number;
      this.cancelled = 0;
      this.ready = Promise.resolve();
      this.drums = Array.from({ length: 10 }, () => ({
        hits: [],
        volume: 0.79,
        rate: 1,
        play(time) { this.hits.push(time); },
      }));
    }
    cancelScheduled() { this.cancelled += 1; }
  },
}));
vi.mock('./../src/js/ghost.js', () => ({
  Ghost: class {
    notes = [];
    oOoO(note, time) { this.notes.push([note, time]); }
    stop() {}
  },
}));
vi.mock('./../src/js/chaos.js', () => ({ Chaos: class {} }));
vi.mock('./../src/js/doom.js', () => ({ Doom: class {} }));
vi.mock('./../src/js/hank.js', () => ({ Hank: class {} }));

// A stand-in audio clock that follows the (fake) system time, plus animation
// frames driven by fake timers.
const START = 1000;
const clock = {
  get currentTime() { return Date.now() / 1000 - START; },
  resume() {},
};
const frames = {
  request: (callback) => setTimeout(callback, 16),
  cancel: (id) => clearTimeout(id),
};

describe('Sequencer', () => {
  let sequencer;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START * 1000);
    sequencer = new Sequencer(1, { clock, frames });
  });

  afterEach(() => {
    sequencer.stop();
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

  describe('kits', () => {
    test('reuses a kit when it is selected again', () => {
      const first = sequencer.drumKit;
      sequencer.selectKit(2);
      const second = sequencer.drumKit;
      expect(second.number).toBe(2);
      sequencer.selectKit(1);
      expect(sequencer.drumKit).toBe(first);
      sequencer.selectKit(2);
      expect(sequencer.drumKit).toBe(second);
    });

    test('switching kits does not stop playback', () => {
      sequencer.start();
      sequencer.selectKit(3);
      expect(sequencer.playing).toBe(true);
    });

    test('mixer and pitch settings apply to the current kit', () => {
      sequencer.changeVolumeMaster(2, 127, 64);
      sequencer.changePitch(2, 100);
      expect(sequencer.drumKit.drums[2].volume).toBe(0.5);
      expect(sequencer.drumKit.drums[2].rate).toBe(1.58);
    });
  });

  describe('playback', () => {
    const kick = () => sequencer.drumKit.drums[0].hits;

    test('schedules hits on the audio clock at exact step times', () => {
      sequencer.loadSequence([[0, 0], [0, 4], [0, 8]]);
      sequencer.start();
      vi.advanceTimersByTime(1200);
      const [a, b, c] = kick();
      expect(kick()).toHaveLength(3);
      expect(a).toBeCloseTo(0.05, 9);
      expect(b - a).toBeCloseTo(0.5, 9);
      expect(c - b).toBeCloseTo(0.5, 9);
    });

    test('schedules the ghost note with the drums', () => {
      sequencer.toggleGhostNote([1, 5]);
      sequencer.start();
      vi.advanceTimersByTime(300);
      const [[note, time]] = sequencer.ghost.notes;
      expect(note).toBe(5);
      expect(time).toBeCloseTo(0.175, 9);
    });

    test('swing alternates short and long steps', () => {
      sequencer.loadSequence([[0, 0], [0, 1], [0, 2], [0, 3]]);
      sequencer.changeSwing(127); // 50%: 62.5ms shift at 120 bpm
      sequencer.start();
      vi.advanceTimersByTime(500);
      const gaps = kick().slice(1).map((t, i) => t - kick()[i]);
      expect(gaps[0]).toBeCloseTo(0.0625, 9);
      expect(gaps[1]).toBeCloseTo(0.1875, 9);
      expect(gaps[2]).toBeCloseTo(0.0625, 9);
    });

    test('only schedules within the lookahead window', () => {
      sequencer.sequence[0][0].fill(1);
      sequencer.start();
      const horizon = clock.currentTime + 0.1;
      expect(kick().every((t) => t < horizon)).toBe(true);
      expect(kick()).toHaveLength(1);
    });

    test('dispatches step events as each step is heard', () => {
      const steps = [];
      sequencer.addEventListener('step', (event) => steps.push(event.detail.step));
      sequencer.start();
      vi.advanceTimersByTime(40);
      expect(steps).toEqual([]);
      vi.advanceTimersByTime(30);
      expect(steps).toEqual([0]);
      vi.advanceTimersByTime(125 * 3);
      expect(steps).toEqual([0, 1, 2, 3]);
    });

    test('stopping and restarting quickly does not run two playback loops', () => {
      sequencer.sequence[0][0].fill(1);
      sequencer.togglePlay();
      sequencer.togglePlay();
      sequencer.togglePlay();
      kick().length = 0;
      vi.advanceTimersByTime(500);
      const gaps = kick().slice(1).map((t, i) => t - kick()[i]);
      expect(kick()).toHaveLength(4);
      expect(gaps.every((g) => Math.abs(g - 0.125) < 1e-9)).toBe(true);
    });

    test('stop cancels scheduled hits and resets the playhead', () => {
      sequencer.start();
      vi.advanceTimersByTime(300);
      sequencer.stop();
      expect(sequencer.playing).toBe(false);
      expect(sequencer.currentStep).toBe(0);
      expect(sequencer.drumKit.cancelled).toBeGreaterThan(0);
    });
  });
});
