# Momentum Mod → local server bridge (prototype)

Sends strafe sync and strafe count for every jump from Momentum Mod's Panorama HUD
to a local Node server, which prints them.

```
node server.mjs     # terminal 1: listens on http://127.0.0.1:8765
node install.mjs    # once, and again after every game update
```

Then start the game (or press F7 in-game to reload Panorama) and bhop. Each jump prints:

```
jump  12  |  strafes  7  |  sync  87.3%  |  running sync1 84.21%  sync2 91.05%
```

- `sync` / `strafes`: the jump that just ended (`MomentumMovementAPI.GetLastJumpStats()`).
- `sync1` / `sync2`: running sync, same as the strafe sync HUD (`MomentumPlayerAPI.GetStrafeSync(0|1)`).

The game console (`~`) shows `[overlay-bridge] loaded` when the script runs, and a
warning if requests start failing (for example, when the server is not running).

## Map overlay (now / next)

The game reports the current map on every map load. The up-next map is set by typing
in the server's terminal:

```
next surf_skyhaven surf    # map name, optional gamemode (defaults to the current one)
next                       # clear it
current bhop_eazy bhop     # set the current map by hand, e.g. to test without the game
```

The server looks up tier, name and thumbnail on the Momentum API (`maps.mjs`), because
the API's CORS rules block the overlay from calling it directly. The tier is the main
track's, for the given gamemode, as the in-game map info HUD shows it. Maps the API
doesn't know (local maps) show the name only.

Add `http://localhost:5173/overlay/maps` (run `pnpm dev` in the repo root) as an OBS
Browser Source. It updates live over `GET /events` (Server-Sent Events), and reconnects
by itself if the server restarts.

## Single map source

One map's image filling the source, with the name (white) and tier (smaller, dimmer)
bottom-left. Set the size in OBS; the image is cropped to fill it.

- `/overlay/map` follows the current map: what the game reports, or what you set with
  `current <map>` in this terminal. It updates live.
- `/overlay/map?show=next` follows the up-next map (`next <map>`).
- `/overlay/map?map=bhop_relentless` always shows that one bhop map.

The server has to be running (the page gets maps through it). Names must match the
Momentum site exactly (e.g. `bhop_3muddz`); an unknown map shows its name and "Tier ?"
without an image.

## Speakers overlay (pearl slots)

Three slots for me and up to two co-hosts or guests, one per Wind Waker pearl:
`din`, `farore`, `nayru`. An empty slot shows the pearl; a taken one shows the speaker's
picture with the pearl overlapping its bottom edge.

```
speaker din Simen simen.png              # picture from ./avatars (gitignored)
speaker farore Alex https://.../alex.jpg # or any image URL
speaker nayru Kim                        # no picture: shows the initial
speaker farore                           # empty the slot again
```

Names can contain spaces; the last argument counts as the picture if it is a URL or ends
in .png/.jpg/.jpeg/.webp/.gif. Browser source: `http://localhost:5173/overlay/speakers`.

While someone is talking, their pearl lights up (dim otherwise); that is the only
speaking indicator. Whatever detects voice activity reports it with
`GET /speaking?pearl=<din|farore|nayru>&on=1|0`. To test by hand: `speaking farore on`.

### Pearl rings (`/overlay/pearls`)

The same three slots as bevelled rings (200px, 50px apart; browser source 700 × 230).
An empty ring shows its pearl's symbol in black; a taken one shows the speaker's avatar,
with the symbol below it: black while quiet, in the pearl's colour while speaking. The symbols
are traced from Wind Waker's pearls (`src/components/overlay/pearlSymbols.ts`).

Anything that knows who is in the voice channel can fill the slots over HTTP:

```
GET /speaker?pearl=din&name=Simen&image=<avatar url>   # put someone in a slot
GET /speaker?pearl=din                                 # empty it
GET /speaking?pearl=din&on=1                           # 1 = talking, 0 = quiet
```

## How it works

- `panorama/scripts/hud/overlay-bridge.ts` listens for `OnJumpStarted` and calls
  `$.AsyncWebRequest` with the stats as GET query parameters.
- `panorama/layout/hud/overlay-bridge.xml` is an invisible panel that loads the script.
- `install.mjs` copies both into `momentum/custom/OverlayBridge/panorama/` and writes a
  patched `hud.xml` (the installed game's copy plus one `<Frame>`) next to them.

Uninstall with `node install.mjs --uninstall`. For a non-default install location, pass
`--game "<path to the momentum folder>"`.
