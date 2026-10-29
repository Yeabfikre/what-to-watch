# How it moves, step by step

Every animation and behaviour found on the page, as recipes: what starts it, which element, which property from what to what, for how long, on which curve, in what order. Times are from the moment the trigger happens. Build them one at a time and check each against its film (frames captioned with their time, or with the scroll position).

Measured at 1440 px on phonofilm.cc. Values in `code` are exactly as the browser reported them.

## The page's motion language

- **Curves:** `ease-in-out` (90×), `linear` (3×).
- **Durations:** 2550 ms, 2630 ms, 2710 ms, 2720 ms, 2750 ms, 2760 ms, 2900 ms, 2970 ms, 3010 ms, 3020 ms, 3080 ms, 3090 ms.

## Moving scenes (filmed)

### 1. Loop: svelte-11l4lgh-shooting

- **Film:** `reference/motion/films/01-loop-div.jpg` (captions are ms).
- **Element:** `div#pf-app > div.relative.flex:nth-of-type(1) > div.pointer-events-none.fixed:nth-of-type(1)` in section `01-div`.

## CSS animations (rules and @keyframes in styles.css)

- `div#pf-app > div.relative.flex:nth-of-type(1) > div.pointer-events-none.fixed:nth-of-type(1) > span.star.svelte-11l4lgh:nth-of-type(1)`: `svelte-11l4lgh-star-twinkle` 4.93s `ease-in-out` infinite, delay -4.88s.
- `div#pf-app > div.relative.flex:nth-of-type(1) > div.pointer-events-none.fixed:nth-of-type(1) > span.star.svelte-11l4lgh:nth-of-type(2)`: `svelte-11l4lgh-star-twinkle` 6.42s `ease-in-out` infinite, delay -2.39s.
- `div#pf-app > div.relative.flex:nth-of-type(1) > div.pointer-events-none.fixed:nth-of-type(1) > span.star.svelte-11l4lgh:nth-of-type(3)`: `svelte-11l4lgh-star-twinkle` 3.15s `ease-in-out` infinite, delay -3.21s.
- `div#pf-app > div.relative.flex:nth-of-type(1) > div.pointer-events-none.fixed:nth-of-type(1) > span.star.svelte-11l4lgh:nth-of-type(4)`: `svelte-11l4lgh-star-twinkle` 2.63s `ease-in-out` infinite, delay -3.57s.
- `div#pf-app > div.relative.flex:nth-of-type(1) > div.pointer-events-none.fixed:nth-of-type(1) > span.star.svelte-11l4lgh:nth-of-type(5)`: `svelte-11l4lgh-star-twinkle` 3.79s `ease-in-out` infinite, delay -1.48s.
- `div#pf-app > div.relative.flex:nth-of-type(1) > div.pointer-events-none.fixed:nth-of-type(1) > span.star.svelte-11l4lgh:nth-of-type(6)`: `svelte-11l4lgh-star-twinkle` 5.18s `ease-in-out` infinite, delay -3.08s.
- `div#pf-app > div.relative.flex:nth-of-type(1) > div.pointer-events-none.fixed:nth-of-type(1) > span.star.svelte-11l4lgh:nth-of-type(7)`: `svelte-11l4lgh-star-twinkle` 5.36s `ease-in-out` infinite, delay -1.82s.
- `div#pf-app > div.relative.flex:nth-of-type(1) > div.pointer-events-none.fixed:nth-of-type(1) > span.star.svelte-11l4lgh:nth-of-type(8)`: `svelte-11l4lgh-star-twinkle` 6.77s `ease-in-out` infinite, delay -0.76s.
- `div#pf-app > div.relative.flex:nth-of-type(1) > div.pointer-events-none.fixed:nth-of-type(1) > span.star.svelte-11l4lgh:nth-of-type(9)`: `svelte-11l4lgh-star-twinkle` 3.74s `ease-in-out` infinite, delay -5.96s.
- `div#pf-app > div.relative.flex:nth-of-type(1) > div.pointer-events-none.fixed:nth-of-type(1) > span.star.svelte-11l4lgh:nth-of-type(10)`: `svelte-11l4lgh-star-twinkle` 4.5s `ease-in-out` infinite, delay -1.05s.
- `div#pf-app > div.relative.flex:nth-of-type(1) > div.pointer-events-none.fixed:nth-of-type(1) > span.star.svelte-11l4lgh:nth-of-type(11)`: `svelte-11l4lgh-star-twinkle` 4.62s `ease-in-out` infinite, delay -2.18s.
- `div#pf-app > div.relative.flex:nth-of-type(1) > div.pointer-events-none.fixed:nth-of-type(1) > span.star.svelte-11l4lgh:nth-of-type(12)`: `svelte-11l4lgh-star-twinkle` 2.76s `ease-in-out` infinite, delay -5.47s.

## The page's own code

The scripts the page ran are in `reference/scripts/` (5 files), so you can read exactly how each effect is made. Don't paste them in whole: rebuild each effect in the project's own code, following the recipe and the source together.

Not tried: navigation: cdpSession.send: Target page, context or browser has been closed; menu: skipped, out of time; clicks: skipped, out of time.
