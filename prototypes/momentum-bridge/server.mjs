// Receives game data from the Panorama bridge (panorama/scripts/hud/overlay-bridge.ts),
// prints jump stats, and serves overlay state (maps, speakers) to the overlay pages.
// Run with: node server.mjs
//
// Console commands:
//   next <map> [gamemode]             set the map shown as "up next", e.g. next surf_utopia surf
//   next                              clear it
//   current <map> [gamemode]          set the current map by hand (normally sent by the game)
//   speaker <pearl> <name> [image]    put a speaker in the din, farore or nayru slot; image is a
//                                     URL or a file in ./avatars, e.g. speaker farore Alex alex.png
//   speaker <pearl>                   empty the slot
//   speaking <pearl> on|off           light or dim the slot's pearl by hand (for testing)
//
// HTTP:
//   GET /speaker?pearl=<pearl>&name=<name>[&image=<url>]   put a speaker in a slot (no name: empty it)
//   GET /speaking?pearl=<pearl>&on=1|0          for whatever detects voice activity
//   GET /api/map?name=<map>[&gamemode=<mode>]   one map's { name, tier, gamemode, image } as
//                                               JSON (gamemode defaults to bhop), for /overlay/map
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { basename, extname, join } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { GAMEMODES, lookupMap } from "./maps.mjs";

const PORT = 8765;
const AVATAR_DIR = fileURLToPath(new URL("./avatars/", import.meta.url));
const PEARLS = ["din", "farore", "nayru"];
const IMAGE_TYPES = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif" };

/**
 * Overlay state. Maps are { name, tier, gamemode, image } or null; speakers are
 * { name, image, speaking } or null, one per pearl slot.
 */
const state = {
	current: null,
	next: null,
	speakers: { din: null, farore: null, nayru: null },
};
const listeners = new Set();

const stateMessage = () => `event: state\ndata: ${JSON.stringify(state)}\n\n`;

function broadcast() {
	const message = stateMessage();
	for (const res of listeners) res.write(message);
}

async function setMap(slot, name, gamemode) {
	state[slot] = name ? await lookupMap(name, gamemode) : null;
	const map = state[slot];
	console.log(map ? `${slot}: ${map.name} (tier ${map.tier ?? "?"})` : `${slot}: cleared`);
	broadcast();
}

/**
 * Avatar links copied from Discord's chat are small (usually ?size=80), which looks
 * soft in a 96px slot. Discord's CDN serves any power of two, so ask for 256.
 */
function largeDiscordAvatar(link) {
	try {
		const url = new URL(link);
		if (url.hostname !== "cdn.discordapp.com" && url.hostname !== "media.discordapp.net") return link;
		url.searchParams.set("size", "256");
		return url.toString();
	} catch {
		return link;
	}
}

/** Console form: speaker <pearl> <name...> [image]. */
function setSpeakerFromArgs(pearl, args) {
	// The last argument is the image if it looks like one; everything before it is the name.
	const last = args.at(-1) ?? "";
	const hasImage = /^https?:\/\//.test(last) || extname(last).toLowerCase() in IMAGE_TYPES;
	setSpeaker(pearl, (hasImage ? args.slice(0, -1) : args).join(" "), hasImage ? last : null);
}

/** An empty name empties the slot. `image` is a URL or a file name in ./avatars. */
function setSpeaker(pearl, name, image) {
	if (image && !/^https?:\/\//.test(image)) image = `http://127.0.0.1:${PORT}/avatars/${encodeURIComponent(basename(image))}`;
	if (image) image = largeDiscordAvatar(image);

	state.speakers[pearl] = name ? { name, image: image || null, speaking: false } : null;
	console.log(name ? `${pearl}: ${name}${image ? "" : " (no image)"}` : `${pearl}: empty`);
	broadcast();
}

function setSpeaking(pearl, speaking) {
	const speaker = state.speakers[pearl];
	if (!speaker || speaker.speaking === speaking) return;
	speaker.speaking = speaking;
	broadcast();
}

function parseGamemode(value) {
	if (value == null || value === "") return undefined;
	const number = Number(value);
	return Number.isInteger(number) ? number : GAMEMODES[value.toLowerCase()];
}

async function serveAvatar(res, file) {
	try {
		const body = await readFile(join(AVATAR_DIR, basename(file)));
		res.writeHead(200, { "Content-Type": IMAGE_TYPES[extname(file).toLowerCase()] ?? "application/octet-stream" }).end(body);
	} catch {
		console.warn(`[avatars] not found: ${file} (put it in ${AVATAR_DIR})`);
		res.writeHead(404).end();
	}
}

const server = createServer((req, res) => {
	const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
	const q = url.searchParams;

	// Live feed for the overlay (Server-Sent Events). The overlay is served from
	// another origin (the Vite dev server or the site), hence the CORS header.
	if (url.pathname === "/events") {
		res.writeHead(200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			"Access-Control-Allow-Origin": "*",
		});
		res.write(stateMessage());
		listeners.add(res);
		req.on("close", () => listeners.delete(res));
		return;
	}

	if (url.pathname === "/api/map") {
		const name = q.get("name");
		const cors = { "Access-Control-Allow-Origin": "*" };
		if (!name) {
			res.writeHead(400, cors).end("name is required");
			return;
		}
		void lookupMap(name, parseGamemode(q.get("gamemode")) ?? GAMEMODES.bhop).then((map) =>
			res.writeHead(200, { ...cors, "Content-Type": "application/json" }).end(JSON.stringify(map)),
		);
		return;
	}

	if (url.pathname.startsWith("/avatars/")) {
		void serveAvatar(res, decodeURIComponent(url.pathname.slice("/avatars/".length)));
		return;
	}

	if (url.pathname === "/jump") {
		const sync = (Number(q.get("sync")) * 100).toFixed(1);
		console.log(
			`jump ${q.get("jump")?.padStart(3)}  |  strafes ${q.get("strafes")?.padStart(2)}  |  sync ${sync.padStart(5)}%  |  running sync1 ${q.get("sync1")}%  sync2 ${q.get("sync2")}%`,
		);
	} else if (url.pathname === "/speaker") {
		const pearl = q.get("pearl");
		if (PEARLS.includes(pearl)) setSpeaker(pearl, q.get("name") ?? "", q.get("image"));
	} else if (url.pathname === "/speaking") {
		const pearl = q.get("pearl");
		if (PEARLS.includes(pearl)) setSpeaking(pearl, q.get("on") === "1");
	} else if (url.pathname === "/map") {
		void setMap("current", q.get("name"), parseGamemode(q.get("gamemode")));
	} else {
		console.log(`${req.method} ${req.url}`);
	}

	// 200 with a body rather than 204: jQuery-style clients report 204 as "nocontent", not "success".
	res.writeHead(200, { "Content-Type": "text/plain" }).end("ok");
});

server.listen(PORT, "127.0.0.1", () => {
	console.log(`Listening on http://127.0.0.1:${PORT}, waiting for the game...`);
	console.log('Type "next <map> [gamemode]" or "speaker <din|farore|nayru> <name> [image]".');
});

createInterface({ input: process.stdin }).on("line", (line) => {
	const [command, ...args] = line.trim().split(/\s+/);
	if (command === "next" || command === "current") {
		const [name, gamemode] = args;
		const mode = parseGamemode(gamemode);
		if (gamemode && mode === undefined) console.log(`Unknown gamemode "${gamemode}". Use one of: ${Object.keys(GAMEMODES).join(", ")}`);
		else void setMap(command, name, mode ?? state.current?.gamemode ?? undefined);
	} else if (command === "speaker") {
		const [pearl, ...rest] = args;
		if (!PEARLS.includes(pearl)) console.log(`Unknown slot "${pearl ?? ""}". Use one of: ${PEARLS.join(", ")}`);
		else setSpeakerFromArgs(pearl, rest);
	} else if (command === "speaking") {
		const [pearl, onOff] = args;
		if (!PEARLS.includes(pearl) || !["on", "off"].includes(onOff)) console.log("Usage: speaking <din|farore|nayru> on|off");
		else if (!state.speakers[pearl]) console.log(`${pearl} is empty; set a speaker first`);
		else setSpeaking(pearl, onOff === "on");
	} else if (command) {
		console.log("Commands: next <map> [gamemode], next, current <map> [gamemode], speaker <pearl> <name> [image], speaker <pearl>, speaking <pearl> on|off");
	}
});
