import { createSignal, onCleanup } from "solid-js";

export type OverlayMap = {
	name: string;
	tier: number | null;
	gamemode: number | null;
	image: string | null;
};

export type Speaker = { name: string; image: string | null; speaking: boolean };

export type Pearl = "din" | "farore" | "nayru";

export type OverlayState = {
	current: OverlayMap | null;
	next: OverlayMap | null;
	speakers: Record<Pearl, Speaker | null>;
};

// The local bridge server (prototypes/momentum-bridge/server.mjs). Override with ?server=.
const DEFAULT_SERVER = "http://127.0.0.1:8765";

/** The bridge server's address for this page. */
export const bridgeServer = () =>
	new URLSearchParams(location.search).get("server") ?? DEFAULT_SERVER;

/** Live overlay state from the bridge server. Call inside a component. */
export function useOverlayState() {
	const [state, setState] = createSignal<OverlayState>({
		current: null,
		next: null,
		speakers: { din: null, farore: null, nayru: null },
	});

	// EventSource reconnects by itself, so the overlay recovers when the server restarts.
	const events = new EventSource(`${bridgeServer()}/events`);
	events.addEventListener("state", (event) => setState(JSON.parse(event.data)));
	onCleanup(() => events.close());

	return state;
}
