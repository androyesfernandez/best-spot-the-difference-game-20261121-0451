// The catalogue of differences Lantern Harbour can plant. Each entry names the thing that
// changes, gives the words the found-list shows once it is spotted, and fixes the anchor a
// click must land near: x and y in the scene's own 560x500 space (see scene.js, which draws
// the original and the altered picture from this same list) and a generous radius around it,
// so a fair click counts and a sloppy one does not. A round plants DIFFERENCES_PER_ROUND of
// the twelve, picked by the round's seed, so the hunt is never the same twice in a row.

import { DIFFERENCES_PER_ROUND } from './config.js';

export const DIFFERENCES = [
  { id: 'moon', name: 'Crescent moon', x: 72, y: 68, radius: 34 },
  { id: 'gull', name: 'An extra gull', x: 356, y: 52, radius: 22 },
  { id: 'lantern', name: 'Festoon lantern', x: 328, y: 130, radius: 21 },
  { id: 'lighthouse', name: 'Lighthouse lamp', x: 509, y: 140, radius: 26 },
  { id: 'window', name: 'A dark window', x: 196, y: 240, radius: 18 },
  { id: 'pennant', name: 'Pennant colour', x: 463, y: 240, radius: 23 },
  { id: 'sign', name: 'Sign lettering', x: 134, y: 334, radius: 40 },
  { id: 'fish', name: 'The caught fish', x: 258, y: 364, radius: 19 },
  { id: 'cat', name: 'The harbour cat', x: 95, y: 390, radius: 27 },
  { id: 'crates', name: 'Crate stack', x: 462, y: 444, radius: 31 },
  { id: 'rope', name: 'Rope coil moved', x: 182, y: 466, radius: 31 },
  { id: 'anchor', name: "Ship's anchor", x: 34, y: 456, radius: 25 },
];

/** Look a difference up by id; the scene painter and the state both speak in ids. */
export function differenceById(id) {
  return DIFFERENCES.find((difference) => difference.id === id);
}

/**
 * Pick the differences one round plants: the round number salts the seed, the seeded shuffle
 * deals the catalogue, and the first DIFFERENCES_PER_ROUND of the deal are the round's set,
 * kept in catalogue order so the found-list reads steadily as finds come in.
 */
export function pickRoundDifferences(random, round) {
  const salted = random.shuffled(DIFFERENCES.map((difference) => difference.id));
  const chosen = new Set(salted.slice(0, DIFFERENCES_PER_ROUND));
  return DIFFERENCES.filter((difference) => chosen.has(difference.id));
}
