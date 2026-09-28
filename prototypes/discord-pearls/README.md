# Pearl speaker slots on Discord StreamKit

Two ways to use StreamKit, Discord's own voice overlay. Both need the Discord app running
and in the voice channel; neither needs a bot.

1. **Relay into the overlay's pearl rings** (`streamkit-relay.user.js`, below): a
   userscript reads StreamKit in a browser tab and fills the bridge's slots, so
   `/overlay/pearls` shows everyone with their avatar and speaking state.
2. **Restyle StreamKit itself** (`pearls.css`, further down): paste CSS into an OBS
   Browser Source that shows StreamKit directly.

## Relay (recommended)

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser. In Chrome and
   Edge, also turn on "Allow user scripts" in Tampermonkey's extension details.
2. Tampermonkey > Create a new script, replace everything with `streamkit-relay.user.js`,
   and save.
3. Get the voice widget URL: https://streamkit.discord.com/overlay > Install for OBS >
   Voice Widget, pick the server and channel, copy the URL. Leave "show only speaking
   users" off, or quiet people drop out of their slot.
4. Open that URL in a normal browser tab (not OBS). The first time, Tampermonkey asks to
   let the script connect to 127.0.0.1; allow it.
5. Start the bridge (`node server.mjs` in `prototypes/momentum-bridge`). Its terminal
   prints `din: <name>` and so on as people are placed.

People get Din, Farore, Nayru in the order StreamKit lists them and keep their slot until
they leave; a fourth person waits for a free slot. To always be in one pearl yourself,
put your Discord user ID in `PINNED` at the top of the script (Discord settings > Advanced
> Developer Mode, then right-click yourself > Copy User ID):
`const PINNED = { "123456789012345678": "nayru" };`

Keep the StreamKit tab open while streaming; it can sit in the background. If Chrome's
Memory Saver is on, add `streamkit.discord.com` under Settings > Performance > "Always
keep these sites active", otherwise Chrome may put the tab to sleep. The relay
resends everything when the bridge restarts (it notices within about 5 seconds, or up to
a minute when the tab has been in the background a while). The tab's console (F12) logs
`[pearl relay]` messages.

Not yet checked against the real widget: that StreamKit runs in a normal tab as it does
in OBS, and that its markup matches the community CSS the selectors come from. The
behaviour (slots in join order, speaking, leaving, bridge restarts) is tested against
`mock.html`.

## Restyled StreamKit (CSS only)

Restyles Discord's own voice overlay ([StreamKit](https://streamkit.discord.com/overlay))
into the three pearl slots: Din, Farore, Nayru. StreamKit talks to the Discord app on
this PC, so there is no bot and nothing to host. It also brings everyone's avatar along,
so there are no links to paste.

- Avatars: greyscale circles tinted `--brown`.
- Pearl under each avatar: dim, lit while that person is talking. That is the only
  speaking indicator.
- The first three people in the channel get Din, Farore and Nayru, in StreamKit's order;
  anyone else is hidden.

## Setup

1. Open https://streamkit.discord.com/overlay, choose **Install for OBS**, and authorise
   it in the Discord app (once).
2. Pick **Voice Widget**, the server and the voice channel. Leave "show only speaking
   users" off, otherwise quiet people disappear. Copy the generated URL.
3. In OBS, add a Browser Source with that URL, and paste all of `pearls.css` into its
   **Custom CSS** field (replace what is there).

The Discord desktop app has to be running and in the voice channel.

## If slots swap around

StreamKit's list order decides who gets which pearl. To pin people instead, turn on
Developer Mode in Discord (Settings > Advanced), right-click a person > Copy User ID, and
add a line per person at the marked spot in `pearls.css`:

```css
li[data-userid="123456789012345678"] { --pearl: var(--din); }
```

## Testing without Discord

`mock.html` copies StreamKit's markup; click an avatar to toggle "speaking". With
`pnpm dev` running in the repo root: http://localhost:5173/prototypes/discord-pearls/mock.html

The markup (and so the selectors) comes from community StreamKit CSS from 2023–2024, not
from StreamKit itself. If Discord changes it, the slots break; check the real widget with
the browser source's Interact window or by opening the URL in a browser.
