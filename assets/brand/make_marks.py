"""Builds the favicon (portfolio/public/mark.svg) and the GitHub profile banner (assets/profile-header.svg).

Both are plain SVG with the lettering converted to outlines, because neither a favicon nor an
image in a GitHub README can load the site's fonts. Run from the repo root:

    python assets/brand/make_marks.py        (needs: pip install fonttools brotli)
"""
import math
from pathlib import Path
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[2]
FONTS = ROOT / 'portfolio' / 'public' / 'fonts'
INK, PAPER, CORAL, LIME, MUTE = '#0c0c0e', '#f3eee3', '#ff5d3b', '#c8f169', '#93918a'


def face(file, **axes):
    font = TTFont(FONTS / file)
    return instantiateVariableFont(font, axes) if axes else font


def glyph(font, char, size, x, y, rotate=None):
    """One character as an SVG path string, baseline at (x, y). Returns (path, advance in px)."""
    name = font.getBestCmap()[ord(char)]
    glyphs, scale = font.getGlyphSet(), size / font['head'].unitsPerEm
    pen = SVGPathPen(glyphs, ntos=lambda value: f'{value:.1f}'.rstrip('0').rstrip('.'))
    glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, y)))
    return pen.getCommands(), glyphs[name].width * scale


def text(font, string, size, x, y, tracking=0.0):
    """A run of text as one path string. Returns (path, width in px)."""
    parts, start = [], x
    for char in string:
        path, advance = glyph(font, char, size, x, y)
        parts.append(path)
        x += advance + tracking * size
    return ' '.join(parts), x - start - tracking * size


def width(font, string, size, tracking=0.0):
    return text(font, string, size, 0, 0, tracking)[1]


def ring(font, string, size, cx, cy, radius, star='✦'):
    """Text set around a circle, evenly spaced, as a list of <path> elements."""
    step = 360 / len(string)
    out = []
    for i, char in enumerate(string):
        turn = f'rotate({i * step:.2f} {cx} {cy})'
        if char == star:
            r = size * 0.36
            out.append(f'<path transform="{turn}" d="M{cx} {cy - radius - r - size * .3}l{r * .3:.2f} {r * .7:.2f} {r * .7:.2f} {r * .3:.2f} -{r * .7:.2f} {r * .3:.2f} -{r * .3:.2f} {r * .7:.2f} -{r * .3:.2f} -{r * .7:.2f} -{r * .7:.2f} -{r * .3:.2f} {r * .7:.2f} -{r * .3:.2f}z"/>')
        elif char != ' ':
            w = width(font, char, size)
            out.append(f'<path transform="{turn}" d="{glyph(font, char, size, cx - w / 2, cy - radius)[0]}"/>')
    return '\n      '.join(out)


archivo = face('archivo-latin.woff2', wght=900, wdth=125)
sans = face('instrument-sans-latin.woff2', wght=600)
sans_text = face('instrument-sans-latin.woff2', wght=500)
serif = face('instrument-serif-italic-latin.woff2')
mono = face('jbm-latin.woff2', wght=500)

# ---------------------------------------------------------------- favicon
size = 30
w = width(archivo, 'SC', size, -0.04)
mark, _ = text(archivo, 'SC', size, 32 - w / 2, 32 + size * 0.36, -0.04)
(ROOT / 'portfolio' / 'public' / 'mark.svg').write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Sree Chackoth">
  <circle cx="32" cy="32" r="32" fill="{LIME}"/>
  <path d="{mark}" fill="{INK}"/>
</svg>
''', encoding='utf-8', newline='\n')

# ---------------------------------------------------------------- GitHub banner
W, H, pad = 1280, 300, 48
name_size = 98
line = name_size * 0.86
row1, row2 = 122, 122 + line
sree, sree_w = text(archivo, 'SREE', name_size, pad, row1, -0.04)
chackoth, name_w = text(archivo, 'CHACKOTH', name_size, pad, row2, -0.04)
right = pad + name_w

cap_h = name_size * 0.64
cap_x, cap_y = pad + sree_w + name_size * 0.1, row1 - name_size * 0.72 / 2 - cap_h / 2 - 1
cap_w = right - cap_x
t1, _ = text(sans, 'Applied AI Engineer', 15, cap_x + 24, cap_y + cap_h / 2 - 3)
t2, _ = text(sans, 'Forward Deployed Engineer', 15, cap_x + 24, cap_y + cap_h / 2 + 15)
ax, ay = cap_x + cap_w - 44, cap_y + cap_h / 2

bx, by, br = right - 6, row2 + 14, 50
badge = ring(mono, 'BUILD ✦ EVALUATE ✦ SHIP ✦ REPEAT ✦ ', 8.4, bx, by, br * 0.63)

col = right + 80
label, _ = text(mono, 'OPEN TO APPLIED AI, ML AND FDE ROLES', 12, col + 18, 68, 0.1)
s = 27
l1, _ = text(sans_text, 'I build LLM agents and vision', s, col, 128, -0.03)
l2, l2w = text(sans_text, 'systems, and the ', s, col, 128 + 34, -0.03)
l2b, _ = text(serif, 'tests that make', s * 1.14, col + l2w, 128 + 34, -0.01)
l3, _ = text(serif, 'them safe to ship.', s * 1.14, col, 128 + 68, -0.01)
url, _ = text(mono, 'JUST-SREE.VERCEL.APP', 12, col, 252, 0.1)

(ROOT / 'assets' / 'profile-header.svg').write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title description">
  <title id="title">Sree Chackoth, Applied AI Engineer and Forward Deployed Engineer. I build LLM agents and vision systems, and the tests that make them safe to ship.</title>
  <desc id="description">A dark banner with the name in large type, a coral capsule holding both job titles and a rotating lime badge, matching the portfolio site.</desc>
  <style>
    .spin {{ transform-origin: {bx}px {by}px; animation: spin 18s linear infinite; }}
    .pulse {{ animation: pulse 2.2s ease-in-out infinite; }}
    @keyframes spin {{ to {{ transform: rotate(360deg); }} }}
    @keyframes pulse {{ 50% {{ opacity: .35; }} }}
    @media (prefers-reduced-motion: reduce) {{ .spin, .pulse {{ animation: none; }} }}
  </style>
  <rect width="{W}" height="{H}" rx="24" fill="{INK}"/>
  <path d="{sree}" fill="{PAPER}"/>
  <path d="{chackoth}" fill="{PAPER}"/>
  <rect x="{cap_x:.1f}" y="{cap_y:.1f}" width="{cap_w:.1f}" height="{cap_h:.1f}" rx="{cap_h / 2:.1f}" fill="{CORAL}"/>
  <path d="{t1} {t2}" fill="{INK}"/>
  <path d="M{ax:.1f} {ay + 9:.1f}l18 -18m-12 0h12v12" fill="none" stroke="{INK}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="{bx}" cy="{by}" r="{br}" fill="{LIME}"/>
  <g class="spin" fill="{INK}">
      {badge}
  </g>
  <circle cx="{bx}" cy="{by}" r="{br * 0.38:.1f}" fill="{INK}"/>
  <path d="M{bx} {by - 9}v17m-7 -7l7 7 7 -7" fill="none" stroke="{LIME}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <circle class="pulse" cx="{col + 5}" cy="64" r="5" fill="{LIME}"/>
  <path d="{label}" fill="{LIME}"/>
  <path d="{l1} {l2}" fill="{PAPER}"/>
  <path d="{l2b} {l3}" fill="{LIME}"/>
  <path d="{url}" fill="{MUTE}"/>
</svg>
''', encoding='utf-8', newline='\n')
print(f'name ends at x={right:.0f}; text column {col:.0f}..{col + max(width(sans_text, "I build LLM agents and vision", s, -0.03), l2w + width(serif, "tests that make", s * 1.14, -0.01)):.0f} of {W - pad}')
