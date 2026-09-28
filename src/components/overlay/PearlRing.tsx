import { For, Show } from "solid-js";
import { PEARL_SYMBOLS } from "./pearlSymbols";
import type { Pearl, Speaker } from "./state";
import { TintedImage } from "./TintedImage";

const RADIUS = 100;
const RING = 15; // bevel thickness

/*
 * The ring's cross-section, outer edge to inner edge, as heights:
 * 0 -> 2 (slope up), 2 (flat), 2 -> 1 (slope down), 1 (flat), 1 -> 0 (slope down).
 * Light comes from the top-left: a slope facing outwards is lit on the ring's
 * top-left and shaded bottom-right, a slope facing inwards the other way round.
 */
type Band = { width: number; shade: "outward" | "inward" | "high" | "low" };
const PROFILE: Band[] = [
	{ width: 3, shade: "outward" }, // 0 -> 2
	{ width: 5, shade: "high" }, // 2
	{ width: 2, shade: "inward" }, // 2 -> 1
	{ width: 3, shade: "low" }, // 1
	{ width: 2, shade: "inward" }, // 1 -> 0
];

/** Each band as a circle stroke: its centre radius and width. */
const bands = PROFILE.reduce<(Band & { r: number })[]>((acc, band) => {
	const outer = RADIUS - acc.reduce((sum, b) => sum + b.width, 0);
	acc.push({ ...band, r: outer - band.width / 2 });
	return acc;
}, []);

/**
 * Per pearl, from the reference pearls: body is the pearl's own colour (ring and
 * background), dark is its symbol at rest, color the symbol while the speaker talks.
 */
const PEARLS: Record<
	Pearl,
	{ label: string; body: string; dark: string; color: string }
> = {
	din: {
		label: "Din's Pearl",
		body: "#d4810b",
		dark: "#a60302",
		color: "#d8432f",
	},
	farore: {
		label: "Farore's Pearl",
		body: "#b7d881",
		dark: "#0a4400",
		color: "#3ea34c",
	},
	nayru: {
		label: "Nayru's Pearl",
		body: "#a5b2d4",
		dark: "#000549",
		color: "#3a7fd8",
	},
};

/** The ring's shades, from the pearl's body colour: lit slopes, shaded slopes, flats. */
const ringShades = (pearl: Pearl) => {
	const { body, dark } = PEARLS[pearl];
	return {
		light: `color-mix(in srgb, ${body}, white 55%)`,
		shadow: `color-mix(in srgb, ${body}, ${dark} 70%)`,
		high: body, // the upper flat band
		low: `color-mix(in srgb, ${body}, ${dark} 30%)`, // the lower one
	};
};

const RING_OPACITY = 0.3;

function PearlSymbol(props: {
	pearl: Pearl;
	size: number;
	fill: string;
	outline?: boolean;
}) {
	return (
		<svg
			viewBox="0 0 100 100"
			width={props.size}
			height={props.size}
			role="img"
			aria-label={PEARLS[props.pearl].label}
			class="transition-[fill] duration-150"
			style={{
				fill: props.fill,
				...(props.outline
					? {
							stroke: "var(--overlay-edge)",
							"stroke-width": "3",
							"paint-order": "stroke",
						}
					: {}),
			}}
		>
			<path fill-rule="evenodd" d={PEARL_SYMBOLS[props.pearl]} />
		</svg>
	);
}

/** The bevelled ring; see PROFILE. Semi-transparent, in the pearl's colour. */
function BevelRing(props: { pearl: Pearl }) {
	const id = `ring-${props.pearl}`;
	const shade = ringShades(props.pearl);
	const paint: Record<Band["shade"], string> = {
		outward: `url(#${id}-out)`,
		inward: `url(#${id}-in)`,
		high: shade.high,
		low: shade.low,
	};
	return (
		<svg
			viewBox={`${-RADIUS} ${-RADIUS} ${2 * RADIUS} ${2 * RADIUS}`}
			class="absolute inset-0 size-full"
			style={{ opacity: RING_OPACITY }}
			aria-hidden="true"
		>
			<defs>
				<linearGradient id={`${id}-out`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" style={{ "stop-color": shade.light }} />
					<stop offset="1" style={{ "stop-color": shade.shadow }} />
				</linearGradient>
				<linearGradient id={`${id}-in`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" style={{ "stop-color": shade.shadow }} />
					<stop offset="1" style={{ "stop-color": shade.light }} />
				</linearGradient>
			</defs>
			<For each={bands}>
				{(band) => (
					<circle
						r={band.r}
						fill="none"
						stroke-width={band.width}
						style={{ stroke: paint[band.shade] }}
					/>
				)}
			</For>
		</svg>
	);
}

/**
 * One speaker slot: a bevelled ring and background in the pearl's colour. Empty, it
 * holds the pearl's symbol in its dark colour;
 * taken, the speaker's avatar fills it and the symbol sits below, overlapping the
 * ring's bottom edge, dark while they're quiet and in the bright colour while
 * they're speaking.
 */
export function PearlRing(props: { pearl: Pearl; speaker: Speaker | null }) {
	return (
		<div
			class="relative shrink-0"
			style={{ width: `${2 * RADIUS}px`, height: `${2 * RADIUS}px` }}
			title={props.speaker?.name}
		>
			{/* Background inside the ring: the pearl's colour, as translucent as the ring. */}
			<div
				class="absolute rounded-full"
				style={{
					inset: `${RING}px`,
					background: PEARLS[props.pearl].body,
					opacity: RING_OPACITY,
				}}
			/>
			<Show
				when={props.speaker}
				fallback={
					<div class="absolute inset-0 grid place-items-center">
						<PearlSymbol
							pearl={props.pearl}
							size={96}
							fill={PEARLS[props.pearl].dark}
						/>
					</div>
				}
			>
				{(speaker) => (
					<>
						<div
							class="absolute overflow-hidden rounded-full"
							style={{ inset: `${RING}px` }}
						>
							<Show
								when={speaker().image}
								fallback={
									<div class="grid size-full place-items-center bg-(--overlay-brown) text-6xl font-semibold text-(--overlay-text)">
										{speaker().name.charAt(0).toUpperCase()}
									</div>
								}
							>
								{(image) => <TintedImage src={image()} alt={speaker().name} />}
							</Show>
						</div>
						<div class="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
							<PearlSymbol
								pearl={props.pearl}
								size={52}
								fill={
									speaker().speaking
										? PEARLS[props.pearl].color
										: PEARLS[props.pearl].dark
								}
								outline
							/>
						</div>
					</>
				)}
			</Show>
			<BevelRing pearl={props.pearl} />
		</div>
	);
}
