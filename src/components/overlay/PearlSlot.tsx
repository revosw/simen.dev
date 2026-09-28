import { Show } from "solid-js";
import type { Pearl, Speaker } from "./state";
import { TintedImage } from "./TintedImage";

const PEARLS: Record<Pearl, { label: string; color: string }> = {
	din: { label: "Din's Pearl", color: "#d8432f" },
	farore: { label: "Farore's Pearl", color: "#3ea34c" },
	nayru: { label: "Nayru's Pearl", color: "#3a7fd8" },
};

const sphere = (color: string, shine: string) =>
	`radial-gradient(circle at 35% 30%, ${shine} 0 8%, transparent 30%), radial-gradient(circle at 50% 55%, ${color}, color-mix(in srgb, ${color}, black 45%))`;

/**
 * Placeholder until there are pearl icons: a shaded sphere in the pearl's colour.
 * Unlit, the colour is mixed into the overlay brown; lit, it is the full colour.
 * The lit layer fades in over the unlit one, since gradients can't be transitioned.
 */
function PearlIcon(props: { pearl: Pearl; lit: boolean; class?: string }) {
	const color = () => PEARLS[props.pearl].color;
	return (
		<div
			role="img"
			aria-label={PEARLS[props.pearl].label}
			class={`overflow-hidden rounded-full shadow-md ${props.class ?? ""}`}
			style={{
				background: sphere(
					`color-mix(in srgb, ${color()} 35%, var(--overlay-brown))`,
					"#fff3",
				),
			}}
		>
			<div
				class={`size-full transition-opacity duration-150 ${
					props.lit ? "opacity-100" : "opacity-0"
				}`}
				style={{ background: sphere(color(), "#fff9") }}
			/>
		</div>
	);
}

/**
 * One speaker slot (co-host or guest). Empty: the circle holds the pearl.
 * Taken: the speaker's avatar fills the circle and the pearl overlaps its bottom edge,
 * lit while they are speaking.
 */
export function PearlSlot(props: { pearl: Pearl; speaker: Speaker | null }) {
	return (
		<div class="relative size-24" title={props.speaker?.name}>
			<div class="relative size-full overflow-hidden rounded-full border-2 border-(--overlay-text)/70 bg-(--overlay-brown) shadow-lg">
				<Show
					when={props.speaker}
					fallback={
						<div class="grid size-full place-items-center">
							<PearlIcon pearl={props.pearl} lit class="size-10 opacity-80" />
						</div>
					}
				>
					{(speaker) => (
						<Show
							when={speaker().image}
							fallback={
								<div class="grid size-full place-items-center text-3xl font-semibold text-(--overlay-text)">
									{speaker().name.charAt(0).toUpperCase()}
								</div>
							}
						>
							{(image) => <TintedImage src={image()} alt={speaker().name} />}
						</Show>
					)}
				</Show>
			</div>
			<Show when={props.speaker}>
				{(speaker) => (
					// Lights up while the speaker is talking: the only speaking indicator.
					<PearlIcon
						pearl={props.pearl}
						lit={speaker().speaking}
						class="absolute -bottom-3 left-1/2 size-8 -translate-x-1/2 ring-2 ring-(--overlay-brown)"
					/>
				)}
			</Show>
		</div>
	);
}
