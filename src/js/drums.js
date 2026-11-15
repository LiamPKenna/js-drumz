import { getContext, getOutput, resumeAudio } from './audio.js';
import getKit from './drumimporter.js';

// Each hit plays from 50ms into the sample, for at most 2s of it.
const SAMPLE_OFFSET = 0.05;
const SAMPLE_LENGTH = 2;
const DEFAULT_VOLUME = 0.79;

// Decoded samples, shared across kits and kept for the life of the page.
const buffers = new Map();

function loadBuffer(url) {
  if (!buffers.has(url)) {
    const buffer = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
        return response.arrayBuffer();
      })
      .then((data) => getContext().decodeAudioData(data));
    buffers.set(url, buffer);
  }
  return buffers.get(url);
}

class Drum {
  #buffer = null;
  #rate = 1;
  #sources = new Map();

  constructor(url) {
    const ctx = getContext();
    this.gain = ctx.createGain();
    this.gain.gain.value = DEFAULT_VOLUME;
    this.gain.connect(getOutput());
    this.ready = loadBuffer(url).then((buffer) => {
      this.#buffer = buffer;
    });
  }

  set volume(value) {
    this.gain.gain.value = value;
  }

  set rate(value) {
    this.#rate = value;
  }

  // Plays the drum at an AudioContext time (now by default). Hits requested
  // before the sample has decoded are skipped.
  play(when = 0) {
    if (!this.#buffer) return;
    const ctx = resumeAudio();
    const source = ctx.createBufferSource();
    source.buffer = this.#buffer;
    source.playbackRate.value = this.#rate;
    source.connect(this.gain);
    const start = Math.max(when, ctx.currentTime);
    source.start(start, SAMPLE_OFFSET, SAMPLE_LENGTH);
    this.#sources.set(source, start);
    source.onended = () => {
      source.disconnect();
      this.#sources.delete(source);
    };
  }

  // Cancels hits that are scheduled but haven't started yet.
  cancelScheduled() {
    const now = getContext().currentTime;
    for (const [source, start] of this.#sources) {
      if (start > now) source.stop();
    }
  }
}

export class DrumKit {
  constructor(number) {
    this.drums = getKit(number).map((url) => new Drum(url));
    this.ready = Promise.all(this.drums.map((drum) => drum.ready));
  }

  cancelScheduled() {
    this.drums.forEach((drum) => drum.cancelScheduled());
  }
}
