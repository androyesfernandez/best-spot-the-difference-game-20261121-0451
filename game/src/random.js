// A small seeded random generator (mulberry32). A round's differences and the harbour's star
// field both come from one of these, so a seed always grows the same harbour: the staged
// screenshot scenes and a replayed round are identical every time they are asked for.

/** Create a generator whose sequence depends only on `seed`. */
export function createRandom(seed) {
  let state = seed >>> 0;
  function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return {
    next,
    /** A float in [min, max). */
    range(min, max) {
      return min + next() * (max - min);
    },
    /** An integer in [min, max], both ends included. */
    int(min, max) {
      return min + Math.floor(next() * (max - min + 1));
    },
    /** A shuffled copy of `items` (Fisher-Yates on this generator's sequence). */
    shuffled(items) {
      const copy = items.slice();
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(next() * (i + 1));
        const hold = copy[i];
        copy[i] = copy[j];
        copy[j] = hold;
      }
      return copy;
    },
  };
}
