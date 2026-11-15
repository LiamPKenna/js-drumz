/*
 * Minimal Web Audio toolkit: oscillator Sounds and the DubDelay, PingPongDelay,
 * LowPassFilter, Tremolo, StereoPanner and Distortion effects.
 *
 * Node graphs, defaults and parameter ranges are derived from Pizzicato 0.6.4
 * (https://github.com/alemangui/pizzicato), MIT License,
 * Copyright (c) 2016 Alejandro Mantecon Guillen.
 */

let context;
let masterGain;

export function getContext() {
  if (!context) {
    context = new AudioContext();
    masterGain = context.createGain();
    masterGain.connect(context.destination);
  }
  return context;
}

// Browsers start an AudioContext suspended until a user gesture; resume on play.
function ensureRunning() {
  const ctx = getContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

const isNumber = (n) => typeof n === 'number' && Number.isFinite(n);
const inRange = (n, min, max) => isNumber(n) && n >= min && n <= max;

const dryLevel = (mix) => {
  if (!inRange(mix, 0, 1)) return 0;
  return mix <= 0.5 ? 1 : 1 - ((mix - 0.5) * 2);
};

const wetLevel = (mix) => {
  if (!inRange(mix, 0, 1)) return 0;
  return mix >= 0.5 ? 1 : 1 - ((0.5 - mix) * 2);
};

// Holds a param at its current value so new automation starts from there.
function holdParam(param, time) {
  const value = param.value;
  param.cancelScheduledValues(time);
  param.setValueAtTime(value, time);
  return value;
}

class Effect {
  options = {};

  applyOptions(options, defaults) {
    for (const key of Object.keys(defaults)) {
      this[key] = options[key] ?? defaults[key];
    }
  }

  connect(node) {
    this.outputNode.connect(node);
    return this;
  }

  disconnect(node) {
    this.outputNode.disconnect(node);
    return this;
  }
}

// Shared dry/wet mix property for effects with dry and wet gain nodes.
class MixEffect extends Effect {
  get mix() {
    return this.options.mix;
  }

  set mix(mix) {
    if (!inRange(mix, 0, 1)) return;
    this.options.mix = mix;
    this.dryGainNode.gain.value = dryLevel(mix);
    this.wetGainNode.gain.value = wetLevel(mix);
  }
}

class DubDelay extends MixEffect {
  constructor(options = {}) {
    super();
    const ctx = getContext();
    this.inputNode = ctx.createGain();
    this.outputNode = ctx.createGain();
    this.dryGainNode = ctx.createGain();
    this.wetGainNode = ctx.createGain();
    this.feedbackGainNode = ctx.createGain();
    this.delayNode = ctx.createDelay();
    this.bqFilterNode = ctx.createBiquadFilter();

    this.inputNode.connect(this.dryGainNode);
    this.dryGainNode.connect(this.outputNode);

    this.inputNode.connect(this.wetGainNode);
    this.inputNode.connect(this.feedbackGainNode);
    this.feedbackGainNode.connect(this.bqFilterNode);
    this.bqFilterNode.connect(this.delayNode);
    this.delayNode.connect(this.feedbackGainNode);
    this.delayNode.connect(this.wetGainNode);
    this.wetGainNode.connect(this.outputNode);

    this.applyOptions(options, { feedback: 0.6, time: 0.7, mix: 0.5, cutoff: 700 });
  }

  get time() {
    return this.options.time;
  }

  set time(time) {
    if (!inRange(time, 0, 180)) return;
    this.options.time = time;
    this.delayNode.delayTime.value = time;
  }

  get feedback() {
    return this.options.feedback;
  }

  set feedback(feedback) {
    if (!inRange(feedback, 0, 1)) return;
    this.options.feedback = feedback;
    this.feedbackGainNode.gain.value = feedback;
  }

  get cutoff() {
    return this.options.cutoff;
  }

  set cutoff(cutoff) {
    if (!inRange(cutoff, 0, 4000)) return;
    this.options.cutoff = cutoff;
    this.bqFilterNode.frequency.value = cutoff;
  }
}

class PingPongDelay extends MixEffect {
  constructor(options = {}) {
    super();
    const ctx = getContext();
    this.inputNode = ctx.createGain();
    this.outputNode = ctx.createGain();
    this.delayNodeLeft = ctx.createDelay();
    this.delayNodeRight = ctx.createDelay();
    this.dryGainNode = ctx.createGain();
    this.wetGainNode = ctx.createGain();
    this.feedbackGainNode = ctx.createGain();
    this.channelMerger = ctx.createChannelMerger(2);

    this.inputNode.connect(this.dryGainNode);
    this.dryGainNode.connect(this.outputNode);

    this.delayNodeLeft.connect(this.channelMerger, 0, 0);
    this.delayNodeRight.connect(this.channelMerger, 0, 1);
    this.delayNodeLeft.connect(this.delayNodeRight);
    this.feedbackGainNode.connect(this.delayNodeLeft);
    this.delayNodeRight.connect(this.feedbackGainNode);

    this.inputNode.connect(this.feedbackGainNode);
    this.channelMerger.connect(this.wetGainNode);
    this.wetGainNode.connect(this.outputNode);

    this.applyOptions(options, { feedback: 0.5, time: 0.3, mix: 0.5 });
  }

  get time() {
    return this.options.time;
  }

  set time(time) {
    if (!inRange(time, 0, 180)) return;
    this.options.time = time;
    this.delayNodeLeft.delayTime.value = time;
    this.delayNodeRight.delayTime.value = time;
  }

  get feedback() {
    return this.options.feedback;
  }

  set feedback(feedback) {
    if (!inRange(feedback, 0, 1)) return;
    this.options.feedback = feedback;
    this.feedbackGainNode.gain.value = feedback;
  }
}

class LowPassFilter extends Effect {
  constructor(options = {}) {
    super();
    const ctx = getContext();
    this.filterNode = ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.inputNode = this.filterNode;
    this.outputNode = ctx.createGain();
    this.filterNode.connect(this.outputNode);

    this.applyOptions(options, { frequency: 350, peak: 1 });
  }

  get frequency() {
    return this.filterNode.frequency.value;
  }

  set frequency(value) {
    if (inRange(value, 10, 22050)) this.filterNode.frequency.value = value;
  }

  get peak() {
    return this.filterNode.Q.value;
  }

  set peak(value) {
    if (inRange(value, 0.0001, 1000)) this.filterNode.Q.value = value;
  }
}

class Tremolo extends MixEffect {
  constructor(options = {}) {
    super();
    const ctx = getContext();
    this.inputNode = ctx.createGain();
    this.outputNode = ctx.createGain();
    this.dryGainNode = ctx.createGain();
    this.wetGainNode = ctx.createGain();

    this.tremoloGainNode = ctx.createGain();
    this.tremoloGainNode.gain.value = 0;
    this.lfoNode = ctx.createOscillator();
    this.lfoNode.type = 'sine';

    this.shaperNode = ctx.createWaveShaper();
    this.shaperNode.curve = new Float32Array([0, 1]);
    this.shaperNode.connect(this.tremoloGainNode.gain);

    this.inputNode.connect(this.dryGainNode);
    this.dryGainNode.connect(this.outputNode);

    this.lfoNode.connect(this.shaperNode);
    this.lfoNode.start(0);

    this.inputNode.connect(this.tremoloGainNode);
    this.tremoloGainNode.connect(this.wetGainNode);
    this.wetGainNode.connect(this.outputNode);

    this.applyOptions(options, { speed: 4, depth: 1, mix: 0.8 });
  }

  get speed() {
    return this.options.speed;
  }

  set speed(speed) {
    if (!inRange(speed, 0, 20)) return;
    this.options.speed = speed;
    this.lfoNode.frequency.value = speed;
  }

  get depth() {
    return this.options.depth;
  }

  set depth(depth) {
    if (!inRange(depth, 0, 1)) return;
    this.options.depth = depth;
    this.shaperNode.curve = new Float32Array([1 - depth, 1]);
  }
}

class StereoPanner extends Effect {
  constructor(options = {}) {
    super();
    const ctx = getContext();
    this.inputNode = ctx.createGain();
    this.outputNode = ctx.createGain();
    this.pannerNode = ctx.createStereoPanner();
    this.inputNode.connect(this.pannerNode);
    this.pannerNode.connect(this.outputNode);

    this.applyOptions(options, { pan: 0 });
  }

  get pan() {
    return this.options.pan;
  }

  set pan(pan) {
    if (!inRange(pan, -1, 1)) return;
    this.options.pan = pan;
    this.pannerNode.pan.value = pan;
  }
}

class Distortion extends Effect {
  constructor(options = {}) {
    super();
    this.waveShaperNode = getContext().createWaveShaper();
    this.inputNode = this.outputNode = this.waveShaperNode;

    this.applyOptions(options, { gain: 0.5 });
  }

  get gain() {
    return this.options.gain;
  }

  set gain(gain) {
    if (!inRange(gain, 0, 1)) return;
    this.options.gain = gain;
    this.waveShaperNode.curve = Distortion.makeCurve(gain);
  }

  // Curve from https://stackoverflow.com/questions/22312841
  static makeCurve(gainAmount) {
    const amount = Math.trunc(gainAmount * 100);
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }
}

export const Effects = {
  DubDelay,
  PingPongDelay,
  LowPassFilter,
  Tremolo,
  StereoPanner,
  Distortion,
};

/*
 * An oscillator voice with attack/release envelope and an effects chain:
 * [osc]->[gainSuccessor]->[fadeNode]->[effect 1]->[connector 1]->...->[masterVolume]->[master]
 */
export class Sound {
  constructor({ options = {} } = {}) {
    const ctx = getContext();
    this.masterVolume = ctx.createGain();
    this.masterVolume.connect(masterGain);
    this.fadeNode = ctx.createGain();
    this.fadeNode.gain.value = 0;

    this.effects = [];
    this.effectConnectors = [];
    this.playing = false;
    this.sourceNode = null;

    this.type = options.type || 'sine';
    this._frequency = isNumber(options.frequency) ? options.frequency : 440;
    this.attack = isNumber(options.attack) ? options.attack : 0.04;
    this.release = isNumber(options.release) ? options.release : 0.04;
    this.volume = isNumber(options.volume) ? options.volume : 1;
  }

  get volume() {
    return this.masterVolume.gain.value;
  }

  set volume(volume) {
    if (inRange(volume, 0, 1)) this.masterVolume.gain.value = volume;
  }

  get frequency() {
    return this._frequency;
  }

  set frequency(frequency) {
    if (!isNumber(frequency)) return;
    this._frequency = frequency;
    if (this.sourceNode) this.sourceNode.frequency.value = frequency;
  }

  play() {
    if (this.playing) return;
    const ctx = ensureRunning();
    this.playing = true;
    this.sourceNode = this.createSourceNode(ctx);
    this.applyAttack(ctx);
    this.sourceNode.start(ctx.currentTime);
  }

  stop() {
    if (!this.playing) return;
    this.playing = false;
    this.stopWithRelease(getContext());
  }

  addEffect(effect) {
    const previousNode = this.effectConnectors.at(-1) ?? this.fadeNode;
    previousNode.disconnect();
    previousNode.connect(effect.inputNode);

    const connector = getContext().createGain();
    this.effects.push(effect);
    this.effectConnectors.push(connector);
    effect.connect(connector);
    connector.connect(this.masterVolume);
    return this;
  }

  inputNode() {
    return this.effects.length > 0 ? this.effects[0].inputNode : this.masterVolume;
  }

  createSourceNode(ctx) {
    const previous = this.sourceNode;
    if (previous) {
      // Fade out the previous oscillator rather than cutting it off, which would click.
      const gain = previous.gainSuccessor.gain;
      holdParam(gain, ctx.currentTime);
      gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      setTimeout(() => {
        previous.disconnect();
        previous.gainSuccessor.disconnect();
      }, 200);
    }

    const node = ctx.createOscillator();
    node.type = this.type;
    node.frequency.value = this._frequency || 440;
    node.gainSuccessor = ctx.createGain();
    node.connect(node.gainSuccessor);
    node.gainSuccessor.connect(this.fadeNode);
    this.fadeNode.connect(this.inputNode());
    return node;
  }

  applyAttack(ctx) {
    const now = ctx.currentTime;
    const current = holdParam(this.fadeNode.gain, now);
    const timeConstant = this.attack ? (1 - current) * this.attack * 2 : 0.001;
    this.fadeNode.gain.setTargetAtTime(1, now, Math.max(timeConstant, 0.001));
  }

  stopWithRelease(ctx) {
    const node = this.sourceNode;
    const now = ctx.currentTime;
    const current = holdParam(this.fadeNode.gain, now);

    if (!this.release) {
      this.fadeNode.gain.setTargetAtTime(0, now, 0.001);
      node.stop(now);
      return;
    }

    const remaining = current * this.release;
    this.fadeNode.gain.setTargetAtTime(0.00001, now, Math.max(remaining / 5, 0.001));
    node.stop(now + remaining);
  }
}
