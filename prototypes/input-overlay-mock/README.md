# Key display (input-overlay → `/overlay/keys`)

The Wind Waker key diamond is drawn by the site (`src/components/overlay/KeyDiamond.tsx`)
and lit by the [input-overlay](https://github.com/univrsal/input-overlay) OBS plugin's
WebSocket server. The plugin only provides the input; none of its own presets or
textures are used.

## Setup

1. Install input-overlay in OBS. On OBS 31 or newer use the 5.1.0 pre-release
   (https://github.com/univrsal/input-overlay/releases/tag/5.1.0), which the maintainer
   recommends there; 5.0.6 can freeze or fail to load on newer OBS. Close OBS while
   installing, and check the log afterwards (Help > Log Files) for `[input-overlay] Loading`.
2. OBS > Tools > input-overlay settings: enable the WebSocket server (default port
   16899), then restart OBS.
3. Add a Browser Source with `http://localhost:5173/overlay/keys` (the site's dev server,
   `pnpm dev`; use the port it prints). Size 354 × 526 (the 338 × 510 key grid plus
   8px padding). Keep the default Custom CSS, which makes the background transparent,
   and untick "Shutdown source when not visible" so it stays connected across scenes.

For another address, add `?io=ws://host:port/` to the URL.

## Bindings

`BINDINGS` in `src/routes/overlay/keys.tsx` says what lights each piece: a key, a mouse
button, or a scroll direction (e.g. jump on scroll: `{ kind: "wheel", direction: "down" }`).

Keys are matched on the event's `rawcode`, the Windows virtual-key code (`KEY` in
`src/components/overlay/inputOverlay.ts`), because the plugin's own `keycode` numbering
changes between versions (W is 0x11 in 5.0.6 and 0x57 in 5.1.0). This works with any
plugin version.

## Previewing without OBS

`node mock.mjs` stands in for the plugin: same port, same JSON, looping a bhop-like
pattern. Stop the plugin's server first, as they share the port.

# Mouse trail (input-overlay → `/overlay/mouse`)

Mouse movement drawn as a short, fading trail on a square surface, with the distance the mouse
has travelled in the corner. Uses the same input-overlay WebSocket as the key display.

Browser Source: `http://localhost:5173/overlay/mouse?center=1280,720&dpi=800` (use your dev
server's port), square, e.g. 300 × 300.

- `center=1280,720`: for games that lock the cursor (Momentum): where the game snaps the
  cursor back to, the middle of the screen (half your resolution; 1280,720 at 2560×1440).
  Leave it out on the desktop. Momentum lets the cursor drift for a frame and then snaps
  it back, so movement is the change between positions, measured from the centre right
  after a snap-back. The plugin also sends each 5 ms batch newest first; the page puts
  events back in order by their timestamps.
- `dpi=800`: your mouse's DPI, so the distance is in real metres. It is an estimate:
  Windows pointer speed and in-game sensitivity don't change it, but pointer acceleration
  on the desktop does.
- `scale=0.08`: trail size per mouse count. Lower it if turns reach the edge, raise it if the trail looks small. Big turns ease into the edge rather than stopping at it.
- `trail=200`: how long the trail stays visible behind the dot, in milliseconds.
- `return=200`: how fast the dot springs back to the centre, in milliseconds. Lower is
  faster; it is most of the way back after 2-3 times this.
- `reset=1`: start the distance from 0. Otherwise it is kept between sessions.

Preview without OBS: `node mock.mjs --port 16900` (desktop) or `--locked` (Momentum-style
snap-backs), and add `&io=ws://localhost:16900/` to the URL. `node record.mjs` records 15 s
of real mouse input to `mouse-recording.json` (gitignored); `node mock.mjs --replay
mouse-recording.json --port 16900` plays it back.
