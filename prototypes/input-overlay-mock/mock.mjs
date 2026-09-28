// Stand-in for the input-overlay OBS plugin's WebSocket server, for previewing
// /overlay/keys without OBS. Sends the same JSON events in a loop that roughly mimics
// bhopping: keycode as in input-overlay 5.0.6, rawcode as the Windows virtual-key code
// (which is what the overlay matches on).
// Also sends mouse movement like the real plugin: a simulated 1000 Hz mouse doing a
// left-right strafing sweep, in batches every 5 ms, newest first, with OS timestamps.
//   (default)          cursor positions as on the desktop
//   --locked           as in Momentum: the cursor drifts from the screen centre and is
//                      snapped back once per frame (every 11 ms, ~90 fps)
//   --replay <file>    play back a record.mjs recording instead, with its original timing
// Run with: node mock.mjs [--locked | --replay mouse-recording.json] [--port 16900]
// (the default port is the plugin's own)
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

// --port lets it run next to the real plugin; point the page at it with ?io=ws://localhost:<port>/
const portArg = process.argv.indexOf("--port");
const PORT = portArg === -1 ? 16899 : Number(process.argv[portArg + 1]);
const KEY = { W: 0x11, A: 0x1e, S: 0x1f, D: 0x20, SPACE: 0x39 };
const VK = { [KEY.W]: 0x57, [KEY.A]: 0x41, [KEY.S]: 0x53, [KEY.D]: 0x44, [KEY.SPACE]: 0x20 };

/** [delay before this step in ms, event] */
const LOOP = [
	[0, { event_type: "key_pressed", keycode: KEY.W }],
	[200, { event_type: "key_pressed", keycode: KEY.SPACE }],
	[60, { event_type: "key_released", keycode: KEY.SPACE }],
	[40, { event_type: "key_released", keycode: KEY.W }],
	[0, { event_type: "key_pressed", keycode: KEY.A }],
	[450, { event_type: "key_released", keycode: KEY.A }],
	[0, { event_type: "key_pressed", keycode: KEY.D }],
	[150, { event_type: "key_pressed", keycode: KEY.SPACE }],
	[60, { event_type: "key_released", keycode: KEY.SPACE }],
	[240, { event_type: "key_released", keycode: KEY.D }],
	[0, { event_type: "key_pressed", keycode: KEY.A }],
	[450, { event_type: "key_released", keycode: KEY.A }],
	[200, { event_type: "mouse_pressed", button: 2 }],
	[120, { event_type: "mouse_released", button: 2 }],
	[200, { event_type: "key_pressed", keycode: KEY.S }],
	[300, { event_type: "key_released", keycode: KEY.S }],
	[400, null],
];

const clients = new Set();

/** One unmasked WebSocket text frame (server-to-client frames are never masked). */
function frame(text) {
	const payload = Buffer.from(text);
	const header =
		payload.length < 126
			? Buffer.from([0x81, payload.length])
			: Buffer.from([0x81, 126, payload.length >> 8, payload.length & 0xff]);
	return Buffer.concat([header, payload]);
}

function send(event) {
	const rawcode = event.keycode === undefined ? {} : { rawcode: VK[event.keycode] };
	const data = frame(JSON.stringify({ time: Date.now(), event_source: "mock", mask: 0, ...event, ...rawcode }));
	for (const socket of clients) socket.write(data);
}

const server = createServer((_req, res) => res.writeHead(426).end("WebSocket only"));
server.on("upgrade", (req, socket) => {
	const accept = createHash("sha1")
		.update(`${req.headers["sec-websocket-key"]}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
		.digest("base64");
	socket.write(
		`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`,
	);
	clients.add(socket);
	socket.on("close", () => clients.delete(socket));
	socket.on("error", () => clients.delete(socket));
	// Close frames and pings from the browser are ignored; this is a preview tool.
	socket.on("data", (data) => {
		if ((data[0] & 0x0f) === 0x8) socket.end();
	});
});

// Mouse: a bhop-like sweep, left and right with a little vertical wobble.
const CENTER = { x: 1280, y: 720 };
const locked = process.argv.includes("--locked");
const replayArg = process.argv.indexOf("--replay");
const sendMove = (point) =>
	send({ event_type: "mouse_moved", button: 0, clicks: 0, ...point, x: Math.round(point.x), y: Math.round(point.y) });

if (replayArg !== -1) {
	// Recorded events, re-sent with their original gaps. Events that arrived together (a
	// plugin batch) are sent together, in the order they were recorded.
	// Starts when the first viewer connects, so nothing is sent before anyone listens.
	const recording = JSON.parse(readFileSync(process.argv[replayArg + 1], "utf8"));
	let start = 0;
	let i = 0;
	server.once("upgrade", () => {
		console.log(`Replaying ${recording.length} mouse events`);
		start = performance.now() - recording[0].t;
		setTimeout(next, 50);
	});
	const next = () => {
		const now = performance.now() - start;
		while (i < recording.length && recording[i].t <= now) {
			const { t, ...event } = recording[i++];
			sendMove(event);
		}
		if (i < recording.length) setTimeout(next, 1);
		else console.log("Replay finished");
	};
} else {
	const cursor = (t) => ({
		x: CENTER.x + 300 * Math.sin(t * 2 * Math.PI * 0.8),
		y: CENTER.y + 60 * Math.sin(t * 2 * Math.PI * 1.6),
	});
	let simMs = Math.floor(performance.now());
	let previous = cursor(simMs / 1000);
	let offset = { x: 0, y: 0 };
	let sinceSnap = 0;
	setInterval(() => {
		const batch = [];
		for (const now = performance.now(); simMs + 1 <= now; ) {
			simMs += 1;
			const c = cursor(simMs / 1000);
			const move = { x: c.x - previous.x, y: c.y - previous.y };
			previous = c;
			if (locked) {
				// The game snaps the cursor back once per frame; that produces no event.
				if (++sinceSnap >= 11) {
					offset = { x: 0, y: 0 };
					sinceSnap = 0;
				}
				offset.x += move.x;
				offset.y += move.y;
				batch.push({ time: simMs, x: CENTER.x + offset.x, y: CENTER.y + offset.y });
			} else {
				batch.push({ time: simMs, ...c });
			}
		}
		// Like input-overlay: one batch every 5 ms, newest first.
		for (const point of batch.reverse()) sendMove(point);
	}, 5);
}

server.listen(PORT, "localhost", () => {
	console.log(`Mock input-overlay on ws://localhost:${PORT}/, looping a bhop pattern`);
	let step = 0;
	const tick = () => {
		const [, event] = LOOP[step];
		if (event) send(event);
		step = (step + 1) % LOOP.length;
		setTimeout(tick, LOOP[step][0]);
	};
	tick();
});
