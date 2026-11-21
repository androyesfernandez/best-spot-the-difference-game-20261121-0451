// The renderer: paints the state onto the one stage canvas. It draws the heads-up strip
// (the big remaining counter, the clock, the score, the hint and new-round buttons), the two
// pictures side by side with their labels, a marker ring on both pictures for every find,
// the found-list strip ticking up underneath, and the title, cleared and lost cards over
// the top. It never changes the state; main.js hands it the state and the two scene canvases.

import { FOUND_STRIP, HUD, PALETTE, PANEL, ROUND_SECONDS, SCENE, STAGE } from './config.js';
import { remainingCount, SCREEN_LOST, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WON } from './state.js';

const FONT_DISPLAY = 'Georgia, "Times New Roman", serif';
const FONT_UI = 'system-ui, "Segoe UI", sans-serif';

/** The two clickable HUD buttons, shared with input.js so a click lands where the eye sees. */
export function hudButtons() {
  return [
    { id: 'hint', x: 1042, y: 20, width: 78, height: 44, label: 'HINT' },
    { id: 'restart', x: 1130, y: 20, width: 114, height: 44, label: 'NEW ROUND' },
  ];
}

/** Seconds as m:ss, the clock's only format. */
export function formatClock(totalSeconds) {
  const whole = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(whole / 60);
  const seconds = whole % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** An integer with thousands commas, written by hand so a screenshot never depends on locale. */
export function formatScore(value) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function pill(x, y, width, height, fill) {
    ctx.fillStyle = fill;
    roundedRect(ctx, x, y, width, height, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(246,234,210,0.16)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawHud(state) {
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.gold;
    ctx.font = `700 21px ${FONT_DISPLAY}`;
    ctx.fillText('LANTERN HARBOUR', 36, HUD.top + 16);
    ctx.fillStyle = PALETTE.dim;
    ctx.font = `600 10.5px ${FONT_UI}`;
    ctx.fillText('S P O T   T H E   D I F F E R E N C E', 37, HUD.top + 40);

    // The counter: the number the whole game turns on, big at the centre.
    pill(525, 20, 230, 44, '#241d42');
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.cream;
    ctx.font = `800 24px ${FONT_UI}`;
    const left = remainingCount(state);
    ctx.fillText(state.screen === SCREEN_TITLE ? '10 TO FIND' : `${left} TO FIND`, 640, 43);

    // The clock, burning amber then red as the round runs out.
    pill(790, 20, 100, 44, '#241d42');
    ctx.fillStyle = state.timeLeft <= 10 ? PALETTE.bad : state.timeLeft <= 30 ? '#ff9f43' : PALETTE.cream;
    ctx.font = `700 21px ${FONT_UI}`;
    ctx.fillText(formatClock(state.timeLeft), 840, 43);

    pill(900, 20, 132, 44, '#241d42');
    ctx.fillStyle = PALETTE.dim;
    ctx.font = `600 9.5px ${FONT_UI}`;
    ctx.fillText('SCORE', 966, 31);
    ctx.fillStyle = PALETTE.gold;
    ctx.font = `700 19px ${FONT_UI}`;
    ctx.fillText(formatScore(state.score), 966, 50);

    if (state.screen === SCREEN_PLAY) {
      for (const button of hudButtons()) {
        ctx.fillStyle = '#2f8f83';
        roundedRect(ctx, button.x, button.y, button.width, button.height, 10);
        ctx.fill();
        ctx.fillStyle = PALETTE.cream;
        ctx.font = `700 14px ${FONT_UI}`;
        ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2 + 1);
      }
    }
    ctx.textAlign = 'left';

    // The time bar under the strip: what is left of the round, draining left to right.
    const fraction = Math.max(0, state.timeLeft / ROUND_SECONDS);
    ctx.fillStyle = 'rgba(246,234,210,0.12)';
    roundedRect(ctx, 36, 78, 1208, 6, 3);
    ctx.fill();
    ctx.fillStyle = state.timeLeft <= 10 ? PALETTE.bad : state.timeLeft <= 30 ? '#ff9f43' : PALETTE.gold;
    if (fraction > 0) {
      roundedRect(ctx, 36, 78, 1208 * fraction, 6, 3);
      ctx.fill();
    }
  }

  function drawPanelLabels(state) {
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = `700 15px ${FONT_UI}`;
    ctx.fillStyle = PALETTE.cream;
    ctx.fillText('PICTURE A', PANEL.leftX, PANEL.labelY);
    ctx.fillStyle = PALETTE.dim;
    ctx.font = `500 13px ${FONT_UI}`;
    ctx.fillText('— the original harbour', PANEL.leftX + 92, PANEL.labelY + 1);
    ctx.fillStyle = PALETTE.cream;
    ctx.font = `700 15px ${FONT_UI}`;
    ctx.fillText('PICTURE B', PANEL.rightX, PANEL.labelY);
    ctx.fillStyle = PALETTE.dim;
    ctx.font = `500 13px ${FONT_UI}`;
    ctx.fillText('— ten things are different', PANEL.rightX + 92, PANEL.labelY + 1);
    ctx.textAlign = 'right';
    ctx.fillStyle = PALETTE.dim;
    ctx.font = `600 13px ${FONT_UI}`;
    ctx.fillText(state.round > 0 ? `ROUND ${state.round}` : '', 1228, PANEL.labelY + 1);
    ctx.textAlign = 'left';
  }

  function panelShake(state, panel) {
    if (state.miss === null || state.miss.panel !== panel) return 0;
    const age = state.time - state.miss.at;
    if (age < 0 || age > 0.45) return 0;
    return Math.sin(age * 46) * 4.5 * (1 - age / 0.45);
  }

  function drawMarker(x, y, radius, pulse) {
    const r = radius * (1 + pulse * 0.25);
    ctx.save();
    ctx.strokeStyle = 'rgba(20,17,38,0.55)';
    ctx.lineWidth = 6.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x, y, r - 3.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawPanels(state, scenes) {
    const panels = [
      { key: 'A', x: PANEL.leftX, scene: scenes.original },
      { key: 'B', x: PANEL.rightX, scene: scenes.altered },
    ];
    for (const panel of panels) {
      const dx = panelShake(state, panel.key);
      ctx.save();
      ctx.translate(dx, 0);
      ctx.fillStyle = PALETTE.panelEdge;
      ctx.fillRect(panel.x - 4, PANEL.top - 4, SCENE.width + 8, SCENE.height + 8);
      ctx.drawImage(panel.scene, panel.x, PANEL.top, SCENE.width, SCENE.height);
      ctx.strokeStyle = 'rgba(246,234,210,0.25)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(panel.x - 4, PANEL.top - 4, SCENE.width + 8, SCENE.height + 8);

      for (const difference of state.active) {
        if (!state.found.has(difference.id)) continue;
        const fresh = difference.id === state.lastFindId ? Math.max(0, 1 - (state.time - state.lastFindAt) / 0.7) : 0;
        drawMarker(panel.x + difference.x, PANEL.top + difference.y, Math.max(15, difference.radius * 0.66), fresh);
      }

      // The hint ring: a dashed teal circle breathing around the hinted difference.
      if (state.hintId !== null && state.time < state.hintUntil) {
        const target = state.active.find((difference) => difference.id === state.hintId);
        if (target) {
          const breathe = 0.5 + 0.5 * Math.sin(state.time * 9);
          ctx.save();
          ctx.strokeStyle = '#57d8c8';
          ctx.lineWidth = 3;
          ctx.setLineDash([7, 6]);
          ctx.beginPath();
          ctx.arc(panel.x + target.x, PANEL.top + target.y, target.radius + 3 + breathe * 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // A fresh mistake: a red cross that fades where the click landed.
      if (state.miss !== null && state.miss.panel === panel.key) {
        const age = state.time - state.miss.at;
        if (age >= 0 && age < 0.6) {
          const mx = panel.x + state.miss.x;
          const my = PANEL.top + state.miss.y;
          ctx.save();
          ctx.globalAlpha = 1 - age / 0.6;
          ctx.strokeStyle = PALETTE.bad;
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(mx - 10, my - 10);
          ctx.lineTo(mx + 10, my + 10);
          ctx.moveTo(mx + 10, my - 10);
          ctx.lineTo(mx - 10, my + 10);
          ctx.stroke();
          ctx.restore();
        }
      }
      ctx.restore();
    }
  }

  function drawFoundStrip(state) {
    const y = FOUND_STRIP.top;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.dim;
    ctx.font = `700 12px ${FONT_UI}`;
    ctx.fillText('FOUND', 36, y + 20);
    let x = 96;
    if (state.found.size === 0) {
      ctx.fillStyle = PALETTE.dim;
      ctx.font = `500 14px ${FONT_UI}`;
      ctx.fillText('Click a difference in either picture — a find marks both at once.', x, y + 20);
    }
    // The chips shrink step by step when a full set of ten would run off the strip's edge.
    const foundList = state.active.filter((difference) => state.found.has(difference.id));
    const chipWidth = (label, size) => {
      ctx.font = `600 ${size}px ${FONT_UI}`;
      return ctx.measureText(label).width + 22;
    };
    let chipFont = 13;
    let totalWidth = foundList.reduce((sum, difference) => sum + chipWidth(`✓ ${difference.name}`, chipFont) + 8, 0);
    while (totalWidth > 1244 - 96 && chipFont > 10) {
      chipFont -= 0.5;
      totalWidth = foundList.reduce((sum, difference) => sum + chipWidth(`✓ ${difference.name}`, chipFont) + 8, 0);
    }
    ctx.font = `600 ${chipFont}px ${FONT_UI}`;
    for (const difference of foundList) {
      const label = `✓ ${difference.name}`;
      const width = ctx.measureText(label).width + 22;
      ctx.fillStyle = 'rgba(255,217,77,0.14)';
      roundedRect(ctx, x, y + 4, width, 32, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,217,77,0.55)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = PALETTE.gold;
      ctx.fillText(label, x + 11, y + 21);
      x += width + 8;
    }
    const left = remainingCount(state);
    if (x < 1090) {
      ctx.textAlign = 'right';
      ctx.fillStyle = PALETTE.dim;
      ctx.font = `600 13px ${FONT_UI}`;
      ctx.fillText(left > 0 ? `${left} still hiding` : 'none left hiding', 1244, y + 20);
      ctx.textAlign = 'left';
    }
    ctx.fillStyle = 'rgba(154,143,184,0.8)';
    ctx.font = `500 12px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.fillText('Click a difference in either picture  ·  H — hint (−50)  ·  R — new round', 640, 700);
    ctx.textAlign = 'left';
  }

  function dimStage(alpha) {
    ctx.fillStyle = `rgba(13,10,28,${alpha})`;
    ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  }

  function card(width, height) {
    const x = (STAGE.width - width) / 2;
    const y = (STAGE.height - height) / 2;
    ctx.fillStyle = '#1d1836';
    roundedRect(ctx, x, y, width, height, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,217,77,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    return { x, y };
  }

  function drawTitle(state, scenes, pulse) {
    // The harbour itself, blown up to fill the stage, under a dusk-dimmed card of text.
    const scene = scenes.original;
    const scale = Math.max(STAGE.width / scene.width, STAGE.height / scene.height);
    const dw = scene.width * scale;
    const dh = scene.height * scale;
    ctx.drawImage(scene, (STAGE.width - dw) / 2, (STAGE.height - dh) / 2, dw, dh);
    dimStage(0.6);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = PALETTE.gold;
    ctx.font = `700 63px ${FONT_DISPLAY}`;
    ctx.fillText('LANTERN HARBOUR', 640, 218);
    ctx.strokeStyle = 'rgba(255,217,77,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(440, 262);
    ctx.lineTo(840, 262);
    ctx.stroke();
    ctx.fillStyle = PALETTE.cream;
    ctx.font = `500 21px ${FONT_UI}`;
    ctx.fillText('A spot-the-difference hunt on a harbour at dusk', 640, 296);
    ctx.font = `500 17px ${FONT_UI}`;
    ctx.fillStyle = '#cfc4e8';
    ctx.fillText('Two pictures of the same harbour. Ten differences hide in the second.', 640, 356);
    ctx.fillText('Click a difference in either picture to mark it in both — before the five minutes run out.', 640, 386);
    ctx.fillText('A find pays 100. A misclick costs 25. A hint costs 50 and rings one for you.', 640, 416);
    if (state.best > 0) {
      ctx.fillStyle = PALETTE.gold;
      ctx.font = `700 17px ${FONT_UI}`;
      ctx.fillText(`Best score so far: ${formatScore(state.best)}`, 640, 470);
    }
    const blink = 0.55 + 0.45 * Math.sin(pulse * 2.4);
    ctx.globalAlpha = blink;
    ctx.fillStyle = PALETTE.cream;
    ctx.font = `700 19px ${FONT_UI}`;
    ctx.fillText('Click anywhere, or press Enter, to start the hunt', 640, 540);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  function drawEndCard(state) {
    dimStage(0.55);
    const { x, y } = card(560, 320);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (state.screen === SCREEN_WON && state.win !== null) {
      ctx.fillStyle = PALETTE.gold;
      ctx.font = `700 40px ${FONT_DISPLAY}`;
      ctx.fillText('HARBOUR CLEARED!', 640, y + 62);
      ctx.fillStyle = PALETTE.cream;
      ctx.font = `500 18px ${FONT_UI}`;
      const used = formatClock(state.win.timeUsed);
      ctx.fillText(`Round ${state.win.round}: all ${state.active.length} differences found in ${used}`, 640, y + 122);
      ctx.fillText(`Mistakes: ${state.win.mistakes}   ·   Time bonus: +${formatScore(state.win.bonus)}`, 640, y + 156);
      ctx.fillStyle = PALETTE.gold;
      ctx.font = `800 27px ${FONT_UI}`;
      ctx.fillText(`Score ${formatScore(state.win.score)}`, 640, y + 205);
      ctx.fillStyle = '#cfc4e8';
      ctx.font = `600 16px ${FONT_UI}`;
      ctx.fillText('Press Enter for the next round — a fresh set of differences', 640, y + 262);
    } else {
      ctx.fillStyle = PALETTE.bad;
      ctx.font = `700 40px ${FONT_DISPLAY}`;
      ctx.fillText('THE TIDE CAME IN', 640, y + 62);
      ctx.fillStyle = PALETTE.cream;
      ctx.font = `500 18px ${FONT_UI}`;
      ctx.fillText(`Time ran out with ${remainingCount(state)} of ${state.active.length} differences still hiding.`, 640, y + 122);
      ctx.fillText(`You found ${state.found.size} and scored ${formatScore(state.score)}.`, 640, y + 156);
      ctx.fillStyle = '#cfc4e8';
      ctx.font = `600 16px ${FONT_UI}`;
      ctx.fillText('Press Enter to play the round again', 640, y + 262);
    }
    ctx.textAlign = 'left';
  }

  /** Paint one frame. `pulse` is wall-clock seconds, driving only the title's blink. */
  function draw(state, scenes, pulse) {
    ctx.fillStyle = PALETTE.ink;
    ctx.fillRect(0, 0, STAGE.width, STAGE.height);
    if (state.screen === SCREEN_TITLE) {
      drawTitle(state, scenes, pulse);
      return;
    }
    drawHud(state);
    drawPanelLabels(state);
    drawPanels(state, scenes);
    drawFoundStrip(state);
    if (state.screen === SCREEN_WON || state.screen === SCREEN_LOST) drawEndCard(state);
  }

  return { draw };
}
