import { For } from "solid-js";
import { PearlRing } from "../../components/overlay/PearlRing";
import { type Pearl, useOverlayState } from "../../components/overlay/state";

// Order the pearls are collected in Wind Waker.
const SLOTS: Pearl[] = ["din", "farore", "nayru"];

/**
 * OBS browser source: three bevelled pearl rings, one per speaker slot.
 * 700 × 230: three 200px rings with 50px gaps, plus room for the symbol that hangs
 * below a taken slot.
 */
export default function PearlsOverlay() {
	const state = useOverlayState();

	return (
		<main class="flex gap-[50px]">
			<For each={SLOTS}>
				{(pearl) => (
					<PearlRing pearl={pearl} speaker={state().speakers[pearl]} />
				)}
			</For>
		</main>
	);
}
