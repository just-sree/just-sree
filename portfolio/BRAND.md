# Sree — light cyberpunk edition

Near-white paper (#F4F6FB), deep ink (#0E1226), and a cyan → magenta signal gradient (#00B8D4 → #E5187A) with violet (#6C4CF1) and lime (#2FD48F) as data accents. Chamfered corners, a faint grid with soft scanlines, monospace labels in brackets, and soft coloured glows instead of dark neon. The look stays light and readable; motion carries the story.

## Mark

`public/mark.svg`: an angular circuit-trace S inside a chamfered octagon, gradient stroke, magenta and cyan terminal dots. Used in the header, footer, contact block, agent avatar, and favicon. `assets/profile-header.svg` is the matching GitHub profile banner.

## Type

Space Grotesk for headings and UI, JetBrains Mono for labels, terminal, code, and counters. System fallbacks are declared; Google Fonts is optional.

## Motion

GSAP 3 with ScrollTrigger, ScrambleText, and DrawSVG, vendored under `public/vendor/` (Standard "no charge" license) so the strict `script-src 'self'` policy holds. Scenes are pinned and scrubbed on screens wider than 900px when reduced motion is not requested. Below that, or with reduced motion, every scene renders its final state in normal document flow. Canvases (hero network, constellation) render at a capped pixel density and only tick while on screen.

Background tint drifts between paper, a cyan wash, and a magenta wash as the story progresses. Nothing switches abruptly.
