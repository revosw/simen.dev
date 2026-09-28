import { Show, createEffect, createSignal, onCleanup } from "solid-js";
import {
	type OverlayMap,
	bridgeServer,
	useOverlayState,
} from "../../components/overlay/state";
import { TintedImage } from "../../components/overlay/TintedImage";

/**
 * OBS browser source for one map: its image (greyscaled and tinted brown, like the
 * avatars) with the name and tier bottom-left.
 * - /overlay/map                  follows the bridge's current map (the game, or the
 *                                 `current` command in the bridge's terminal)
 * - /overlay/map?show=next        follows the up-next map (`next` command)
 * - /overlay/map?map=bhop_eazy    always shows that one bhop map
 * Fills the browser source, so its size is set in OBS. Needs the bridge server, which
 * looks maps up on the Momentum API (its CORS rules block this page from calling it).
 */
const MAX_NAME_WIDTH = 0.75; // of the source's width
const MAX_NAME_SIZE = 60; // px

export default function MapOverlay() {
	const params = new URLSearchParams(location.search);
	const name = params.get("map");
	const slot = params.get("show") === "next" ? "next" : "current";

	// Pinned to ?map=: fetch that map once. Otherwise: follow the bridge's live state.
	const [pinned, setPinned] = createSignal<OverlayMap | null>(null);
	const live = name ? undefined : useOverlayState();
	const map = () => (name ? pinned() : live?.()[slot] ?? null);

	let retry: number | undefined;
	async function load() {
		if (!name) return;
		try {
			const res = await fetch(
				`${bridgeServer()}/api/map?name=${encodeURIComponent(
					name,
				)}&gamemode=bhop`,
			);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			setPinned(await res.json());
		} catch {
			// Server not running yet: keep trying, so the source fills in once it is.
			retry = window.setTimeout(load, 2000);
		}
	}
	void load();
	onCleanup(() => clearTimeout(retry));

	const displayName = () => map()?.name ?? name ?? "";

	// Size the name as large as fits in MAX_NAME_WIDTH of the source, up to MAX_NAME_SIZE:
	// measure it at 100px and scale. Refit when the name changes, the source is resized,
	// or fonts load.
	let nameEl: HTMLElement | undefined;
	const [viewportWidth, setViewportWidth] = createSignal(innerWidth);
	const onResize = () => setViewportWidth(innerWidth);
	addEventListener("resize", onResize);
	onCleanup(() => removeEventListener("resize", onResize));

	function fitName() {
		if (!nameEl) return;
		nameEl.style.fontSize = "100px";
		const width = nameEl.getBoundingClientRect().width;
		if (!width) return;
		const size = Math.min(
			(100 * viewportWidth() * MAX_NAME_WIDTH) / width,
			MAX_NAME_SIZE,
		);
		nameEl.style.fontSize = `${size}px`;
	}
	createEffect(
		() => [displayName(), viewportWidth()],
		() => fitName(),
	);
	void document.fonts.ready.then(fitName);

	// A pinned name shows straight away; image and tier fill in once the bridge answers,
	// so with the bridge down you see the name rather than nothing. A following source
	// shows nothing until the bridge has a map for its slot.
	return (
		<Show when={displayName()}>
			<main class="relative h-screen w-screen overflow-hidden">
				<Show when={map()?.image}>
					{(image) => <TintedImage src={image()} />}
				</Show>
				{/* Darkens the bottom so the white text stays readable on bright images. */}
				<div class="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/70 to-transparent" />
				<div class="absolute inset-x-0 bottom-0 p-5">
					{/* line-height: normal uses the font's own ascent and descent, so descenders
					    (p, g) always fit above the tier; the em padding scales the gap with it. */}
					<p
						ref={(el) => {
							nameEl = el;
						}}
						class="inline-block pb-[0.06em] font-bold [line-height:normal] whitespace-nowrap text-white"
					>
						{displayName()}
					</p>
					<Show when={map()}>
						{(map) => (
							<p class="text-[42px] leading-none font-semibold text-white/65">
								{map().tier == null ? "Tier ?" : `Tier ${map().tier}`}
							</p>
						)}
					</Show>
				</div>
			</main>
		</Show>
	);
}
