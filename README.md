# best-spot-the-difference-game-20261121-0451

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/androyesfernandez/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/androyesfernandez/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Lantern Harbour** — a spot-the-difference game on a harbour at dusk, drawn entirely in
canvas 2D: a fish stall and its cat, a fisherman, a moored boat, a lighthouse and a string
of festoon lanterns, painted twice. Each round plants 10 of a catalogue of 12 differences
(a crescent moon, a dark lighthouse lamp, a missing festoon lantern, a pennant that changes
colour, a stall sign that loses a letter, an extra gull…) and gives you five minutes to find
them all. Click a difference in either picture and it is ringed in both; a find pays 100
points, a misclick costs 25 and shakes the picture, a hint costs 50 and rings one difference
for you, and clearing the harbour banks a bonus for every second left. Every round deals a
fresh set, so the hunt is never the same twice.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

Any static file server pointed at `game/` works just as well — the game is plain HTML and
ES modules with no build step and no network calls. Hand the entry in with
`mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=ktpzxevq&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
