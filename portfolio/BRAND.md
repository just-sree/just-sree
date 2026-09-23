# Sree — terminal edition

The page reads like a shell session: each section starts with a command (`whoami`, `ls projects/`, `cat experience.log`, `./contact`) and its output follows.

## Colour

Near-black background (#0D0F0D), soft grey text (#D6D9D2), dim grey (#7C8379) for secondary text and comments. Green (#86D96B) for prompts, links and dates; amber (#E5B567) for project names. Dark only.

## Type

JetBrains Mono for everything, from Google Fonts with system monospace fallbacks. Hierarchy comes from colour and weight, not size.

## Shapes and motion

No cards, shadows, gradients or rounded pills. Hairline rules and left borders only. Each featured project collapses to one line with a `[+]` toggle, and the longer project list sits behind a single toggle, so the page stays short. The blinking cursor and an ASCII aquarium are the only animations. The aquarium (`public/aquarium.js`) draws fish such as `><>` and `<º)))><` in the palette colours behind the page: brighter in the side margins, faint behind the text column. Fish scatter from the cursor and chase food dropped by clicking empty space; bubbles rise and seaweed sways along the bottom. It runs at about 30 fps, pauses in hidden tabs, draws a still frame under reduced motion, and can be switched off from the footer (remembered per browser). The cursor also stops under reduced motion.

## Portrait

`public/headshot.jpg` sits in a small terminal window beside the intro. `public/portrait.js` draws it as ASCII in the palette green by default, cropped to head and shoulders inside a circle with brightness spread evenly across the character ramp. Hover, keyboard focus or a tap fades to the photo with the same crop. Without the photo file the window is removed.

## Mark

`public/mark.svg`: a green `>_` prompt on a dark square, used as the favicon. `assets/profile-header.svg` is the GitHub profile banner, drawn as the same terminal.

## Copy

Plain first person. Say what was built and what the numbers were, including the unflattering ones. No slogans, no taglines, no em-dash asides.
