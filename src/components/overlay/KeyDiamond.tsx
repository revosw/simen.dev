import type { JSX } from "@solidjs/web";
import { For } from "solid-js";

export type DiamondKey =
	| "forward"
	| "left"
	| "back"
	| "right"
	| "mouse"
	| "jump";

/*
 * Every button is the same square turned 45° (a diamond), so the layout is a grid of
 * CELL-sized tracks where each button spans 2×2 cells, neighbours overlapping by one:
 *
 *        1   2   3   4          cols
 *   1        [ W  ]
 *   2    [ A  ][   ][ D  ]      (W, A, D, S meet in the middle)
 *   3        [ S  ]
 *   4    [ Mouse]
 *   5        [Jump]
 *   6
 *
 * A grid gap g then leaves the same 0.71·g gap between every pair of neighbours.
 * A direction key's outer half (away from the middle) is tan and holds its circle; its
 * inner half is dark, and together the four inner halves form the dark centre square.
 * Pressing a key makes its tan more saturated and the button fully opaque (80% at rest);
 * the dark parts stay dark.
 */
const CELL = 80; // px
const GAP = 6; // px

type Side = "top" | "left" | "right" | "bottom";

const BUTTONS: {
	key: DiamondKey;
	col: number;
	row: number;
	/** Direction keys: which side is the outer (tan) half. */
	outer?: Side;
	/** Circle centre, in % of the button. */
	circle: [number, number];
	icon?: (lit: boolean) => JSX.Element;
}[] = [
	{ key: "forward", col: 2, row: 1, outer: "top", circle: [50, 28.75] },
	{ key: "left", col: 1, row: 2, outer: "left", circle: [28.75, 50] },
	{ key: "right", col: 3, row: 2, outer: "right", circle: [71.25, 50] },
	{ key: "back", col: 2, row: 3, outer: "bottom", circle: [50, 71.25] },
	{
		key: "mouse",
		col: 1,
		row: 4,
		circle: [50, 47.5],
		icon: (lit) => <MouseIcon lit={lit} />,
	},
	{
		key: "jump",
		col: 2,
		row: 5,
		circle: [50, 48],
		icon: (lit) => <SpaceIcon lit={lit} />,
	},
];

// linear-gradient direction from the outer half to the inner half.
const TOWARD_INNER: Record<Side, string> = {
	top: "to bottom",
	left: "to right",
	right: "to left",
	bottom: "to top",
};

const tan = (lit: boolean) =>
	lit ? "var(--overlay-tan-pressed)" : "var(--overlay-tan)";
const iconStroke = (lit: boolean) =>
	lit ? "stroke-(--overlay-tan-pressed)" : "stroke-(--overlay-tan)";

function MouseIcon(props: { lit: boolean }) {
	return (
		<g
			class={`fill-none [stroke-width:2.5] [stroke-linecap:round] ${iconStroke(
				props.lit,
			)}`}
		>
			<rect x={-8} y={-11} width={16} height={22} rx={8} />
			<path d="M0 -11 V-3 M-8 -3 H8" />
			{/* click marks */}
			<path d="M11 -12 l3 -3 M12 -7 h4 M8 -15 v-3" />
		</g>
	);
}

function SpaceIcon(props: { lit: boolean }) {
	return (
		<path
			d="M-11 -3 V3 H11 V-3"
			class={`fill-none [stroke-width:3] [stroke-linejoin:round] ${iconStroke(
				props.lit,
			)}`}
		/>
	);
}

/** The Wind Waker-style movement key display. `pressed(key)` decides what is lit. */
export function KeyDiamond(props: { pressed: (key: DiamondKey) => boolean }) {
	return (
		<div
			role="img"
			aria-label="Pressed keys"
			class="grid"
			style={{
				"grid-template-columns": `repeat(4, ${CELL}px)`,
				"grid-template-rows": `repeat(6, ${CELL}px)`,
				gap: `${GAP}px`,
			}}
		>
			<For each={BUTTONS}>
				{(b) => {
					const lit = () => props.pressed(b.key);
					// Direction keys: tan outer half, dark inner half.
					const background = () =>
						b.outer
							? `linear-gradient(${TOWARD_INNER[b.outer]}, ${tan(
									lit(),
								)} 50%, var(--overlay-brown) 50%)`
							: tan(lit());
					return (
						<div
							class="relative [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]"
							style={{
								"grid-column": `${b.col} / span 2`,
								"grid-row": `${b.row} / span 2`,
								opacity: lit() ? 1 : 0.8,
								background: background(),
							}}
						>
							<div
								class="absolute grid aspect-square w-[30%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-(--overlay-brown)"
								style={{ left: `${b.circle[0]}%`, top: `${b.circle[1]}%` }}
							>
								{b.icon && (
									<svg
										viewBox="-24 -24 48 48"
										class="size-full"
										aria-hidden="true"
									>
										{b.icon(lit())}
									</svg>
								)}
							</div>
						</div>
					);
				}}
			</For>
		</div>
	);
}
