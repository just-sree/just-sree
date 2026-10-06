# Sree — studio edition

One page built on oversized type and colour blocking. The name fills the first screen; each featured project is a full-width colour panel.

## Colour

Ink (#0C0C0E) background, paper (#F3EEE3) text, muted grey (#93918A) for secondary text. Three accents used as whole blocks, not highlights: coral (#FF5D3B), electric blue (#4B4BFF) and lime (#C8F169). Dark only. A faint film grain sits over everything.

The Hasten panel is the one exception: it borrows the product's own theme from hasten.bodhitattva.ai (misty blue-grey #C6CFD9, slate #354559, Fraunces headings).

## Type

All self-hosted in `public/fonts` (SIL Open Font License).

- Archivo, expanded and heavy, uppercase, for the name, section titles and project titles.
- Instrument Sans for body text.
- Instrument Serif Italic for the one emphasised phrase in a heading.
- JetBrains Mono for small labels, dates and figure text.
- Fraunces and Plus Jakarta Sans only inside the Hasten panel.

The name and the closing "Let's talk" are scaled by `site.js` to fill their container exactly.

## Layout

- Hero: name, photo inline after "SREE", a coral capsule with both job titles, and a rotating lime badge that links to the work.
- Selected work: five panels (WhatsApp agent, seating-chart detection, FutureCanada, Hasten, BogdAI). Each has what was built, the numbers, and what went wrong. On wide screens they stick under the nav and stack as you scroll. Below 1100px they collapse to title, summary and numbers with a button to expand; the first starts open.
- About: a bento grid, including a tile for the site's agent.
- Stack: two rows of pills sliding in opposite directions.
- Experience: large rows that invert on hover.
- Contact: a coral footer.

## Figures

Every figure is drawn from real numbers or is labelled as an illustration: the looping chat with its yes/no step, the reply-time bars, the seat map and its rows of squares, the forecast schematic, the Hasten voice capture, and the six BogdAI agents lighting up in order.

## Motion

`public/site.js` uses the browser's Web Animations API, with no library. Headings rise out of a mask, panels build their figures the first time they are on screen, numbers count up, and three figures loop. Everything is switched off under `prefers-reduced-motion`, and the page reads in full without JavaScript.

## Agent

The nav and the About tile open the agent dialog (`public/app.js`). The anonymized governed-AI case study is kept in the page markup but hidden until its owner review is done.

## Copy

Plain first person. Say what was built and what the numbers were, including the unflattering ones. No slogans, no taglines, no em-dash asides. Claims must match `ai-job-search/.claude/skills/job-application-assistant/01-candidate-profile.md`.

## Link preview

`public/og.png` (1200×630) is rendered from `assets/og/og.html` with headless Chrome; the command is in that file. Regenerate it if the name, titles or statement change.

## Mark and GitHub banner

`public/mark.svg` is the favicon: ink "SC" on a lime circle. `assets/profile-header.svg` is the GitHub profile banner, with the name, the coral capsule and a rotating badge. Both are built by `assets/brand/make_marks.py`, which converts the lettering to outlines because neither can load the site's fonts.
