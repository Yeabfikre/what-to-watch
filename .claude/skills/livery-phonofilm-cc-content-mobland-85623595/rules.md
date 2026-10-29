# phonofilm.cc: design rules

A dark interface on a near-black neutral background where an amber accent marks the next step. Type is Lufga set tight at large sizes, corners are fully rounded on controls, and depth comes from soft neutral shadows.

## Principles

### Soft, neutral depth

Lift raised elements with the measured shadow (rgba(0, 0, 0, 0.34) 0px 8px 20px 0px).

_Why:_ Shadows appear on about 29% of elements; they mark what floats above the page and are never tinted.

### Big type, quiet body

Pair 48px headings in Lufga with 13px body text in Geist Mono Variable.

_Why:_ A 3.7× jump between headline and body creates strong hierarchy with few elements.

### Rounded and approachable

Use pill shapes for buttons and chips, and 16px corners for containers.

_Why:_ Fully rounded shapes make up 76% of measured radii; they soften an otherwise structured page.

## Never

- **Never tint shadows with colour.** Every measured shadow is neutral; a coloured glow would read as a different product.
- **Never introduce a second accent colour.** Only one saturated colour (#e8a13a) carries weight in the measured palette.
- **Never use positive letter-spacing on headings.** Large type is tightened, down to -0.025em on the biggest sizes.
- **Never square off buttons.** Measured buttons are fully rounded; square ones would break the shape language.
- **Never set button labels in all capitals.** No measured button uses uppercase text.

## Colour

- Dark theme: near-black neutral background (#0e0e0d) with #000000 surfaces.
- Body text #f5f2ea on the background reads at 17.3:1; secondary text uses #b7b7b6.
- Accent #e8a13a (amber) with #0e0e0d text on top of it.

## Typography

- Lufga for headings, Geist Mono Variable for body.
- Scale: display 48px, h1 36px, h2 32px, h3 20px, h4 18px, h5 16px, h6 14px.
- Weights in use: 400, 500, 600.
- Headings are tightened (-0.025em at 48px); body text keeps normal tracking.

## Shape and depth

- Radii: 1px (5%), 2px (2%), 16px (7%), 24px (6%), pill (76%).
- Borders: 1px in #2e2a26.
- Shadows: rgba(0, 0, 0, 0.34) 0px 8px 20px 0px | oklab(0.287885 0.00356318 0.00855368 / 0.6) 0px 0px 0px 1px | oklab(0 0 0 / 0.4) 0px 0px 0px 1px.
