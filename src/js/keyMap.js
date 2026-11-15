// Keyboard shortcuts, keyed by physical key position (KeyboardEvent.code) so the
// layout stays the same on non-QWERTY keyboards.

// Top letter row plays the ten drum tracks.
export const drumKeys = new Map([
  ['KeyQ', 0],
  ['KeyW', 1],
  ['KeyE', 2],
  ['KeyR', 3],
  ['KeyT', 4],
  ['KeyY', 5],
  ['KeyU', 6],
  ['KeyI', 7],
  ['KeyO', 8],
  ['KeyP', 9],
]);

// Bottom two rows form a one-octave piano for the Ghost Machine (1 = C ... 13 = C).
export const ghostKeys = new Map([
  ['KeyZ', 1],
  ['KeyS', 2],
  ['KeyX', 3],
  ['KeyD', 4],
  ['KeyC', 5],
  ['KeyV', 6],
  ['KeyG', 7],
  ['KeyB', 8],
  ['KeyH', 9],
  ['KeyN', 10],
  ['KeyJ', 11],
  ['KeyM', 12],
  ['Comma', 13],
]);
