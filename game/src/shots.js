// The staged scenes behind ?shot=title|play|late|win. Each one deals a real round from the
// fixed seed and then sets the hunt to an exact moment — so many found, so much score, so
// much clock — by writing the state's fields directly. The frame a screenshot shows is the
// game itself at that moment, reproducible to the pixel from the seed alone.

import { ROUND_SECONDS } from './config.js';
import { applyWin, prepareRound, SCREEN_PLAY, SCREEN_TITLE } from './state.js';

/** Mark the named differences found, preferring the picturesque ones; returns how many. */
function markFound(state, preferredIds, count) {
  const chosen = [];
  for (const id of preferredIds) {
    if (state.activeIds.has(id) && chosen.length < count) chosen.push(id);
  }
  for (const difference of state.active) {
    if (chosen.length >= count) break;
    if (!chosen.includes(difference.id)) chosen.push(difference.id);
  }
  for (const id of chosen) state.found.add(id);
  return chosen.length;
}

/**
 * Set the game to the named scene. Returns nothing; the caller paints the frame and flags
 * it ready. Every scene starts from seed-dealt rounds, never from hand-placed differences.
 */
export function stageShot(name, state) {
  if (name === 'play') {
    prepareRound(state, 1);
    state.screen = SCREEN_PLAY;
    markFound(state, ['cat', 'lighthouse', 'sign', 'gull'], 4);
    state.mistakes = 1;
    state.score = 4 * 100 - 25;
    state.timeLeft = 221;
    state.time = ROUND_SECONDS - state.timeLeft;
    state.lastFindId = 'sign';
    state.lastFindAt = state.time - 5;
    return;
  }
  if (name === 'late') {
    prepareRound(state, 3);
    state.screen = SCREEN_PLAY;
    markFound(state, ['moon', 'pennant', 'window', 'crates', 'fish', 'lantern', 'rope'], 7);
    state.mistakes = 1;
    state.hintsUsed = 1;
    state.score = 7 * 100 - 25 - 50;
    state.timeLeft = 118;
    state.time = ROUND_SECONDS - state.timeLeft;
    const hinted = state.active.find((difference) => !state.found.has(difference.id));
    if (hinted) {
      state.hintId = hinted.id;
      state.hintUntil = state.time + 999;
    }
    state.lastFindId = 'crates';
    state.lastFindAt = state.time - 5;
    return;
  }
  if (name === 'win') {
    prepareRound(state, 1);
    for (const difference of state.active) state.found.add(difference.id);
    state.mistakes = 1;
    state.score = 10 * 100 - 25;
    state.timeLeft = 104;
    state.time = ROUND_SECONDS - state.timeLeft;
    applyWin(state);
    return;
  }
  // 'title' and anything unknown: the title screen over round one's harbour.
  prepareRound(state, 1);
  state.screen = SCREEN_TITLE;
  state.score = 0;
  state.timeLeft = ROUND_SECONDS;
}
