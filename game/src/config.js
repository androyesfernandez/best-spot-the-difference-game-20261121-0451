// Lantern Harbour's fixed measurements and scoring rules. Everything visual derives from these
// numbers: the window is a 1280x720 stage, each harbour picture is drawn once into a 560x500
// scene and placed twice, and a round is a five-minute hunt for ten planted differences.

/** The stage the whole game is composed on, in CSS pixels. */
export const STAGE = { width: 1280, height: 720 };

/** One harbour picture's own coordinate space: the scene modules draw in these units. */
export const SCENE = { width: 560, height: 500 };

/** Where the two pictures sit on the stage. */
export const PANEL = {
  top: 118,
  gap: 52,
  leftX: 52,
  rightX: 668,
  labelY: 96,
};

/** The heads-up strip above the pictures. */
export const HUD = { top: 14, height: 58 };

/** The found-list strip below the pictures. */
export const FOUND_STRIP = { top: 632, height: 40 };

/** Seconds on the clock each round; the last thirty burn amber, the last ten red. */
export const ROUND_SECONDS = 300;

/** How many of the catalogue's differences a round plants. */
export const DIFFERENCES_PER_ROUND = 10;

/** Scoring: a find pays, a misclick and a hint cost, and leftover time pays on a clear. */
export const SCORE = {
  find: 100,
  mistake: 25,
  hint: 50,
  secondLeft: 1,
};

/** localStorage key for the best score this browser has seen. */
export const BEST_KEY = 'lantern-harbour-best';

/** The dusk palette both pictures share, so a difference is never just "the other sky". */
export const PALETTE = {
  ink: '#141126',
  panelEdge: '#0d0a1c',
  gold: '#ffd94d',
  cream: '#f6ead2',
  dim: '#9a8fb8',
  good: '#7fe0a8',
  bad: '#ff7a6b',
};
