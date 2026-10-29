# Walkthrough: how the page is built and how it moves

One part per top-level section, top to bottom, as measured at 1440 px. Sizes are CSS pixels; colours are as computed. Every file named here is in this folder. How things move and behave (scrolling, page changes, the menu, hovers, clicks), step by step, is in `reference/motion/README.md`.

## 01 · div

- **Box:** 1440×900 px, starting 0 px from the top. Background rgb(14, 14, 13), text rgb(245, 242, 234).
- **Layout:** stacked blocks.
- **Look:** `reference/sections/01-div.jpg` and its anatomy `reference/sections/01-div.anatomy.jpg`.
- **Markup:** `reference/sections/01-div.html`.
- **Motion:**
  - CSS `svelte-11l4lgh-star-twinkle` 4.93s ease-in-out infinite on 90 elements (e.g. `div#pf-app > div.relative.flex:nth-of-type(1) > div.pointer-events-none.fixed:nth-of-type(1) > span.star.svelte-11l4lgh:nth-of-type(1)`, staggered: -4.88s, -2.39s, -3.21s, -3.57s, -1.48s)
  - CSS `svelte-11l4lgh-shooting` 9s linear infinite on 3 elements (e.g. `div#pf-app > div.relative.flex:nth-of-type(1) > div.pointer-events-none.fixed:nth-of-type(1) > span.shooting-star.svelte-11l4lgh:nth-of-type(91)`, staggered: 2s, 7.5s, 14s)
- **Film:** `reference/motion/films/01-loop-div.jpg` (Loop: svelte-11l4lgh-shooting; it is `div#pf-app > div.relative.flex:nth-of-type(1) > div.pointer-events-none.fixed:nth-of-type(1)` in the markup; frames captioned with ms).

## 02 · div

- **Box:** 1440×820 px, starting 0 px from the top. Background rgb(14, 14, 13), text rgb(245, 242, 234).
- **Layout:** flex row of 2, gap normal, center/center.
- **Type:** Lufga 400 16px/24px · Geist Mono Variable 600 13px/19.5px · Geist Mono Variable 600 14px/20px · Geist Mono Variable 600 10.5px/15.75px · Geist Mono Variable 500 14px/20px (family weight size/line-height, most text first).
- **Inside:** 1 heading, 1 paragraph, 18 buttons, 3 links, 5 pictures, 22 drawings.
- **Look:** `reference/sections/02-div.jpg` and its anatomy `reference/sections/02-div.anatomy.jpg`.
- **Markup:** `reference/sections/02-div.html`.
- **Drawings:** `reference/assets/svg/001-icon-div.svg` (icon, 18×18), `reference/assets/svg/002-icon-div.svg` (icon, 18×18), `reference/assets/svg/003-icon-div.svg` (icon, 18×18), `reference/assets/svg/004-icon-div.svg` (icon, 21×21), `reference/assets/svg/005-icon-div.svg` (icon, 15×15), `reference/assets/svg/006-icon-div.svg` (icon, 17×17), `reference/assets/svg/007-icon-div.svg` (icon, 17×17), `reference/assets/svg/008-icon-div.svg` (icon, 16×16), `reference/assets/svg/009-icon-div.svg` (icon, 17×17), `reference/assets/svg/010-icon-div.svg` (icon, 17×17), `reference/assets/svg/011-icon-div.svg` (icon, 16×16), `reference/assets/svg/012-icon-div.svg` (icon, 16×16, ×11), and 4 more.
- **Pictures:** `reference/assets/images/021-image.webp` (1280×720), `reference/assets/images/022-gb.png` (64×48), `reference/assets/images/023-sa.png` (64×48), `reference/assets/images/024-fr.png` (64×48), `reference/assets/images/025-es.png` (64×48).
- **Motion:**
  - scripts add `.opacity-100` to 1 element as the page scrolls (first at scrollY 0)
- **Film:** `reference/motion/films/02-reveal-div.jpg` (Reveal: +opacity-100; it is `div.min-h-screen:nth-of-type(2) > div.relative.w-full:nth-of-type(1) > div.relative.flex:nth-of-type(1) > div.relative.order-2:nth-of-type(1) > div.relative.overflow-hidden:nth-of-type(1)` in the markup; frames captioned with ms).
- **Hover:** `.group-hover\:border-white\/20:is(:where(.group):hover *)` changes border-color; `.group-hover\:border-white\/20:is(:where(.group):hover *)` changes border-color; `.group-hover\:bg-white\/15:is(:where(.group):hover *)` changes background; `.group-hover\:bg-white\/15:is(:where(.group):hover *)` changes background; `.group-hover\:text-neutral-200:is(:where(.group):hover *)` changes color; `.hover\:border-white\/25:hover` changes border-color; `.hover\:border-white\/25:hover` changes border-color; `.hover\:bg-black\/60:hover` changes background; `.hover\:bg-black\/60:hover` changes background; `.hover\:bg-gray-300:hover` changes background.
- **Control states:** `reference/components/01-button.jpg` (button button.group.flex: rest, hover, focus).
- **Control states:** `reference/components/02-button.jpg` (button a.flex.items-center: rest, hover, focus).

## 03 · div

- **Box:** 1440×183 px, starting 852 px from the top. Background rgb(14, 14, 13), text rgb(245, 242, 234).
- **Layout:** flex row of 2, gap 16px, normal/baseline.
- **Type:** Geist Mono Variable 400 16px/26px · Geist Mono Variable 600 10px/15px · Geist Mono Variable 500 13px/19.5px · Lufga 600 16px/24px · Geist Mono Variable 500 16px/26px (family weight size/line-height, most text first).
- **Inside:** 1 heading, 3 paragraphs, 1 button, 1 drawing.
- **Look:** `reference/sections/03-div.jpg` and its anatomy `reference/sections/03-div.anatomy.jpg`.
- **Markup:** `reference/sections/03-div.html`.
- **Drawings:** `reference/assets/svg/017-icon-div.svg` (icon, 16×16).

## 04 · div

- **Box:** 1440×397 px, starting 1132 px from the top. Background rgb(14, 14, 13), text rgb(245, 242, 234).
- **Layout:** grid, 2 columns (706.906px 589.078px), gap 48px.
- **Type:** Urbanist Variable 600 13px/16.25px · Urbanist Variable 600 14px/20px · Urbanist Variable 400 12px/18px · Geist Mono Variable 500 13px/19.5px · Lufga 500 16px/24px (family weight size/line-height, most text first).
- **Inside:** 2 headings, 1 button, 13 links, 13 pictures, 1 drawing.
- **Look:** `reference/sections/04-div.jpg` and its anatomy `reference/sections/04-div.anatomy.jpg`.
- **Markup:** `reference/sections/04-div.html`.
- **Drawings:** `reference/assets/svg/018-icon-div.svg` (icon, 15×15, ×2).
- **Pictures:** `reference/assets/images/026-image.webp` (200×300), `reference/assets/images/027-image.webp` (200×300), `reference/assets/images/028-image.webp` (200×300), `reference/assets/images/029-image.webp` (200×300), `reference/assets/images/030-image.webp` (200×300), `reference/assets/images/031-image.webp` (200×300), `reference/assets/images/032-image.webp` (200×300), `reference/assets/images/033-image.webp` (200×300), `reference/assets/images/034-image.webp` (200×300), `reference/assets/images/035-image.webp` (200×300).
- **Hover:** `.group-hover\:ring-foreground\/30:is(:where(.group):hover *)` changes something; `.group-hover\:ring-foreground\/30:is(:where(.group):hover *)` changes something; `.hover\:bg-secondary:hover` changes background; `.hover\:text-foreground:hover` changes color.

## 05 · div

- **Box:** 1440×1164 px, starting 1593 px from the top. Background rgb(14, 14, 13), text rgb(245, 242, 234).
- **Layout:** flex row of 2, gap 12px, normal/normal.
- **Type:** Geist Mono Variable 400 11px/16.5px · Urbanist Variable 400 13px/19.5px · Geist Mono Variable 400 12.5px/18.75px · Geist Mono Variable 600 13px/19.5px · Lufga 600 11px/16.5px (family weight size/line-height, most text first).
- **Inside:** 3 headings, 7 paragraphs, 6 buttons, 3 links, 1 picture, 14 drawings.
- **Look:** `reference/sections/05-div.jpg` and its anatomy `reference/sections/05-div.anatomy.jpg`.
- **Markup:** `reference/sections/05-div.html`.
- **Drawings:** `reference/assets/svg/019-icon-div.svg` (icon, 15×15), `reference/assets/svg/020-icon-div.svg` (icon, 15×15), `reference/assets/svg/021-decoration-div.svg` (decoration, 1344×40), `reference/assets/svg/022-icon-div.svg` (icon, 64×64, ×5), `reference/assets/svg/023-icon-div.svg` (icon, 15×15), `reference/assets/svg/024-icon-div.svg` (icon, 17×17), `reference/assets/svg/025-icon-div.svg` (icon, 15×15), `reference/assets/svg/026-icon-div.svg` (icon, 14×14), `reference/assets/svg/027-icon-div.svg` (icon, 15×15).
- **Pictures:** `reference/assets/images/039-image.jpg` (96×96).
- **Hover:** `.group-hover\:bg-ring:is(:where(.group):hover *)` changes background; `.hover\:border-ring\/40:hover` changes border-color; `.hover\:border-ring\/40:hover` changes border-color; `.hover\:bg-secondary:hover` changes background; `.hover\:text-foreground:hover` changes color; `.hover\:text-ring:hover` changes color; `.hover\:text-ring\/80:hover` changes color; `.hover\:text-ring\/80:hover` changes color.
- **Control states:** `reference/components/03-card.jpg` (card div.shrink-0.rounded-2xl:nth-of-type(1): rest, hover, focus).
- **Control states:** `reference/components/04-card.jpg` (card div.shrink-0.rounded-2xl:nth-of-type(2): rest, hover, focus).

## 06 · more-like-this

- **Box:** 1440×622 px, starting 2821 px from the top. Background rgb(14, 14, 13), text rgb(245, 242, 234).
- **Layout:** flex row of 2, gap 8px, normal/center.
- **Type:** Lufga 500 14px/19.25px · Geist Mono Variable 500 14px/20px · Lufga 700 18px/28px (family weight size/line-height, most text first).
- **Inside:** 11 headings, 40 buttons, 10 links, 10 pictures, 50 drawings.
- **Look:** `reference/sections/06-more-like-this.jpg` and its anatomy `reference/sections/06-more-like-this.anatomy.jpg`.
- **Markup:** `reference/sections/06-more-like-this.html`.
- **Drawings:** `reference/assets/svg/028-icon-more-like-this.svg` (icon, 16×16, ×10), `reference/assets/svg/029-icon-more-like-this.svg` (icon, 15×15, ×10), `reference/assets/svg/030-icon-more-like-this.svg` (icon, 12×12, ×10).
- **Pictures:** `reference/assets/images/040-image.webp` (320×480), `reference/assets/images/041-image.webp` (320×480), `reference/assets/images/042-image.webp` (320×480), `reference/assets/images/043-image.webp` (320×480), `reference/assets/images/044-image.webp` (320×480), `reference/assets/images/045-image.webp` (320×480), `reference/assets/images/046-image.webp` (320×480), `reference/assets/images/047-image.webp` (320×480), `reference/assets/images/048-image.webp` (320×480), `reference/assets/images/049-image.webp` (320×480).
- **Motion:**
  - scripts add `.opacity-100` to 10 elements as the page scrolls (first at scrollY 1240)
- **Film:** `reference/motion/films/03-reveal-more-like-this.jpg` (Reveal: +opacity-100; it is `a.group.relative:nth-of-type(1) > div:nth-of-type(1) > div.poster-mask.relative > div.relative.overflow-hidden:nth-of-type(1) > img.h-full.w-full` in the markup; frames captioned with ms).
- **Hover:** `.group-hover\:scale-103:is(:where(.group):hover *)` changes scale; `.hover\:border-amber-400\/40:hover` changes border-color; `.hover\:border-amber-400\/40:hover` changes border-color; `.hover\:border-ring\/80:hover` changes border-color; `.hover\:border-ring\/80:hover` changes border-color; `.hover\:border-teal-400\/40:hover` changes border-color; `.hover\:border-teal-400\/40:hover` changes border-color; `.hover\:bg-amber-400\/15:hover` changes background; `.hover\:bg-amber-400\/15:hover` changes background; `.hover\:bg-ring\/25:hover` changes background.

## 07 · footer

- **Box:** 1440×261 px, starting 3548 px from the top. Background rgb(14, 14, 13), text rgb(245, 242, 234).
- **Layout:** grid, 4 columns (180px 180px 180px 180px), gap 28px 16px.
- **Type:** Geist Mono Variable 400 12px/16px · Geist Mono Variable 500 13px/16.25px · Geist Mono Variable 400 10.5px/13.125px · Geist Mono Variable 400 13px/19.5px · Geist Mono Variable 400 11px/16.5px (family weight size/line-height, most text first).
- **Inside:** 5 links, 5 drawings.
- **Look:** `reference/sections/07-footer.jpg` and its anatomy `reference/sections/07-footer.anatomy.jpg`.
- **Markup:** `reference/sections/07-footer.html`.
- **Drawings:** `reference/assets/svg/031-icon-footer.svg` (icon, 40×28), `reference/assets/svg/032-icon-footer.svg` (icon, 36×32), `reference/assets/svg/033-icon-footer.svg` (icon, 28×28), `reference/assets/svg/034-icon-footer.svg` (icon, 32×32), `reference/assets/svg/035-icon-footer.svg` (icon, 16×16).
- **Hover:** `.group-hover\:text-muted-foreground:is(:where(.group):hover *)` changes color; `.hover\:border-border\/70:hover` changes border-color; `.hover\:border-border\/70:hover` changes border-color; `.hover\:bg-secondary:hover` changes background; `.hover\:text-foreground:hover` changes color.
