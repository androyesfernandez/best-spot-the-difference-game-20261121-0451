// The harbour itself: one dusk scene, drawn twice. renderSceneCanvas paints the whole
// picture into an offscreen canvas in the scene's own 560x500 space (at twice the size, so
// the stage stays crisp), once as the original and once as the altered picture. The only
// difference between the two passes is what the planted differences change: every planted
// difference id is looked up where its object is drawn, and the altered pass draws that
// object the other way. Everything else — the star field, the sea shimmer, the lit windows —
// comes from one fixed seed, so the two pictures match everywhere a difference is not.

import { SCENE } from './config.js';
import { createRandom } from './random.js';

const SKY_TOP = '#1b2145';
const SKY_MID = '#43305e';
const SKY_LOW = '#b85c38';
const SEA_TOP = '#31456e';
const SEA_LOW = '#1e2a4c';
const QUAY = '#3a3550';
const WOOD = '#8a5a33';
const WOOD_DARK = '#6b4a2f';

/** Round-rect path helper (older canvas implementations lack ctx.roundRect). */
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

function circle(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
}

/** The dusk sky, its stars and the moon — whole in the original, a crescent when planted. */
function drawSky(ctx, altered) {
  const sky = ctx.createLinearGradient(0, 0, 0, 302);
  sky.addColorStop(0, SKY_TOP);
  sky.addColorStop(0.55, SKY_MID);
  sky.addColorStop(1, SKY_LOW);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE.width, 302);

  const stars = createRandom(1123);
  ctx.fillStyle = '#f6ead2';
  for (let i = 0; i < 80; i += 1) {
    const x = stars.range(4, 556);
    const y = stars.range(4, 178);
    ctx.globalAlpha = stars.range(0.25, 0.9);
    circle(ctx, x, y, stars.range(0.7, 1.7));
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (altered('moon')) {
    // Crescent: the moon's disc with a bite taken out, drawn as an even-odd pair of circles.
    ctx.fillStyle = '#f3e9c8';
    ctx.beginPath();
    ctx.arc(72, 68, 24, 0, Math.PI * 2);
    ctx.arc(86, 60, 20, 0, Math.PI * 2);
    ctx.fill('evenodd');
  } else {
    ctx.fillStyle = '#f3e9c8';
    circle(ctx, 72, 68, 24);
    ctx.fill();
    ctx.fillStyle = '#ddd0a4';
    circle(ctx, 63, 60, 5);
    ctx.fill();
    circle(ctx, 80, 76, 4);
    ctx.fill();
    circle(ctx, 66, 80, 3);
    ctx.fill();
  }
}

/** Two gulls in the original sky; the altered picture grows a third, out at (356, 52). */
function drawGulls(ctx, altered) {
  ctx.strokeStyle = '#0f0d20';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  const gull = (x, y, size) => {
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.quadraticCurveTo(x - size * 0.4, y - size * 0.7, x, y);
    ctx.quadraticCurveTo(x + size * 0.4, y - size * 0.7, x + size, y);
    ctx.stroke();
  };
  gull(170, 58, 13);
  gull(232, 86, 10);
  if (altered('gull')) gull(356, 52, 11);
}

/** The sea: a gradient, a ladder of moon glitter and a scatter of shimmer strokes. */
function drawSea(ctx) {
  const sea = ctx.createLinearGradient(0, 300, 0, 386);
  sea.addColorStop(0, SEA_TOP);
  sea.addColorStop(1, SEA_LOW);
  ctx.fillStyle = sea;
  ctx.fillRect(0, 300, SCENE.width, 86);

  const shimmer = createRandom(777);
  ctx.strokeStyle = '#e8d9a8';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 26; i += 1) {
    const y = 306 + i * 3;
    const w = shimmer.range(6, 22);
    const x = 72 + shimmer.range(-26, 26) - w / 2;
    ctx.globalAlpha = shimmer.range(0.1, 0.4);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.stroke();
  }
  ctx.strokeStyle = '#8fb0d8';
  for (let i = 0; i < 34; i += 1) {
    const x = shimmer.range(10, 540);
    const y = shimmer.range(308, 378);
    ctx.globalAlpha = shimmer.range(0.08, 0.25);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + shimmer.range(8, 26), y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** One building window, lit amber or dark; the planted one is at B2's middle row. */
function drawWindow(ctx, x, y, lit) {
  ctx.fillStyle = lit ? '#ffc978' : '#221c36';
  roundedRect(ctx, x, y, 14, 16, 2);
  ctx.fill();
  ctx.strokeStyle = '#7a4b21';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 7, y);
  ctx.lineTo(x + 7, y + 16);
  ctx.moveTo(x, y + 8);
  ctx.lineTo(x + 14, y + 8);
  ctx.stroke();
}

/** The three waterfront buildings along the far shore, bases at the waterline. */
function drawBuildings(ctx, altered) {
  // B1: tall and narrow with a gable, leftmost.
  ctx.fillStyle = '#4a3350';
  ctx.fillRect(18, 196, 100, 110);
  ctx.fillStyle = '#33243c';
  ctx.beginPath();
  ctx.moveTo(10, 198);
  ctx.lineTo(68, 168);
  ctx.lineTo(126, 198);
  ctx.closePath();
  ctx.fill();
  for (const wx of [40, 80]) {
    for (const wy of [212, 242, 272]) drawWindow(ctx, wx, wy, !(wx === 80 && wy === 272));
  }
  ctx.fillStyle = '#2c1f33';
  roundedRect(ctx, 58, 276, 20, 30, 8);
  ctx.fill();

  // B2: wide, flat roof, chimney — its middle window of the middle row is the planted one.
  ctx.fillStyle = '#5b3a4c';
  ctx.fillRect(134, 182, 120, 124);
  ctx.fillStyle = '#402a38';
  ctx.fillRect(128, 172, 132, 12);
  ctx.fillRect(224, 148, 14, 26);
  ctx.strokeStyle = 'rgba(246,234,210,0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(231, 144);
  ctx.bezierCurveTo(222, 128, 240, 118, 232, 100);
  ctx.stroke();
  const cols = [152, 189, 226];
  const rows = [202, 236, 270];
  for (const wx of cols) {
    for (const wy of rows) {
      const planted = wx === 189 && wy === 236;
      drawWindow(ctx, wx, wy, planted ? !altered('window') : true);
    }
  }

  // B3: sloped roof and a hanging fish sign, rightmost of the row.
  ctx.fillStyle = '#40355e';
  ctx.fillRect(268, 206, 106, 100);
  ctx.fillStyle = '#2c2444';
  ctx.beginPath();
  ctx.moveTo(260, 208);
  ctx.lineTo(374, 208);
  ctx.lineTo(352, 188);
  ctx.lineTo(282, 188);
  ctx.closePath();
  ctx.fill();
  for (const wx of [292, 330]) {
    for (const wy of [224, 254]) drawWindow(ctx, wx, wy, true);
  }
  ctx.fillStyle = WOOD_DARK;
  ctx.fillRect(296, 282, 52, 16);
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.ellipse(322, 290, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(335, 290);
  ctx.lineTo(343, 285);
  ctx.lineTo(343, 295);
  ctx.closePath();
  ctx.fill();
}

/**
 * The lighthouse on its rocks, right of the harbour. Its lamp burns in the original and
 * throws a beam across the water; planted, the lamp is dark glass and the beam is gone.
 */
function drawLighthouse(ctx, altered) {
  ctx.fillStyle = '#241f38';
  ctx.beginPath();
  ctx.moveTo(446, 386);
  ctx.lineTo(470, 336);
  ctx.lineTo(500, 322);
  ctx.lineTo(534, 340);
  ctx.lineTo(556, 386);
  ctx.closePath();
  ctx.fill();

  const lit = !altered('lighthouse');
  if (lit) {
    ctx.fillStyle = 'rgba(255,214,120,0.10)';
    ctx.beginPath();
    ctx.moveTo(502, 140);
    ctx.lineTo(298, 312);
    ctx.lineTo(398, 330);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,214,120,0.08)';
    ctx.beginPath();
    ctx.moveTo(502, 140);
    ctx.lineTo(430, 96);
    ctx.lineTo(520, 84);
    ctx.closePath();
    ctx.fill();
  }

  // Tapered tower in bands.
  const bands = ['#e8e2d2', '#b8452f', '#e8e2d2', '#b8452f'];
  for (let i = 0; i < 4; i += 1) {
    const yTop = 168 + i * 42;
    const halfTop = 14 + i * 2.3;
    const halfBottom = 14 + (i + 1) * 2.3;
    ctx.fillStyle = bands[i];
    ctx.beginPath();
    ctx.moveTo(509 - halfTop, yTop);
    ctx.lineTo(509 + halfTop, yTop);
    ctx.lineTo(509 + halfBottom, yTop + 42);
    ctx.lineTo(509 - halfBottom, yTop + 42);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#2c2742';
  ctx.fillRect(488, 156, 42, 12);
  // Lamp room.
  if (lit) {
    const glow = ctx.createRadialGradient(509, 140, 2, 509, 140, 30);
    glow.addColorStop(0, 'rgba(255,224,138,0.85)');
    glow.addColorStop(1, 'rgba(255,224,138,0)');
    ctx.fillStyle = glow;
    circle(ctx, 509, 140, 30);
    ctx.fill();
    ctx.fillStyle = '#ffd970';
  } else {
    ctx.fillStyle = '#3a3f55';
  }
  roundedRect(ctx, 498, 130, 22, 20, 3);
  ctx.fill();
  ctx.strokeStyle = '#2c2742';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#2c2742';
  ctx.beginPath();
  ctx.moveTo(494, 130);
  ctx.lineTo(509, 114);
  ctx.lineTo(524, 130);
  ctx.closePath();
  ctx.fill();
}

/** The string of festoon lanterns sagging across the harbour front; one can go missing. */
function drawFestoon(ctx, altered) {
  const p0 = { x: 24, y: 124 };
  const pc = { x: 235, y: 152 };
  const p2 = { x: 446, y: 94 };
  const pointAt = (t) => ({
    x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * pc.x + t * t * p2.x,
    y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * pc.y + t * t * p2.y,
  });
  ctx.strokeStyle = '#0f0d20';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.quadraticCurveTo(pc.x, pc.y, p2.x, p2.y);
  ctx.stroke();

  const colours = ['#ffb84d', '#57d8c8', '#ff8fa3'];
  for (let i = 0; i < 9; i += 1) {
    const t = 0.06 + i * 0.11;
    const point = pointAt(t);
    const missing = altered('lantern') && i === 6;
    ctx.strokeStyle = '#0f0d20';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(point.x, point.y + 7);
    ctx.stroke();
    if (missing) continue;
    const colour = colours[i % colours.length];
    ctx.fillStyle = colour;
    ctx.globalAlpha = 0.16;
    circle(ctx, point.x, point.y + 14, 13);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = colour;
    roundedRect(ctx, point.x - 5, point.y + 7, 10, 13, 4);
    ctx.fill();
    ctx.fillStyle = '#0f0d20';
    ctx.fillRect(point.x - 3, point.y + 5, 6, 3);
  }
}

/** The stone quay the whole foreground stands on, with its paving joints and bollards. */
function drawQuay(ctx) {
  ctx.fillStyle = QUAY;
  ctx.fillRect(0, 384, SCENE.width, 116);
  ctx.fillStyle = '#574f73';
  ctx.fillRect(0, 384, SCENE.width, 5);
  ctx.strokeStyle = 'rgba(13,10,28,0.5)';
  ctx.lineWidth = 1.4;
  for (const y of [416, 448, 480]) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(SCENE.width, y);
    ctx.stroke();
  }
  for (let row = 0; row < 3; row += 1) {
    const yTop = 389 + row * 32;
    for (let x = (row % 2) * 40 + 30; x < SCENE.width; x += 82) {
      ctx.beginPath();
      ctx.moveTo(x, yTop);
      ctx.lineTo(x, yTop + 28);
      ctx.stroke();
    }
  }
  ctx.fillStyle = '#241f38';
  for (const x of [128, 262, 470]) {
    roundedRect(ctx, x, 378, 12, 18, 4);
    ctx.fill();
    ctx.fillStyle = '#574f73';
    ctx.fillRect(x - 2, 376, 16, 5);
    ctx.fillStyle = '#241f38';
  }
}

/** A striped market awning: posts, a sloped striped canopy and a hanging valance. */
function drawAwning(ctx, x, y, width, colourA, colourB) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 26);
  ctx.lineTo(x + width + 8, y + 26);
  ctx.lineTo(x + width - 4, y);
  ctx.lineTo(x + 4, y);
  ctx.closePath();
  ctx.clip();
  const stripe = 16;
  for (let sx = x - 8, i = 0; sx < x + width + 8; sx += stripe, i += 1) {
    ctx.fillStyle = i % 2 === 0 ? colourA : colourB;
    ctx.fillRect(sx, y - 2, stripe, 30);
  }
  ctx.restore();
  ctx.fillStyle = colourA;
  ctx.fillRect(x - 8, y + 26, width + 16, 6);
}

/** The fish stall, left foreground: awning, sign, counter of goods — and the harbour cat. */
function drawStall(ctx, altered) {
  ctx.fillStyle = WOOD_DARK;
  ctx.fillRect(58, 318, 6, 108);
  ctx.fillRect(202, 318, 6, 108);
  drawAwning(ctx, 56, 292, 152, '#2f8f83', '#f2e3c2');

  // The sign board on the valance: FRESH FISH, unless the planted difference eats a letter.
  ctx.fillStyle = '#7a4b21';
  roundedRect(ctx, 74, 322, 120, 24, 4);
  ctx.fill();
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = '#ffe9b0';
  ctx.font = '700 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(altered('sign') ? 'FRESH FSH' : 'FRESH FISH', 134, 335);

  // Counter and its goods: oranges to the left, fish on ice to the right.
  ctx.fillStyle = WOOD;
  ctx.fillRect(56, 398, 152, 30);
  ctx.strokeStyle = 'rgba(13,10,28,0.45)';
  ctx.lineWidth = 1.2;
  for (const y of [408, 418]) {
    ctx.beginPath();
    ctx.moveTo(56, y);
    ctx.lineTo(208, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#e8873a';
  for (const [x, y] of [[114, 394], [127, 394], [120, 385], [138, 390]]) {
    circle(ctx, x, y, 7);
    ctx.fill();
  }
  ctx.fillStyle = '#cfd8e6';
  roundedRect(ctx, 146, 388, 58, 10, 4);
  ctx.fill();
  ctx.fillStyle = '#9fb6cc';
  ctx.beginPath();
  ctx.ellipse(166, 390, 15, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(181, 390);
  ctx.lineTo(191, 384);
  ctx.lineTo(191, 396);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(188, 392, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // The cat's crate stands by the stall; the cat sits on it, unless planted away.
  ctx.fillStyle = WOOD;
  ctx.fillRect(74, 404, 42, 28);
  ctx.strokeStyle = WOOD_DARK;
  ctx.lineWidth = 2;
  ctx.strokeRect(74, 404, 42, 28);
  ctx.beginPath();
  ctx.moveTo(74, 418);
  ctx.lineTo(116, 418);
  ctx.stroke();
  if (!altered('cat')) drawCat(ctx, 95, 404);
}

/** The harbour cat, sitting upright: body, head, ears, a curled tail and amber eyes. */
function drawCat(ctx, x, baseY) {
  ctx.fillStyle = '#2b2542';
  ctx.beginPath();
  ctx.ellipse(x, baseY - 12, 11, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, x, baseY - 30, 8.5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 8, baseY - 35);
  ctx.lineTo(x - 5, baseY - 43);
  ctx.lineTo(x - 1, baseY - 37);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 8, baseY - 35);
  ctx.lineTo(x + 5, baseY - 43);
  ctx.lineTo(x + 1, baseY - 37);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2b2542';
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(x + 9, baseY - 3);
  ctx.quadraticCurveTo(x + 20, baseY - 2, x + 16, baseY - 12);
  ctx.stroke();
  ctx.fillStyle = '#ffb84d';
  circle(ctx, x - 3, baseY - 30, 1.4);
  ctx.fill();
  circle(ctx, x + 3, baseY - 30, 1.4);
  ctx.fill();
}

/**
 * The fisherman on the quay, rod out over the water. His catch hangs from the line in the
 * original; planted, the line comes up empty.
 */
function drawFisherman(ctx, altered) {
  // Rod and line first, so the man stands in front of his own tackle.
  ctx.strokeStyle = '#5a3d22';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(296, 410);
  ctx.lineTo(252, 336);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(246,234,210,0.75)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(252, 336);
  ctx.lineTo(258, 360);
  ctx.stroke();
  if (!altered('fish')) {
    ctx.fillStyle = '#b9c9d9';
    ctx.beginPath();
    ctx.ellipse(258, 368, 5, 11, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(261, 377);
    ctx.lineTo(268, 384);
    ctx.lineTo(256, 382);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#141126';
    circle(ctx, 256, 362, 1.3);
    ctx.fill();
  }
  // Legs, coat, head and hat.
  ctx.fillStyle = '#26303e';
  ctx.fillRect(291, 446, 7, 28);
  ctx.fillRect(304, 446, 7, 28);
  ctx.fillStyle = '#141126';
  ctx.fillRect(288, 472, 12, 5);
  ctx.fillRect(302, 472, 12, 5);
  ctx.fillStyle = '#33566e';
  roundedRect(ctx, 286, 402, 30, 48, 7);
  ctx.fill();
  ctx.strokeStyle = '#33566e';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(292, 414);
  ctx.lineTo(297, 409);
  ctx.stroke();
  ctx.fillStyle = '#e8b98d';
  circle(ctx, 301, 390, 10);
  ctx.fill();
  ctx.fillStyle = '#c99356';
  ctx.fillRect(289, 384, 24, 5);
  roundedRect(ctx, 292, 372, 18, 13, 4);
  ctx.fill();
}

/** The moored fishing boat: hull, cabin, mast and a pennant whose colour is plantable. */
function drawBoat(ctx, altered) {
  // Rigging behind the mast.
  ctx.strokeStyle = 'rgba(13,10,28,0.65)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(452, 240);
  ctx.lineTo(516, 366);
  ctx.moveTo(452, 240);
  ctx.lineTo(362, 364);
  ctx.stroke();
  // Hull.
  ctx.fillStyle = '#7a3f2c';
  ctx.beginPath();
  ctx.moveTo(352, 366);
  ctx.lineTo(522, 366);
  ctx.lineTo(508, 402);
  ctx.quadraticCurveTo(430, 414, 366, 402);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f2e3c2';
  ctx.fillRect(354, 372, 166, 6);
  ctx.fillStyle = '#241f38';
  for (const x of [392, 428, 464]) {
    circle(ctx, x, 390, 4.5);
    ctx.fill();
  }
  ctx.fillStyle = WOOD;
  ctx.fillRect(352, 360, 170, 7);
  // Cabin and mast.
  ctx.fillStyle = '#e0d6bd';
  roundedRect(ctx, 378, 330, 46, 32, 3);
  ctx.fill();
  ctx.fillStyle = '#31456e';
  ctx.fillRect(392, 338, 18, 14);
  ctx.fillStyle = WOOD_DARK;
  ctx.fillRect(449, 238, 5, 124);
  ctx.fillRect(449, 330, 74, 4);
  // Furled sail along the boom.
  ctx.fillStyle = '#d9c9a3';
  roundedRect(ctx, 452, 322, 68, 9, 4);
  ctx.fill();
  // The pennant: red in the original, blue when planted.
  ctx.fillStyle = altered('pennant') ? '#3c6fd8' : '#d8443c';
  ctx.beginPath();
  ctx.moveTo(454, 238);
  ctx.lineTo(488, 246);
  ctx.lineTo(454, 255);
  ctx.closePath();
  ctx.fill();
  // A rope coil and a lantern on deck.
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 2.2;
  for (const r of [7, 4.5]) {
    circle(ctx, 486, 354, r);
    ctx.stroke();
  }
  ctx.fillStyle = '#ffb84d';
  circle(ctx, 366, 350, 4);
  ctx.fill();
  // Reflection strokes under the hull.
  ctx.strokeStyle = '#8fb0d8';
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 2;
  for (const [x, w] of [[380, 40], [430, 54], [478, 30]]) {
    ctx.beginPath();
    ctx.moveTo(x, 420);
    ctx.lineTo(x + w, 420);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** Foreground props: the lamp post, barrels, the crate stack, the rope coil, the anchor. */
function drawProps(ctx, altered) {
  // Harbour lamp post, lit in both pictures.
  ctx.fillStyle = '#241f38';
  ctx.fillRect(345, 402, 6, 72);
  ctx.fillRect(338, 398, 20, 5);
  const glow = ctx.createRadialGradient(348, 388, 2, 348, 388, 24);
  glow.addColorStop(0, 'rgba(255,205,105,0.8)');
  glow.addColorStop(1, 'rgba(255,205,105,0)');
  ctx.fillStyle = glow;
  circle(ctx, 348, 388, 24);
  ctx.fill();
  ctx.fillStyle = '#ffcf69';
  roundedRect(ctx, 342, 380, 12, 15, 3);
  ctx.fill();

  // Two barrels by the boat.
  for (const x of [376, 404]) {
    ctx.fillStyle = WOOD;
    roundedRect(ctx, x, 442, 26, 34, 5);
    ctx.fill();
    ctx.strokeStyle = '#3a2a1c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 452);
    ctx.lineTo(x + 26, 452);
    ctx.moveTo(x, 466);
    ctx.lineTo(x + 26, 466);
    ctx.stroke();
  }

  // The crate stack: three crates in the original, two when planted.
  ctx.fillStyle = WOOD;
  ctx.fillRect(434, 448, 30, 28);
  ctx.fillRect(466, 448, 30, 28);
  ctx.strokeStyle = WOOD_DARK;
  ctx.lineWidth = 2;
  ctx.strokeRect(434, 448, 30, 28);
  ctx.strokeRect(466, 448, 30, 28);
  if (!altered('crates')) {
    ctx.fillStyle = WOOD;
    ctx.fillRect(450, 420, 30, 28);
    ctx.strokeStyle = WOOD_DARK;
    ctx.strokeRect(450, 420, 30, 28);
    ctx.beginPath();
    ctx.moveTo(450, 434);
    ctx.lineTo(480, 434);
    ctx.stroke();
  }

  // The rope coil: one spot on the quay in the original, shifted right when planted.
  const ropeX = altered('rope') ? 198 : 168;
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 3;
  for (const r of [13, 9, 5]) {
    ctx.beginPath();
    ctx.ellipse(ropeX + 14, 466, r + 4, r * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // The ship's anchor leaning by the left wall — gone when planted.
  if (!altered('anchor')) {
    ctx.strokeStyle = '#20242f';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(34, 428);
    ctx.lineTo(34, 470);
    ctx.moveTo(22, 438);
    ctx.lineTo(46, 438);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(34, 472, 13, Math.PI * 0.15, Math.PI * 0.85, false);
    ctx.stroke();
    ctx.fillStyle = '#20242f';
    ctx.beginPath();
    ctx.moveTo(19, 466);
    ctx.lineTo(25, 476);
    ctx.lineTo(13, 475);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(49, 466);
    ctx.lineTo(43, 476);
    ctx.lineTo(55, 475);
    ctx.closePath();
    ctx.fill();
    circle(ctx, 34, 426, 4);
    ctx.stroke();
  }
}

/**
 * Paint one whole picture. `variant` is 'original' or 'altered'; `activeIds` is the set of
 * difference ids this round planted. Returns a canvas of SCENE space at double resolution.
 */
export function renderSceneCanvas(variant, activeIds) {
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = SCENE.width * scale;
  canvas.height = SCENE.height * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  const altered = (id) => variant === 'altered' && activeIds.has(id);

  drawSky(ctx, altered);
  drawGulls(ctx, altered);
  drawSea(ctx);
  drawBuildings(ctx, altered);
  drawLighthouse(ctx, altered);
  drawFestoon(ctx, altered);
  drawQuay(ctx);
  drawStall(ctx, altered);
  drawFisherman(ctx, altered);
  drawBoat(ctx, altered);
  drawProps(ctx, altered);
  return canvas;
}
