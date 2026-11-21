// The game's state and its rules: which screen is up, what the current round planted, what
// has been found, and what a click, a hint and the clock do. Nothing here draws or sounds —
// render.js paints this state, audio.js answers its events, and main.js wires them together.
// Time inside the state is seconds of play, advanced only by tick(), so a staged screenshot
// scene can freeze any moment it likes.

import { ROUND_SECONDS, SCORE } from './config.js';
import { createRandom } from './random.js';
import { pickRoundDifferences } from './differences.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WON = 'won';
export const SCREEN_LOST = 'lost';

/** A fresh game on its title screen; `seed` fixes every round's deal of differences. */
export function createGame(seed) {
  return {
    seed,
    screen: SCREEN_TITLE,
    round: 0,
    active: [],
    activeIds: new Set(),
    found: new Set(),
    score: 0,
    best: 0,
    mistakes: 0,
    hintsUsed: 0,
    time: 0,
    timeLeft: ROUND_SECONDS,
    hintId: null,
    hintUntil: 0,
    lastFindId: null,
    lastFindAt: -10,
    miss: null,
    win: null,
  };
}

/**
 * Deal a round: pick its differences from the catalogue (the round number salts the seed,
 * so consecutive rounds differ) and reset the hunt. Does not change the screen.
 */
export function prepareRound(state, round) {
  const random = createRandom((state.seed + round * 7919) >>> 0);
  state.round = round;
  state.active = pickRoundDifferences(random, round);
  state.activeIds = new Set(state.active.map((difference) => difference.id));
  state.found = new Set();
  state.mistakes = 0;
  state.hintsUsed = 0;
  state.time = 0;
  state.timeLeft = ROUND_SECONDS;
  state.hintId = null;
  state.hintUntil = 0;
  state.lastFindId = null;
  state.lastFindAt = -10;
  state.miss = null;
  state.win = null;
}

/** Begin the dealt round: the clock starts and clicks count. */
export function startRound(state, round) {
  prepareRound(state, round);
  state.screen = SCREEN_PLAY;
}

/** Settle a cleared round: bank the time bonus and freeze the win card's numbers. */
export function applyWin(state) {
  const bonus = Math.floor(state.timeLeft) * SCORE.secondLeft;
  state.score += bonus;
  state.win = {
    round: state.round,
    timeUsed: ROUND_SECONDS - state.timeLeft,
    bonus,
    score: state.score,
    mistakes: state.mistakes,
  };
  state.screen = SCREEN_WON;
}

/**
 * Judge a click at scene coordinates. A click inside an unfound difference's radius finds
 * it: the find is recorded (the renderer marks both pictures), the score pays, and clearing
 * the last one wins the round. Any other click is a mistake: it costs points, and the miss
 * is remembered briefly so the renderer can flash it and shake that picture.
 */
export function clickAt(state, sceneX, sceneY, panel) {
  if (state.screen !== SCREEN_PLAY) return { result: 'ignored' };
  let nearest = null;
  let nearestDistance = Infinity;
  for (const difference of state.active) {
    if (state.found.has(difference.id)) continue;
    const distance = Math.hypot(sceneX - difference.x, sceneY - difference.y);
    if (distance <= difference.radius && distance < nearestDistance) {
      nearest = difference;
      nearestDistance = distance;
    }
  }
  if (nearest !== null) {
    state.found.add(nearest.id);
    state.score += SCORE.find;
    state.lastFindId = nearest.id;
    state.lastFindAt = state.time;
    if (state.hintId === nearest.id) state.hintId = null;
    if (state.found.size === state.active.length) applyWin(state);
    return { result: 'found', difference: nearest };
  }
  state.mistakes += 1;
  state.score = Math.max(0, state.score - SCORE.mistake);
  state.miss = { x: sceneX, y: sceneY, panel, at: state.time };
  return { result: 'miss' };
}

/**
 * Spend points to be shown one unfound difference: the renderer rings it on both pictures
 * for a moment. Returns the difference hinted, or null when nothing is left to hint.
 */
export function useHint(state) {
  if (state.screen !== SCREEN_PLAY) return null;
  const remaining = state.active.filter((difference) => !state.found.has(difference.id));
  if (remaining.length === 0) return null;
  const random = createRandom((state.seed + state.round * 131 + state.hintsUsed * 17) >>> 0);
  const target = remaining[random.int(0, remaining.length - 1)];
  state.hintsUsed += 1;
  state.score = Math.max(0, state.score - SCORE.hint);
  state.hintId = target.id;
  state.hintUntil = state.time + 1.6;
  return target;
}

/** Advance the clock; a round whose time runs out is lost to the tide. */
export function tick(state, dt) {
  if (state.screen !== SCREEN_PLAY) return;
  state.time += dt;
  state.timeLeft = Math.max(0, state.timeLeft - dt);
  if (state.timeLeft <= 0) state.screen = SCREEN_LOST;
}

/** How many differences the round still hides — the number the big counter shows. */
export function remainingCount(state) {
  return state.active.length - state.found.size;
}
