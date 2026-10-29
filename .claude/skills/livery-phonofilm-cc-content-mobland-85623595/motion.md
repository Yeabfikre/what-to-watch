# Motion and Interactions

Considered transitions, with signature motion that carries the personality: rotating list.

- Default to 130ms transitions (64% of measured ones).
- Ease with ease.
- Animate opacity, transform, filter, color; avoid animating layout.
- Stagger repeated items: rotating list starts each one 40ms after the last.
- Looping motion is slow and steady (several seconds per cycle), never frantic.
- Turn every loop and decorative animation off under prefers-reduced-motion, as the site does.

## Signature motion

The animations that make this site feel like itself. Recreate the behaviour with your own elements and content; the keyframes are the measured reference.

### Rotating list

93 items take turns: each fades and rises in, holds, then leaves, looping every 4.9s, staggered 40ms apart. It runs on its own, on list items.

```css
@keyframes svelte-11l4lgh-star-twinkle { 0%, 100% { opacity: calc(var(--o, .5) * .3); transform: scale(0.85); } 50% { opacity: var(--o, .5); transform: scale(1); } }
.svelte-11l4lgh-star-twinkle { animation: svelte-11l4lgh-star-twinkle 4930ms ease-in-out infinite; /* + 40ms delay per item */ }
```

## Interactions

- **Hover** changes background colour (53% of hover rules), border (18% of hover rules), text colour (13% of hover rules), position or scale (8% of hover rules), opacity (3% of hover rules), shadow (2% of hover rules). Things rarely move on hover; they change colour.

Animations started by people or state:

- `swipe-out-left`: enter, 0ms ease, starts when its state changes (opened, selected, shown).
- `swipe-out-right`: enter, 0ms ease, starts when its state changes (opened, selected, shown).
- `swipe-out-up`: enter, 0ms ease, starts when its state changes (opened, selected, shown).
- `swipe-out-down`: enter, 0ms ease, starts when its state changes (opened, selected, shown).
- `sonner-fade-in`: enter, 300ms ease, starts when its state changes (opened, selected, shown).
- `sonner-fade-out`: enter, 200ms ease, starts when its state changes (opened, selected, shown).

## Measurements

- Durations: 130ms (64%), 150ms (24%), 300ms (6%), 500ms (4%), 200ms (0%)
- Easings: `ease`, `cubic-bezier(0.4, 0, 0.2, 1)`, `cubic-bezier(0.22, 0.61, 0.36, 1)`
- Animated properties: opacity, transform, filter, color, background-color, border-color, outline-color, text-decoration-color

The site turns its motion off under `prefers-reduced-motion: reduce`. Do the same: every looping or decorative animation stops, and state changes happen instantly.
