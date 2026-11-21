// Boot and the one loop. Lantern Harbour keeps its two pictures as offscreen canvases,
// repainted only when a round is dealt (the scene is still; everything that moves — marker
// pulses, the hint ring, the clock — lives in the overlay the renderer draws each frame).
// The loop advances the hunt in fixed 1/60 s steps and paints what the state says.
//
// ?seed=N fixes every round's deal of differences. ?shot=title|play|late|win (with &seed=N)
// stages that scene instead of running the loop, paints it and sets window.__shotReady.

import { BEST_KEY, PANEL, SCENE } from './config.js';
import { renderSceneCanvas } from './scene.js';
import {
  clickAt,
  createGame,
  prepareRound,
  SCREEN_LOST,
  SCREEN_PLAY,
  SCREEN_TITLE,
  SCREEN_WON,
  startRound,
  tick,
  useHint,
} from './state.js';
import { createRenderer, hudButtons } from './render.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_RESTART, buttonAt, createInput, panelAt } from './input.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';

const STEP = 1 / 60;
/** The longest frame the loop catches up on; a longer stall is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const renderer = createRenderer(canvas);
const audio = createAudio();
const state = createGame(seed);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function writeBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // A private window may refuse storage; the best score is a nicety, not the game.
  }
}
state.best = readBest();

/** The current round's two pictures, repainted whenever a round is dealt. */
let scenes = null;
function repaintScenes() {
  scenes = {
    original: renderSceneCanvas('original', state.activeIds),
    altered: renderSceneCanvas('altered', state.activeIds),
  };
}

function announce(message) {
  if (status) status.textContent = message;
}

function beginRound(round) {
  startRound(state, round);
  repaintScenes();
  announce(`Round ${round}: ${state.active.length} differences to find.`);
}

function settleBest() {
  if (state.score > state.best) {
    state.best = state.score;
    writeBest(state.best);
  }
}

function handleSceneClick(panel, sceneX, sceneY) {
  const outcome = clickAt(state, sceneX, sceneY, panel);
  if (outcome.result === 'found') {
    audio.playFind();
    announce(`Found: ${outcome.difference.name}. ${state.active.length - state.found.size} to go.`);
    if (state.screen === SCREEN_WON) {
      audio.playWin();
      settleBest();
      announce(`Round cleared. Score ${state.score}.`);
    }
  } else if (outcome.result === 'miss') {
    audio.playMiss();
    announce('Not a difference. That click cost 25 points.');
  }
}

function handleAction(action) {
  audio.unlock();
  if (action === ACTION_CONFIRM) {
    if (state.screen === SCREEN_TITLE) beginRound(1);
    else if (state.screen === SCREEN_WON) beginRound(state.round + 1);
    else if (state.screen === SCREEN_LOST) beginRound(state.round);
  } else if (action === ACTION_HINT) {
    const target = useHint(state);
    if (target !== null) {
      audio.playHint();
      announce(`Hint: look near the ${target.name.toLowerCase()}.`);
    }
  } else if (action === ACTION_RESTART) {
    if (state.screen !== SCREEN_TITLE) beginRound(state.round + 1);
  }
}

createInput(canvas, {
  onStageClick(x, y) {
    audio.unlock();
    if (state.screen === SCREEN_TITLE || state.screen === SCREEN_WON || state.screen === SCREEN_LOST) {
      handleAction(ACTION_CONFIRM);
      return;
    }
    const button = buttonAt(x, y, hudButtons());
    if (button !== null) {
      if (button.id === 'hint') handleAction(ACTION_HINT);
      else if (button.id === 'restart') handleAction(ACTION_RESTART);
      return;
    }
    const hit = panelAt(x, y, {
      top: PANEL.top,
      leftX: PANEL.leftX,
      rightX: PANEL.rightX,
      sceneWidth: SCENE.width,
      sceneHeight: SCENE.height,
    });
    if (hit !== null) handleSceneClick(hit.panel, hit.sceneX, hit.sceneY);
  },
  onAction: handleAction,
});

if (shot !== null) {
  stageShot(shot, state);
  repaintScenes();
  renderer.draw(state, scenes, 1.2);
  requestAnimationFrame(() => {
    renderer.draw(state, scenes, 1.2);
    window.__shotReady = true;
  });
} else {
  prepareRound(state, 1);
  repaintScenes();
  let last = performance.now();
  let accumulator = 0;
  const frame = (now) => {
    const elapsed = Math.min(MAX_FRAME, (now - last) / 1000);
    last = now;
    accumulator += elapsed;
    const wasPlaying = state.screen === SCREEN_PLAY;
    while (accumulator >= STEP) {
      tick(state, STEP);
      accumulator -= STEP;
    }
    if (wasPlaying && state.screen === SCREEN_LOST) {
      audio.playLose();
      settleBest();
      announce('Time ran out. The round is lost.');
    }
    renderer.draw(state, scenes, now / 1000);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
