import { createSignal, onCleanup } from "solid-js";

/**
 * Live input from the input-overlay OBS plugin's WebSocket server
 * (https://github.com/univrsal/input-overlay; OBS > Tools > input-overlay settings >
 * enable the WebSocket server). Each message is one libuiohook event as JSON, e.g.
 * {"event_type":"key_pressed","keycode":17,"rawcode":87,...} or {"event_type":"mouse_pressed","button":1,...}.
 */

// input-overlay's default port. Override with ?io=ws://host:port.
const DEFAULT_URL = "ws://localhost:16899/";

export type Binding =
	| { kind: "key"; vk: number }
	| { kind: "mouse"; button: number }
	/** Scroll: lit briefly per notch. rotation > 0 is scrolling down (towards you). */
	| { kind: "wheel"; direction: "up" | "down" };

/**
 * Keys are matched on the event's `rawcode`, which on Windows is the virtual-key code
 * straight from the OS keyboard hook. The `keycode` field is libuiohook's own numbering,
 * and that differs between plugin versions (W is 0x11 in 5.0.6, 0x57 in 5.1.0 and 0x46 on
 * master; 0x20 is D in one and Space in another), so it can't be relied on.
 * Letter keys follow the active keyboard layout (on AZERTY the key in W's place is Z).
 */
export const KEY = {
	W: 0x57,
	A: 0x41,
	S: 0x53,
	D: 0x44,
	SPACE: 0x20,
	CTRL_L: 0xa2,
	SHIFT_L: 0xa0,
};
export const MOUSE = { LEFT: 1, RIGHT: 2, MIDDLE: 3, BACK: 4, FORWARD: 5 };

const WHEEL_FLASH_MS = 90;

export type IoEvent = {
	event_type: string;
	rawcode?: number;
	button?: number;
	rotation?: number;
	/** When the OS hook saw the event, in ms (counts up; not wall-clock time). */
	time?: number;
	/** Cursor position, on mouse_moved / mouse_dragged (and button events). */
	x?: number;
	y?: number;
};

/**
 * Calls `onEvent` for every event from the plugin, and `onDisconnect` when the connection
 * drops. Reconnects every second while the plugin is unreachable. Call inside a component;
 * closes with it.
 */
export function onInputOverlayEvent(
	onEvent: (event: IoEvent) => void,
	onDisconnect?: () => void,
) {
	const url = new URLSearchParams(location.search).get("io") ?? DEFAULT_URL;
	let socket: WebSocket | undefined;
	let retry: number | undefined;
	let disposed = false;

	function connect() {
		socket = new WebSocket(url);
		socket.onmessage = (message) => {
			let event: IoEvent;
			try {
				event = JSON.parse(message.data);
			} catch {
				return; // Ignore anything that isn't one JSON event.
			}
			onEvent(event);
		};
		socket.onclose = () => {
			onDisconnect?.();
			if (!disposed) retry = window.setTimeout(connect, 1000);
		};
	}
	connect();

	onCleanup(() => {
		disposed = true;
		clearTimeout(retry);
		socket?.close();
	});
}

/**
 * Which of `bindings` are currently pressed. Reconnects every second while the plugin
 * is unreachable, and releases everything when the connection drops, so no key stays
 * stuck on screen.
 */
export function useInputOverlay<K extends string>(
	bindings: Record<K, Binding>,
) {
	const [pressed, setPressed] = createSignal<ReadonlySet<K>>(new Set());
	const names = Object.keys(bindings) as K[];

	const set = (name: K, down: boolean) =>
		setPressed((prev) => {
			if (prev.has(name) === down) return prev;
			const next = new Set(prev);
			if (down) next.add(name);
			else next.delete(name);
			return next;
		});

	const wheelTimers = new Map<K, number>();
	const flash = (name: K) => {
		set(name, true);
		clearTimeout(wheelTimers.get(name));
		wheelTimers.set(
			name,
			window.setTimeout(() => set(name, false), WHEEL_FLASH_MS),
		);
	};

	function handle(event: IoEvent) {
		const down = event.event_type.endsWith("_pressed");
		const up = event.event_type.endsWith("_released");
		for (const name of names) {
			const b = bindings[name];
			if (
				b.kind === "key" &&
				(down || up) &&
				event.event_type.startsWith("key_") &&
				event.rawcode === b.vk
			)
				set(name, down);
			else if (
				b.kind === "mouse" &&
				(down || up) &&
				event.event_type.startsWith("mouse_") &&
				event.button === b.button
			)
				set(name, down);
			else if (
				b.kind === "wheel" &&
				event.event_type === "mouse_wheel" &&
				Math.sign(event.rotation ?? 0) === (b.direction === "down" ? 1 : -1)
			)
				flash(name);
		}
	}

	onInputOverlayEvent(handle, () => setPressed(new Set<K>()));
	onCleanup(() => {
		for (const timer of wheelTimers.values()) clearTimeout(timer);
	});

	return pressed;
}
