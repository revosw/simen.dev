import { createSignal, onCleanup, onSettled } from "solid-js";
import {
	type IoEvent,
	onInputOverlayEvent,
} from "../../components/overlay/inputOverlay";

/**
 * OBS browser source: mouse movement as a short, fading trail on a square surface, with the
 * distance the mouse has travelled. Fills the source; make it square in OBS.
 *
 * Input comes from the input-overlay plugin's WebSocket (mouse_moved/mouse_dragged,
 * which carry the cursor position). URL options:
 *   ?center=1280,720  games that lock the cursor (Momentum): the middle of the screen,
 *                     where the game snaps the cursor back to. Leave out on the desktop.
 *   ?dpi=800          the mouse's DPI, for the distance
 *   ?scale=0.08       how far the trail moves per mouse count
 *   ?trail=200        how long the trail stays visible behind the dot, in ms
 *   ?return=200       how fast the dot springs back to the centre, in ms (lower is
 *                     faster: most of the way back after about 2-3 times this)
 *   ?reset=1          start the distance at 0 (it is kept between sessions otherwise)
 */
const MAX_JUMP = 2000; // counts; bigger single moves (cursor teleports) are ignored
const BATCH_GAP_MS = 3; // input-overlay sends a batch every ~5 ms; its events arrive <1 ms apart
// v2: distances saved before the snap-back fix were counted several times over.
const STORAGE_KEY = "overlay.mouseDistanceMeters.v2";

function formatDistance(meters: number) {
	return meters < 1000
		? `${meters.toFixed(1)} m`
		: `${(meters / 1000).toFixed(2)} km`;
}

export default function MouseOverlay() {
	const params = new URLSearchParams(location.search);
	const center = params.get("center")?.split(",").map(Number);
	const locked = center?.length === 2 && center.every(Number.isFinite);
	const dpi = Number(params.get("dpi")) || 800;
	const scale = Number(params.get("scale")) || 0.08;
	const returnMs = Number(params.get("return")) || 200;
	const trailMs = Number(params.get("trail")) || 200;

	if (params.get("reset") === "1") localStorage.setItem(STORAGE_KEY, "0");
	let meters = Number(localStorage.getItem(STORAGE_KEY)) || 0;
	const [distance, setDistance] = createSignal(meters);

	// `aim` follows the mouse without bounds; `head` is where it is drawn: aim squashed
	// into the panel with tanh, so small moves are 1:1 and big turns ease into the edge
	// instead of slamming into a wall. Both relative to the panel's centre, in pixels.
	const aim = { x: 0, y: 0 };
	const head = { x: 0, y: 0 };
	const soft = (v: number) => limit * Math.tanh(v / limit);
	const placeHead = () => {
		head.x = soft(aim.x);
		head.y = soft(aim.y);
	};
	let trail: { x: number; y: number; t: number }[] = [];
	let limit = 100; // half the panel size minus a margin; set by the draw loop
	let last: { x: number; y: number } | null = null;

	/**
	 * One cursor position, in the order the OS saw them. Movement is the change since
	 * the previous position. In a game that locks the cursor (Momentum), the cursor
	 * drifts for a frame and is then snapped back to `center`; a position closer to the
	 * centre than to the previous one comes right after such a snap, so its movement is
	 * measured from the centre instead. (Measuring every position from the centre
	 * counted each frame's movement over and over: 6.8x too much in a recording.)
	 */
	function move(x: number, y: number) {
		let dx: number;
		let dy: number;
		const fromCenter =
			locked && center ? Math.hypot(x - center[0], y - center[1]) : Infinity;
		const fromLast = last ? Math.hypot(x - last.x, y - last.y) : Infinity;
		if (locked && center && fromCenter < fromLast) {
			dx = x - center[0];
			dy = y - center[1];
		} else if (last) {
			dx = x - last.x;
			dy = y - last.y;
		} else {
			last = { x, y };
			return;
		}
		last = { x, y };
		const counts = Math.hypot(dx, dy);
		if (!counts || counts > MAX_JUMP) return;

		meters += (counts / dpi) * 0.0254;
		aim.x += dx * scale;
		aim.y += dy * scale;
		placeHead();
		trail.push({ x: head.x, y: head.y, t: performance.now() });
	}

	// input-overlay sends its events in batches every ~5 ms, newest first. Collect each
	// batch and replay it oldest first: by the OS timestamp, and for events in the same
	// millisecond, in reverse arrival order.
	let batch: IoEvent[] = [];
	let flushTimer: number | undefined;
	function flush() {
		const ordered = batch
			.map((event, arrival) => ({ event, arrival }))
			.sort(
				(a, b) =>
					(a.event.time ?? 0) - (b.event.time ?? 0) || b.arrival - a.arrival,
			);
		batch = [];
		for (const { event } of ordered) move(event.x!, event.y!);
	}
	onCleanup(() => clearTimeout(flushTimer));

	onInputOverlayEvent(
		(event) => {
			if (
				event.event_type !== "mouse_moved" &&
				event.event_type !== "mouse_dragged"
			)
				return;
			if (event.x == null || event.y == null) return;
			batch.push(event);
			clearTimeout(flushTimer);
			flushTimer = window.setTimeout(flush, BATCH_GAP_MS);
		},
		() => {
			batch = [];
			last = null;
		},
	);

	const shownDistance = window.setInterval(() => setDistance(meters), 250);
	const savedDistance = window.setInterval(
		() => localStorage.setItem(STORAGE_KEY, String(meters)),
		2000,
	);
	onCleanup(() => {
		clearInterval(shownDistance);
		clearInterval(savedDistance);
		localStorage.setItem(STORAGE_KEY, String(meters));
	});

	let canvas: HTMLCanvasElement | undefined;
	onSettled(() => {
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) return;
		const styles = getComputedStyle(canvas);
		const lit = styles.getPropertyValue("--overlay-lit").trim() || "#efe3c8";

		let frame = 0;
		let previous = performance.now();
		const draw = (now: number) => {
			frame = requestAnimationFrame(draw);
			const dt = now - previous;
			previous = now;

			const w = canvas!.clientWidth;
			const h = canvas!.clientHeight;
			if (canvas!.width !== w || canvas!.height !== h) {
				canvas!.width = w;
				canvas!.height = h;
			}
			limit = Math.min(w, h) / 2 - 12;

			// The head springs back to the centre, so the trail always stays in view.
			const pull = Math.exp(-dt / returnMs);
			aim.x *= pull;
			aim.y *= pull;
			placeHead();
			trail = trail.filter((p) => now - p.t < trailMs);

			ctx.clearRect(0, 0, w, h);
			ctx.save();
			ctx.translate(w / 2, h / 2);
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			const points = [...trail, { ...head, t: now }];
			for (let i = 1; i < points.length; i++) {
				// Fades steeply (squared) so only the last moment of movement really shows.
				const fresh = Math.max(0, 1 - (now - points[i].t) / trailMs);
				ctx.globalAlpha = 0.7 * fresh * fresh;
				ctx.lineWidth = 1 + fresh;
				ctx.strokeStyle = lit;
				ctx.beginPath();
				ctx.moveTo(points[i - 1].x, points[i - 1].y);
				ctx.lineTo(points[i].x, points[i].y);
				ctx.stroke();
			}
			ctx.globalAlpha = 0.9;
			ctx.fillStyle = lit;
			ctx.beginPath();
			ctx.arc(head.x, head.y, 2.5, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		};
		frame = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(frame);
	});

	return (
		<main
			class="relative h-screen w-screen overflow-hidden rounded-xl border-[3px] border-(--overlay-tan)"
			style={{
				// The surface: translucent brown with a faint grid.
				"background-color":
					"color-mix(in srgb, var(--overlay-brown) 65%, transparent)",
				"background-image":
					"linear-gradient(color-mix(in srgb, var(--overlay-tan) 18%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--overlay-tan) 18%, transparent) 1px, transparent 1px)",
				// 8 × 8, like the Sploosh Kaboom board.
				"background-size": "12.5% 12.5%",
				"background-position": "center",
			}}
		>
			<canvas
				ref={(el) => {
					canvas = el;
				}}
				class="absolute inset-0 size-full"
			/>
			<p class="absolute right-3 bottom-2 text-lg font-bold text-(--overlay-lit) tabular-nums [text-shadow:0_1px_3px_rgb(0_0_0/0.6)]">
				{formatDistance(distance())}
			</p>
		</main>
	);
}
