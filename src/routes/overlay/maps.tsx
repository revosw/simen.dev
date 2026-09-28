import { Show } from "solid-js";
import { MapCard } from "../../components/overlay/MapCard";
import { useOverlayState } from "../../components/overlay/state";

/** OBS browser source: the map being run now and the one up next. */
export default function MapsOverlay() {
	const state = useOverlayState();

	return (
		<main class="flex flex-col gap-4 p-4">
			<Show when={state().current}>
				{(map) => <MapCard label="Now" map={map()} />}
			</Show>
			<Show when={state().next}>
				{(map) => <MapCard label="Next" map={map()} />}
			</Show>
		</main>
	);
}
