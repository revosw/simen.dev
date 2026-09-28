# Outline art experiment

Turns Wind Waker-style character art (black ink lines around flat colour, on a transparent
background) into a one-colour outline drawing, for the overlay's outline style: lines in
`#2b3954` on a `#0d131f` background.

```powershell
.\outline.ps1 -In medli.png -Dark 30 -Light 65
```

Writes two files next to the input:

- `medli-outline.png`: the lines on the background colour (a preview).
- `medli-lines.png`: the lines on transparency, to layer in the overlay.

How it works: near-black pixels are ink. Brightness at or below `-Dark` counts fully,
at or above `-Light` not at all, with a smooth ramp between, so line edges stay
anti-aliased. Then specks are removed: solid ink blobs smaller than `-MinSpeck` pixels
(default 40), and soft ink not touching a line (shading texture). Colours are set with
`-Line` and `-Background`.

Settings per character:

| Character | Settings | Notes |
|---|---|---|
| Medli | `-Dark 30 -Light 65` | The default 60/110 let the dark red sash, grey dress and shaded hair bleed in. |
| Makar | `-Dark 30 -Light 65` | Same as Medli. |
| Salvatore | `-Dark 30 -Light 60 -MaxChroma 15` | The podium's dark navy stripe is nearly as dark as ink but blue (chroma ~40, ink ~0-2), so `-MaxChroma` rejects it. His boot is solid ink in the original, so it stays filled. |

`-MaxChroma` (off by default) rejects dark but coloured pixels: ink is colourless.
Details drawn only in colour, not ink (the Rito emblem on Medli's sash, her blush, the
skulls on Salvatore's podium), disappear by design.

Brown variant (instead of the blue): `-Background '#1a1511' -Line '#4a3f33' -Suffix '-brown'`.
`compare.html` shows both schemes next to the key display.

The source art is Nintendo's; this is for trying out the look. The overlay's final
characters come from the artist (see the brief, §1.3).
