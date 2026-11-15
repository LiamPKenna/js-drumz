import './css/base.css';
import './css/styles.css';
import arts from './js/art.js';
import { drumKeys, ghostKeys } from './js/keyMap.js';
import { Sequencer } from './js/sequencer.js';

// ---------------------------------------------------------------------------
// Sequencer setup: the demo beat for patterns A and B.
// ---------------------------------------------------------------------------
const sequencer = new Sequencer(1);
sequencer.loadSequence([[0,0],[0,6],[1,4],[1,12],[2,15],[3,14],[4,13],[5,4],[5,12],[6,4],[7,0],[7,4],[7,8],[7,12],[8,14],[9,0]], 0);
sequencer.loadSequence([[0,10],[4,2],[4,6],[4,12],[7,2],[7,6],[7,10],[7,14],[8,0],[8,12]], 1);
sequencer.changeSwing(10);

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------
const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];

// Marks one element in a group as active (glow class + aria-pressed).
const setActive = (elements, active, className) => {
  for (const el of elements) {
    const isActive = el === active;
    el.classList.toggle(className, isActive);
    el.setAttribute('aria-pressed', String(isActive));
  }
};

const ui = {
  masterVolume: qs('#master-volume'),
  patternButtons: qsa('.a-b-buttons'),
  tempo: qs('#tempo-input'),
  kit: qs('#kit-select'),
  swing: qs('#swing-slider'),
  startStop: qs('#start-stop-button'),
  instrumentPanel: qs('#body'),
  instrumentButtons: qsa('.instrument-button'),
  trackVolumes: qsa('.volume'),
  trackPitches: qsa('.pitch-slider'),
  stepSequencer: qs('#step-sequencer'),
  stepButtons: qsa('.sequence-button'),
  ghostVolume: qs('.ghost-slider'),
  octaveButtons: qsa('.ghost-octave-button'),
  delayControls: qs('#delay-control-margin'),
  mixControls: qs('.filter-controls'),
  keyboard: qs('.key-wrapper'),
  ghostOff: qs('#ghost-off'),
  ghostNotes: new Map(qsa('[data-note]').map((el) => [Number(el.dataset.note), el])),
  ghostStep: qs('#ghost-step'),
  ghostBack: qs('.ghost-back-button'),
  ghostForward: qs('.ghost-forward-button'),
  mangleVolume: qs('.chaos-slider'),
  kill: qs('.chaos-kill-button'),
  pads: { chaos: qs('#chaos'), doom: qs('#doom'), hank: qs('#hank') },
};

// ---------------------------------------------------------------------------
// ASCII art
// ---------------------------------------------------------------------------
const art = {
  hankhead: arts.hankhead,
  hank: arts.hank,
  doomhead: arts.doomHead,
  doom: arts.doom,
  chaos: arts.chaos,
  chaoshead: arts.chaosHead,
};
for (const [id, text] of Object.entries(art)) {
  document.getElementById(id).textContent = text;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
let ghostEditStep = 0;
let glowingStep = null;

const renderSequence = () => {
  const pattern = sequencer.sequence[sequencer.selectedTrack][sequencer.aOrB];
  ui.stepButtons.forEach((button, index) => {
    const on = Boolean(pattern[index]);
    button.classList.toggle('on', on);
    button.setAttribute('aria-pressed', String(on));
  });
};

const renderGhost = () => {
  ui.ghostStep.textContent = String(ghostEditStep + 1);
  const note = sequencer.getGhost(ghostEditStep);
  for (const [value, el] of ui.ghostNotes) {
    el.classList.toggle('ghost-glow', value === note);
  }
};

const renderPlayhead = (step) => {
  glowingStep?.classList.remove('glow');
  glowingStep = ui.stepButtons[step];
  glowingStep.classList.add('glow');

  for (const el of ui.ghostNotes.values()) el.classList.remove('key-press');
  const stepNote = sequencer.sequence[10][sequencer.aOrB][step];
  if (stepNote) {
    const note = sequencer.ghostOctaveDown ? stepNote : stepNote - 12;
    if (note > 0 && note < 14) ui.ghostNotes.get(note).classList.add('key-press');
  }
};

const flashKey = (note) => {
  const el = ui.ghostNotes.get(note);
  if (!el) return;
  el.classList.add('key-press');
  setTimeout(() => el.classList.remove('key-press'), 100);
};

sequencer.addEventListener('step', (event) => renderPlayhead(event.detail.step));

// ---------------------------------------------------------------------------
// Drum machine
// ---------------------------------------------------------------------------
const togglePlay = () => {
  sequencer.togglePlay();
  ui.startStop.setAttribute('aria-pressed', String(sequencer.playing));
};

const applyMixer = () => {
  ui.trackVolumes.forEach((fader, track) => {
    sequencer.changeVolumeMaster(track, fader.value, ui.masterVolume.value);
  });
};

ui.startStop.addEventListener('click', togglePlay);

ui.stepSequencer.addEventListener('click', (event) => {
  const button = event.target.closest('[data-step]');
  if (!button) return;
  sequencer.toggleStepOnOff(button.dataset.step);
  renderSequence();
});

ui.instrumentPanel.addEventListener('click', (event) => {
  const button = event.target.closest('.instrument-button');
  if (!button) return;
  sequencer.selectTrack(button.dataset.track);
  setActive(ui.instrumentButtons, button, 'instrument-glow');
  renderSequence();
});

ui.instrumentPanel.addEventListener('input', (event) => {
  const { track } = event.target.dataset;
  if (event.target.matches('.volume')) {
    sequencer.changeVolumeMaster(track, event.target.value, ui.masterVolume.value);
  } else if (event.target.matches('.pitch-slider')) {
    sequencer.changePitch(track, event.target.value);
  }
});

ui.masterVolume.addEventListener('input', applyMixer);

ui.tempo.addEventListener('change', () => {
  sequencer.changeTempo(ui.tempo.value);
  ui.tempo.value = String(sequencer.bpm);
});

ui.kit.addEventListener('change', () => {
  sequencer.stop();
  ui.startStop.setAttribute('aria-pressed', 'false');
  sequencer.selectKit(ui.kit.value);
  sequencer.drumKit.drums.forEach((drum) => drum.play('go'));
  applyMixer();
  ui.trackPitches.forEach((slider, track) => sequencer.changePitch(track, slider.value));
});

ui.swing.addEventListener('input', () => sequencer.changeSwing(ui.swing.value));

for (const button of ui.patternButtons) {
  button.addEventListener('click', () => {
    sequencer.changeAB(button.dataset.pattern);
    setActive(ui.patternButtons, button, 'a-b-glow');
    renderSequence();
    renderGhost();
  });
}

// ---------------------------------------------------------------------------
// Ghost machine
// ---------------------------------------------------------------------------
const withOctave = (note) => (sequencer.ghostOctaveDown ? note : note + 12);

ui.keyboard.addEventListener('click', (event) => {
  const key = event.target.closest('[data-note]');
  if (!key) return;
  const note = withOctave(Number(key.dataset.note));
  if (!sequencer.playing) sequencer.ghost.oOoO(note);
  sequencer.toggleGhostNote([ghostEditStep, note]);
  renderGhost();
});

ui.ghostOff.addEventListener('click', () => {
  sequencer.toggleGhostNote([ghostEditStep, 0]);
  renderGhost();
});

ui.ghostBack.addEventListener('click', () => {
  ghostEditStep = (ghostEditStep + 15) % 16;
  renderGhost();
});

ui.ghostForward.addEventListener('click', () => {
  ghostEditStep = (ghostEditStep + 1) % 16;
  renderGhost();
});

for (const button of ui.octaveButtons) {
  button.addEventListener('click', () => {
    sequencer.ghostOctaveDown = button.dataset.octave === 'low';
    setActive(ui.octaveButtons, button, 'ghost-octave-glow');
    renderGhost();
  });
}

ui.ghostVolume.addEventListener('input', () => sequencer.ghost.changeVolume(ui.ghostVolume.value));

ui.delayControls.addEventListener('input', (event) => {
  const { param } = event.target.dataset;
  if (param) sequencer.ghost.changeDub(param, event.target.value);
});

ui.mixControls.addEventListener('input', (event) => {
  const { param } = event.target.dataset;
  if (param) sequencer.ghost.changePanOrGrime(param, event.target.value);
});

// ---------------------------------------------------------------------------
// Mangle machine
// ---------------------------------------------------------------------------
// Each pad plays two voices while pressed; pointer position sets their pitches.
// Pointer capture stops the sound on release even outside the pad, and a
// double-click latches the voices on until the next press or Kill.
const bindPad = (pad, voices, toNotes, instrument) => {
  const play = () => voices.forEach((voice) => voice.play());
  const stop = () => voices.forEach((voice) => voice.stop());

  pad.addEventListener('pointermove', (event) => {
    instrument.changeNote(...toNotes(event.pageX, event.pageY));
  });
  pad.addEventListener('pointerdown', (event) => {
    pad.setPointerCapture(event.pointerId);
    play();
  });
  pad.addEventListener('pointerup', stop);
  pad.addEventListener('pointercancel', stop);
  pad.addEventListener('dblclick', play);
};

const { chaos, doom, hank } = sequencer;

bindPad(ui.pads.chaos, [chaos.a, chaos.b],
  (x, y) => [Math.trunc(x / 5), Math.trunc(y / 9)], chaos);
bindPad(ui.pads.doom, [doom.c, doom.d],
  (x, y) => [Math.trunc(x / 4), Math.trunc(y / 5)], doom);
bindPad(ui.pads.hank, [hank.e, hank.f],
  (x, y) => [Math.trunc((y - x) / 4), Math.trunc((y - x) / 8)], hank);

ui.mangleVolume.addEventListener('input', () => sequencer.changeMangleVolume(ui.mangleVolume.value));

ui.kill.addEventListener('click', () => {
  doom.ping.feedback = 0;
  doom.dub.feedback = 0;
  hank.dub.feedback = 0;
  [doom.c, doom.d, chaos.a, chaos.b, hank.e, hank.f].forEach((voice) => voice.stop());
  setTimeout(() => {
    doom.ping.feedback = 0.6;
    doom.dub.feedback = 0.3;
    hank.dub.feedback = 0.3;
  }, 1000);
});

// ---------------------------------------------------------------------------
// Keyboard: Space = start/stop, Q-P = drums, Z-, = ghost notes
// ---------------------------------------------------------------------------
const isTextEntry = (el) =>
  el instanceof Element && el.matches('input:not([type="range"]), select, textarea, [contenteditable]');

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey || isTextEntry(event.target)) return;

  if (event.code === 'Space') {
    event.preventDefault();
    if (!event.repeat) togglePlay();
  } else if (drumKeys.has(event.code)) {
    event.preventDefault();
    sequencer.drumKit.drums[drumKeys.get(event.code)].play('go');
  } else if (ghostKeys.has(event.code)) {
    event.preventDefault();
    const note = ghostKeys.get(event.code);
    sequencer.ghost.oOoO(withOctave(note));
    flashKey(note);
  }
});

// ---------------------------------------------------------------------------
// Initial render
// ---------------------------------------------------------------------------
renderSequence();
renderGhost();
renderPlayhead(0);
