import { Show } from "solid-js";
import type { OverlayMap } from "./state";
import { TintedImage } from "./TintedImage";

/** One map in the stream overlay: thumbnail, tier and name. */
export function MapCard(props: { label: string; map: OverlayMap }) {
	return (
		<figure class="w-80 overflow-hidden rounded-lg bg-(--overlay-brown) text-(--overlay-text) shadow-lg">
			<div class="relative aspect-video">
				<Show when={props.map.image}>
					{(image) => <TintedImage src={image()} />}
				</Show>
				<span class="absolute top-2 left-2 rounded bg-(--overlay-brown)/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
					{props.label}
				</span>
			</div>
			<figcaption class="flex items-baseline gap-3 px-3 py-2">
				<span class="shrink-0 text-sm font-semibold tabular-nums opacity-70">
					{props.map.tier == null ? "T?" : `T${props.map.tier}`}
				</span>
				<span class="truncate text-lg font-semibold">{props.map.name}</span>
			</figcaption>
		</figure>
	);
}
