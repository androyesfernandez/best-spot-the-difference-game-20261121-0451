// Pointer and keyboard input, translated into stage coordinates and named actions. The
// canvas fills the window, so a pointer position is scaled from the element's box onto the
// 1280x720 stage; main.js decides what a stage click means (a HUD button, a picture, or a
// card's "go on"). Keys: Enter or Space confirms, H asks for a hint, R starts a new round.

import { STAGE } from './config.js';

export const ACTION_CONFIRM = 'confirm';
export const ACTION_HINT = 'hint';
export const ACTION_RESTART = 'restart';

/**
 * Wire the canvas and window to `handlers`: onStageClick(x, y) for pointer presses in stage
 * coordinates, onAction(name) for the named key actions.
 */
export function createInput(canvas, handlers) {
  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = ((event.clientX - rect.left) / rect.width) * STAGE.width;
    const y = ((event.clientY - rect.top) / rect.height) * STAGE.height;
    handlers.onStageClick(x, y);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handlers.onAction(ACTION_CONFIRM);
    } else if (event.key === 'h' || event.key === 'H') {
      handlers.onAction(ACTION_HINT);
    } else if (event.key === 'r' || event.key === 'R') {
      handlers.onAction(ACTION_RESTART);
    }
  });
}

/** Which panel a stage point falls in, and its scene coordinates there; null outside both. */
export function panelAt(stageX, stageY, panelLayout) {
  const { top, leftX, rightX, sceneWidth, sceneHeight } = panelLayout;
  if (stageY < top || stageY > top + sceneHeight) return null;
  if (stageX >= leftX && stageX <= leftX + sceneWidth) {
    return { panel: 'A', sceneX: stageX - leftX, sceneY: stageY - top };
  }
  if (stageX >= rightX && stageX <= rightX + sceneWidth) {
    return { panel: 'B', sceneX: stageX - rightX, sceneY: stageY - top };
  }
  return null;
}

/** The HUD button a stage point falls in, or null; `buttons` comes from render.js. */
export function buttonAt(stageX, stageY, buttons) {
  for (const button of buttons) {
    if (stageX >= button.x && stageX <= button.x + button.width && stageY >= button.y && stageY <= button.y + button.height) {
      return button;
    }
  }
  return null;
}
