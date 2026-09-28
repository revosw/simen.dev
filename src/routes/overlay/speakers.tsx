import { For } from "solid-js";
import { PearlSlot } from "../../components/overlay/PearlSlot";
import { type Pearl, useOverlayState } from "../../components/overlay/state";

// Order the pearls are collected in Wind Waker.
const SLOTS: Pearl[] = ["din", "farore", "nayru"];

/** OBS browser source: the three speaker slots (me, co-hosts, guests). */
export default function SpeakersOverlay() {
	const state = useOverlayState();

	return (
		<main class="flex gap-6 p-4 pb-8">
			<For each={SLOTS}>
				{(pearl) => (
					<PearlSlot pearl={pearl} speaker={state().speakers[pearl]} />
				)}
			</For>
		</main>
	);
}
