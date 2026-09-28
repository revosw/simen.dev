import { For } from "solid-js";
import {
	Figure,
	Figures,
	Note,
	Section,
	SpecDocument,
	Subsection,
	Swatches,
	Table,
} from "../../components/spec/Spec";

const IMG = "/briefs/stream-overlay";

/**
 * Where everything sits on the 2560×1440 canvas today (from the OBS scene, rounded).
 * "|" in a name breaks the label onto two lines.
 */
const LAYOUT: {
	name: string;
	x: number;
	y: number;
	w: number;
	h: number;
	tone: string;
}[] = [
	{ name: "Key presses", x: 0, y: 0, w: 357, h: 531, tone: "#a08558" },
	{ name: "Mouse|movement", x: 21, y: 537, w: 308, h: 308, tone: "#8f7a56" },
	{
		name: "Keyboard-hand|camera",
		x: 0,
		y: 867,
		w: 358,
		h: 200,
		tone: "#6f6250",
	},
	{ name: "Mouse-hand|camera", x: 0, y: 1067, w: 358, h: 373, tone: "#6f6250" },
	{ name: "Map info", x: 1556, y: 0, w: 533, h: 200, tone: "#8f7a56" },
	{ name: "Discord guests", x: 2114, y: 45, w: 422, h: 139, tone: "#a08558" },
];

function LayoutMap() {
	return (
		<figure class="my-6">
			<svg
				viewBox="0 0 2560 1440"
				class="w-full rounded-md border border-neutral-200"
				role="img"
				aria-label="Current layout of the overlay elements on the 2560 by 1440 canvas"
			>
				<rect width="2560" height="1440" fill="#4a3f33" />
				<rect x="358" y="201" width="2202" height="1239" fill="#d8d4cc" />
				<text
					x="1459"
					y="840"
					text-anchor="middle"
					font-size="64"
					fill="#6b645a"
				>
					Game (Momentum Mod)
				</text>
				<For each={LAYOUT}>
					{(el) => (
						<g>
							<rect
								x={el.x + 6}
								y={el.y + 6}
								width={el.w - 12}
								height={el.h - 12}
								rx="14"
								fill={el.tone}
								stroke="#f3e9dc"
								stroke-width="4"
							/>
							<text
								text-anchor="middle"
								font-size="34"
								font-weight="600"
								fill="#f3e9dc"
							>
								<For each={el.name.split("|")}>
									{(line, i) => {
										const lines = el.name.split("|").length;
										return (
											<tspan
												x={el.x + el.w / 2}
												y={el.y + el.h / 2 + 12 + (i() - (lines - 1) / 2) * 42}
											>
												{line}
											</tspan>
										);
									}}
								</For>
							</text>
						</g>
					)}
				</For>
			</svg>
			<figcaption class="mt-2 text-[13px] leading-snug text-neutral-500">
				<span class="mr-1.5 text-[11px] font-medium uppercase tracking-wide text-neutral-700">
					Current layout
				</span>
				Everything lives in the dark L-shaped band (left column and top strip)
				around the game. Positions are today&rsquo;s, rounded; propose changes
				freely.
			</figcaption>
		</figure>
	);
}

export default function StreamOverlayBrief() {
	return (
		<SpecDocument
			kind="Artist brief"
			title="Wind Waker stream overlay"
			summary="Everything you need to design the overlay for my Momentum Mod bunny-hopping stream: the six elements it contains, what each one is for, how each one behaves live, and what would help me build your design."
			meta={[
				["From", "Simen"],
				["For", "The overlay artist"],
				["Status", "Final brief"],
				["Updated", "28 September 2026"],
				["Canvas", "2560 × 1440, composed in OBS"],
			]}
		>
			<Section id="about" number="1" title="About this brief">
				<p>
					I stream <strong>Momentum Mod</strong>, a movement game where you
					bunny-hop (jump and strafe in the air to gain speed) through obstacle
					maps. Viewers come to watch the technique, so the overlay shows my
					hands and inputs as clearly as the game itself. The whole overlay is
					themed after <strong>The Legend of Zelda: The Wind Waker</strong>.
				</p>
				<Note title="You have a lot of freedom">
					Everything in this brief is a starting point, not a specification: the
					layout, the shapes, the sizes, the colours and how each element looks
					are all yours to decide. The only requirement I have is that the
					animation isn&rsquo;t noisy (§10).
				</Note>

				<Subsection id="about-read" number="1.1" title="How to read it">
					<ul>
						<li>
							Sections 2 and 3 cover the canvas and the shared visual language
							(colours, image treatment, type).
						</li>
						<li>
							Sections 4 to 9 are the six stream elements, one each: what it is
							for, what it shows today, its states and what would help.
						</li>
						<li>
							Section 10 is how things move; section 11 is how to hand the work
							over.
						</li>
					</ul>
					<p>Images are tagged:</p>
					<ul>
						<li>
							<strong>Reference</strong>: art or ideas to take after.
						</li>
						<li>
							<strong>Recording</strong>: the stream as it looks today (§2).
						</li>
						<li>
							<strong>Placeholder</strong>: the version running on stream today.
							I built these myself to get the behaviour working. They show what
							each element does, not how it has to look; shapes, sizes and looks
							are all open.
						</li>
					</ul>
				</Subsection>

				<Subsection
					id="about-live"
					number="1.2"
					title="The overlay is live, not a picture"
				>
					<p>
						Each element is a separate layer in OBS that updates by itself: keys
						light up as I press them, guests appear when they join the voice
						chat, the map card changes when I load a new map. So it helps most
						to get your art{" "}
						<strong>as separate parts, in each of their states</strong>, rather
						than as one finished image. Photos, avatars, map images, names and
						numbers are filled in live by code, so the design is about the
						frames, surfaces and states around them rather than the content
						itself.
					</p>
				</Subsection>

				<Subsection id="about-theme" number="1.3" title="Theme">
					<p>
						Wind Waker: warm browns and tans and clean cel-shaded shapes.
						Backgrounds and characters are drawn as outlines only, in brown on a
						deep brown background; §8.2 shows Medli and Makar traced that way.
					</p>
					<p>
						Three of the elements each carry a piece of the game, with a
						character nearby:
					</p>
					<Table
						head={["Element", "Idea", "Character"]}
						rows={[
							[
								"Key presses (§6)",
								"The Wind Waker itself: conducting songs",
								"Link with his Wind Waker",
							],
							["Mouse movement (§7)", "The Sploosh Kaboom board", "Salvatore"],
							[
								"Discord guests (§8)",
								"Din's, Farore's and Nayru's Pearls",
								"Makar and Medli",
							],
						]}
					/>
					<p>
						Together they tell a small story: Link conducts at the keys, the
						sages who play along with his songs sit by the guests, and my mouse
						fires shots across Salvatore&rsquo;s Sploosh Kaboom board. These are
						directions, not requirements; how literally you take them is up to
						you.
					</p>
				</Subsection>
			</Section>

			<Section id="layout" number="2" title="Canvas and layout">
				<p>
					The canvas is <strong>2560 × 1440</strong>. The game fills most of it
					(bottom right, about 86% size); the elements live in a dark L-shaped
					band along the top and the left. That band is an existing frame image,
					which you are welcome to redesign as part of this work. The layout
					itself is open too.
				</p>
				<figure class="my-6">
					<video
						src={`${IMG}/stream-recording.mp4`}
						poster={`${IMG}/stream-recording-poster.jpg`}
						controls
						preload="none"
						class="w-full rounded-md border border-neutral-200 bg-neutral-900"
					/>
					<figcaption class="mt-2 text-[13px] leading-snug text-neutral-500">
						<span class="mr-1.5 text-[11px] font-medium uppercase tracking-wide text-neutral-700">
							Recording
						</span>
						A minute of the stream with today&rsquo;s placeholder elements in
						place: keys lighting up, the mouse movement, both cameras, the map
						card and the guest slots.
					</figcaption>
				</figure>
				<Figures>
					<Figure
						src={`${IMG}/ref-frame.png`}
						alt="The current overlay frame: a dark brown band along the top and left with a rounded inner corner"
						tag="Reference"
					>
						The current frame. White is transparent (where the game shows).
					</Figure>
					<Figure
						src={`${IMG}/ref-keys.png`}
						alt="The key press display design: tan and dark brown diamonds"
						tag="Reference"
					>
						The key press design this overlay grew from; its tan and dark brown
						set the palette.
					</Figure>
				</Figures>
				<LayoutMap />
				<Note title="Sizes in this brief">
					All sizes are in canvas pixels at 2560 × 1440. Designing at that size
					(or larger for raster art, see §11) keeps everything sharp on stream.
				</Note>
			</Section>

			<Section id="language" number="3" title="Visual language">
				<Subsection id="language-palette" number="3.1" title="Palette">
					<p>
						Sampled from the key press design. Every element uses these, so they
						are named colours in the code: change one and the whole overlay
						follows. Feel free to refine them; it helps to get the final set as
						named values.
					</p>
					<Swatches
						colors={[
							{
								name: "Brown",
								value: "#4a3f33",
								use: "Dark surfaces, key circles, outline drawings",
							},
							{
								name: "Deep brown",
								value: "#1a1511",
								use: "Background behind outline drawings",
							},
							{
								name: "Tan",
								value: "#a08558",
								use: "Light surfaces, buttons at rest",
							},
							{
								name: "Tan, pressed",
								value: "#cd902b",
								use: "A pressed key (more saturated tan)",
							},
							{
								name: "Edge",
								value: "#cdb5b8",
								use: "Thin light lines and outlines",
							},
							{
								name: "Light",
								value: "#efe3c8",
								use: "Highlights, the mouse trail",
							},
							{ name: "Text", value: "#f3e9dc", use: "Text on dark surfaces" },
						]}
					/>
				</Subsection>

				<Subsection id="language-pearls" number="3.2" title="Pearl colours">
					<p>
						Each Discord guest slot (§8) belongs to one pearl and takes its
						colours from the reference pearls: a body colour for the ring and
						background, a dark colour for the symbol at rest, and a bright one
						for the symbol while that person talks.
					</p>
					<Table
						head={["Pearl", "Body", "Symbol at rest", "Symbol while talking"]}
						rows={[
							[
								"Din (red, fire)",
								<code>#d4810b</code>,
								<code>#a60302</code>,
								<code>#d8432f</code>,
							],
							[
								"Farore (green, wind)",
								<code>#b7d881</code>,
								<code>#0a4400</code>,
								<code>#3ea34c</code>,
							],
							[
								"Nayru (blue, water)",
								<code>#a5b2d4</code>,
								<code>#000549</code>,
								<code>#3a7fd8</code>,
							],
						]}
					/>
				</Subsection>

				<Subsection
					id="language-images"
					number="3.3"
					title="Photos and avatars"
				>
					<p>
						People&rsquo;s avatars and map images are shown{" "}
						<strong>greyscaled, then tinted with the brown</strong> so they sit
						inside the palette whatever their original colours. That is done in
						code, so design around a brown-tinted photo, not a colourful one.
					</p>
				</Subsection>

				<Subsection id="language-type" number="3.4" title="Type">
					<p>
						Today everything uses the system sans-serif in bold. A Wind
						Waker-flavoured display font would be welcome, as long as its
						licence allows use on a live stream and in a web page (the overlay
						runs in OBS as web pages). Numbers (tiers, distances) work best when
						easy to read at a glance.
					</p>
				</Subsection>
			</Section>

			<Section id="mouse-cam" number="4" title="Mouse-hand camera">
				<Subsection id="mouse-cam-what" number="4.1" title="What it is for">
					<p>
						A live camera on my mouse hand. In bunny hopping, most of the skill
						is in the mouse: smooth, timed turns in sync with the strafe keys.
					</p>
				</Subsection>
				<Subsection id="mouse-cam-shows" number="4.2" title="What it shows">
					<ul>
						<li>
							A live video feed (a phone used as a webcam), in the bottom of the
							left column.
						</li>
						<li>
							Ideally the hand and mousepad stay fully visible, so a frame
							outside the video, or a very thin one on top of it, works best.
						</li>
						<li>
							The feed is 16:9 and cropped to fit the column; the crop can
							change. A frame that works at several proportions is ideal.
						</li>
						<li>
							It sits right next to the keyboard camera (§5), so the two would
							look good as a matching pair.
						</li>
					</ul>
				</Subsection>
				<Subsection id="mouse-cam-states" number="4.3" title="States">
					<Table
						head={["State", "When", "Shows"]}
						rows={[
							["Live", "Camera on (almost always)", "Frame around the video"],
							[
								"Camera off",
								"Feed missing or paused",
								"Frame with a placeholder inside (e.g. a pearl or a small illustration)",
							],
						]}
					/>
				</Subsection>
				<Subsection id="mouse-cam-deliver" number="4.4" title="What would help">
					<ul>
						<li>
							The frame, as a separate layer, and the camera-off placeholder.
						</li>
						<li>
							An optional small label (e.g. a mouse icon) if you think it helps.
						</li>
					</ul>
				</Subsection>
			</Section>

			<Section id="keyboard-cam" number="5" title="Keyboard-hand camera">
				<Subsection id="keyboard-cam-what" number="5.1" title="What it is for">
					<p>
						A live camera on my keyboard hand (W, A, S, D, Space). It shows the
						strafe timing that the mouse camera can&rsquo;t.
					</p>
				</Subsection>
				<Subsection id="keyboard-cam-shows" number="5.2" title="What it shows">
					<ul>
						<li>
							A live webcam feed, above the mouse camera in the left column.
						</li>
						<li>
							Same ideas as the mouse camera: the hand stays visible, different
							crops are possible, and the two work well as a pair.
						</li>
					</ul>
				</Subsection>
				<Subsection
					id="keyboard-cam-deliver"
					number="5.3"
					title="What would help"
				>
					<p>
						Same as the mouse camera: frame and camera-off placeholder (and an
						optional keyboard icon). If both frames are the same shape, one
						design in two sizes is fine.
					</p>
				</Subsection>
			</Section>

			<Section id="keys" number="6" title="Key press display">
				<Subsection id="keys-what" number="6.1" title="What it is for">
					<p>
						Shows which keys I am pressing, live. Together with the cameras it
						lets viewers read the rhythm of a bunny hop: strafe left, jump,
						strafe right, jump.
					</p>
				</Subsection>
				<Subsection id="keys-theme" number="6.2" title="Theme: the Wind Waker">
					<p>
						The idea behind this element is the Wind Waker and playing its
						songs. Having <strong>Link with his Wind Waker</strong> close to the
						display would be great; beyond that I have no fixed ideas.
					</p>
					<p>
						A connection you may find useful: in the game, Link conducts songs
						by swinging the baton up, left, right or down in time with the beat.
						Those are the same four directions as W, A, S and D, so the display
						can read as the conducting diagram and my key presses as the beats I
						conduct.
					</p>
					<ul>
						<li>
							Ideally Link doesn&rsquo;t cover the buttons, the cameras or the
							game; the edge of the display or the frame are natural spots.
						</li>
						<li>
							A subtle idle loop (breathing, the baton swaying) is welcome. If
							he reacts to key presses, the reaction should keep up with my
							hands (§10).
						</li>
					</ul>
				</Subsection>
				<Subsection id="keys-shows" number="6.3" title="What it shows">
					<p>
						Six buttons, each a square turned 45° (a diamond):{" "}
						<strong>W, A, S, D</strong> around a dark centre square, then{" "}
						<strong>right mouse button</strong> (duck) and{" "}
						<strong>Space</strong> (jump) below. Each button has a round badge.
						The four direction buttons are split in two: the outer half (with
						the badge) is tan, the inner half is dark, and the four inner halves
						together form the centre square.
					</p>
					<Figures>
						<Figure
							src={`${IMG}/now-keys-rest.png`}
							alt="Placeholder key display at rest"
							tag="Placeholder"
						>
							At rest.
						</Figure>
						<Figure
							src={`${IMG}/now-keys-pressed.png`}
							alt="Placeholder key display with A and Space pressed"
							tag="Placeholder"
						>
							A and Space pressed: tan turns golden and fully opaque; dark parts
							stay dark.
						</Figure>
					</Figures>
					<p>
						Layout: a grid of 80 px cells where each button covers 2 × 2 cells,
						with a 6 px gap, which leaves the same small gap between all
						neighbouring buttons. The whole display is 338 × 510 px. The badges
						are empty today; key letters or small glyphs in them could be nice.
						All of this can change.
					</p>
				</Subsection>
				<Subsection id="keys-states" number="6.4" title="States">
					<Table
						head={["State", "Today", "Notes"]}
						rows={[
							["At rest", "Tan #a08558 at 80% opacity", "Most of the time"],
							[
								"Pressed",
								"Tan #cd902b at 100% opacity",
								"Only the light parts change; the dark half and the badge stay dark",
							],
						]}
					/>
				</Subsection>
				<Subsection id="keys-constraints" number="6.5" title="Worth knowing">
					<ul>
						<li>
							<strong>It needs to read instantly.</strong> A jump tap lasts
							about 60 ms, and strafe keys switch several times a second, so the
							pressed state works best when it shows in a single frame, without
							a build-up animation (§10).
						</li>
						<li>
							Several keys are often pressed at once (e.g. A + Space), so it
							helps if each stays readable.
						</li>
						<li>
							The clearer the difference between rest and pressed, the better.
						</li>
					</ul>
				</Subsection>
				<Subsection id="keys-deliver" number="6.6" title="What would help">
					<ul>
						<li>
							Each of the six buttons as a separate piece, in both states.
						</li>
						<li>
							The mouse and Space icons (and key letters or glyphs if you add
							them).
						</li>
						<li>
							Anything around the buttons (a backplate, a frame), as its own
							layer.
						</li>
					</ul>
				</Subsection>
			</Section>

			<Section id="mouse" number="7" title="Mouse movement display">
				<Subsection id="mouse-what" number="7.1" title="What it is for">
					<p>
						Shows how my mouse is moving: a dot that moves with the mouse on a
						small square surface, leaving a short trail, plus how far the mouse
						has travelled in total. It makes the size and rhythm of each turn
						visible.
					</p>
					<Figures>
						<Figure
							src={`${IMG}/ref-mouse-trail.png`}
							alt="Reference: a mouse path drawn on a square panel with a distance counter"
							tag="Reference"
						>
							The idea: a path on a surface, with the distance in the corner.
						</Figure>
						<Figure
							src={`${IMG}/now-mouse-trail.png`}
							alt="Placeholder mouse movement display mid-strafe"
							tag="Placeholder"
						>
							Mid-strafe: a short, thin streak behind the dot, on an 8 × 8 grid.
						</Figure>
					</Figures>
				</Subsection>
				<Subsection id="mouse-theme" number="7.2" title="Theme: Sploosh Kaboom">
					<p>
						The idea is <strong>Sploosh Kaboom</strong>, Salvatore&rsquo;s
						mini-game on Windfall Island: an 8 × 8 board (rows A–H, columns 1–8)
						where you fire cannonballs to find three hidden squid ships. A miss
						is a &ldquo;Sploosh!&rdquo;, a hit a &ldquo;Kaboom!&rdquo;.
					</p>
					<figure class="my-6">
						<iframe
							src="https://www.youtube-nocookie.com/embed/Tj1u2X7iM2s"
							title="The Legend of Zelda: Wind Waker - sploosh mini game"
							class="aspect-video w-full rounded-md border border-neutral-200"
							allow="encrypted-media; picture-in-picture; fullscreen"
							loading="lazy"
						/>
						<figcaption class="mt-2 text-[13px] leading-snug text-neutral-500">
							<span class="mr-1.5 text-[11px] font-medium uppercase tracking-wide text-neutral-700">
								Reference
							</span>
							How Sploosh Kaboom plays (video by KegRiese).
						</figcaption>
					</figure>
					<ul>
						<li>
							<strong>The surface could be the board.</strong> The placeholder
							already has a grid, which could become the 8 × 8 Sploosh Kaboom
							board.
						</li>
						<li>
							<strong>The distance counter could be his scoreboard</strong>, for
							example with cannonballs or squid icons beside the number.
						</li>
						<li>
							<strong>Salvatore</strong> could sit beside the board. A subtle
							idle loop would be welcome.
						</li>
					</ul>
					<p>
						It could also be gamified: viewers get one bomb for every 100 m I
						move my mouse. The game&rsquo;s splashes, explosions and squid ships
						are great material for moments like that. Everyday movement is best
						kept subtle (§7.4): I move the mouse constantly, so a calm board
						works best.
					</p>
				</Subsection>
				<Subsection id="mouse-shows" number="7.3" title="How it works today">
					<ul>
						<li>
							A square surface, about 310 × 310 px on the canvas, in the left
							column under the key display.
						</li>
						<li>
							The dot follows every mouse movement and springs back to the
							centre within about half a second when the mouse stops.
						</li>
						<li>
							The trail shows only the last <strong>0.2 seconds</strong> of
							movement and fades out fast. Big turns ease towards the edge; the
							dot never leaves the surface.
						</li>
						<li>
							The distance counter (bottom right) counts real mouse distance,
							like &ldquo;154.3 m&rdquo; or &ldquo;1.60 km&rdquo;, and keeps
							growing across streams.
						</li>
					</ul>
				</Subsection>
				<Subsection id="mouse-constraints" number="7.4" title="Worth knowing">
					<ul>
						<li>
							<strong>It needs to be subtle.</strong> In a bhop the mouse moves
							very fast and constantly, so anything bright, glowing or
							long-lasting becomes noise. An earlier version with a glow and a
							long trail was too much.
						</li>
						<li>
							The dot and trail are drawn by code, so a description of their
							look is easier to use than drawn frames.
						</li>
					</ul>
				</Subsection>
				<Subsection id="mouse-deliver" number="7.5" title="What would help">
					<ul>
						<li>
							The surface (for example as the Sploosh Kaboom board): background,
							edge, grid and any markings, as art.
						</li>
						<li>
							The dot and trail as a written style: colour, thickness, how it
							tapers or fades.
						</li>
						<li>The style for the distance number.</li>
					</ul>
				</Subsection>
			</Section>

			<Section id="guests" number="8" title="Discord guests">
				<Subsection id="guests-what" number="8.1" title="What it is for">
					<p>
						Shows who is on the stream with me: I usually have up to two guests
						in a Discord voice chat, so there are three slots, one per goddess
						pearl. It also shows who is talking right now, so viewers can put a
						voice to a face.
					</p>
					<Figures>
						<Figure
							src={`${IMG}/ref-pearls.png`}
							alt="Reference: Din's, Nayru's and Farore's pearls on the Triforce"
							tag="Reference"
						>
							The three pearls. Only the dark symbol in the centre of each is
							used.
						</Figure>
						<Figure
							src={`${IMG}/now-pearls.png`}
							alt="Placeholder guest slots: two taken, one empty"
							tag="Placeholder"
						>
							Din and Farore taken (Farore talking: bright symbol), Nayru empty.
						</Figure>
					</Figures>
				</Subsection>
				<Subsection
					id="guests-theme"
					number="8.2"
					title="Theme: the three pearls"
				>
					<p>
						The idea is Din&rsquo;s, Farore&rsquo;s and Nayru&rsquo;s Pearls,
						one per slot. Story-wise, <strong>Makar and Medli</strong> could be
						around the slots.
					</p>
					<p>
						A pairing that follows the story: Medli, the Rito, is from Dragon
						Roost, the island of Din&rsquo;s Pearl; Makar, the Korok, is from
						Forest Haven, where Farore&rsquo;s Pearl is found. Both play along
						with songs Link conducts, which ties the guests back to the key
						display (§6.2).
					</p>
					<Figures>
						<Figure
							src={`${IMG}/trace-medli.png`}
							alt="Medli traced as a brown outline drawing on a deep brown background"
							tag="Reference"
						>
							Medli, traced as an outline: brown <code>#4a3f33</code> on deep
							brown <code>#1a1511</code>.
						</Figure>
						<Figure
							src={`${IMG}/trace-makar.png`}
							alt="Makar traced as a brown outline drawing on a deep brown background"
							tag="Reference"
						>
							Makar, traced the same way: the outline style for the characters.
						</Figure>
					</Figures>
				</Subsection>
				<Subsection id="guests-shows" number="8.3" title="How it works today">
					<ul>
						<li>
							Three ring-shaped slots in a row: Din, Farore, Nayru. People fill
							them in the order they join the voice chat, and keep their slot
							until they leave.
						</li>
						<li>
							Each ring is 200 px across with a 15 px bevelled edge (outer edge
							up to a high flat band, a step down to a lower flat band, then
							down to the inside), in the pearl&rsquo;s body colour at 30%
							opacity, filled with the same colour at 30%. Slots are 50 px
							apart.
						</li>
						<li>
							<strong>Empty:</strong> the pearl&rsquo;s symbol, large, in its
							dark colour.
						</li>
						<li>
							<strong>Taken:</strong> the person&rsquo;s Discord avatar fills
							the ring (greyscaled and tinted brown, §3.3); the symbol moves
							below it, small, overlapping the ring&rsquo;s bottom edge.
						</li>
						<li>
							<strong>Talking:</strong> that small symbol changes from its dark
							colour to its bright colour. That is the only speaking indicator,
							and it should stay subtle.
						</li>
					</ul>
				</Subsection>
				<Subsection id="guests-states" number="8.4" title="States">
					<Table
						head={["State", "Ring", "Symbol"]}
						rows={[
							[
								"Empty",
								"Ring and fill in the pearl colour",
								"Large, centred, dark colour",
							],
							[
								"Taken, quiet",
								"Ring around the avatar",
								"Small, below, dark colour",
							],
							["Taken, talking", "Unchanged", "Small, below, bright colour"],
						]}
					/>
				</Subsection>
				<Subsection id="guests-deliver" number="8.5" title="What would help">
					<ul>
						<li>
							<strong>The three symbols as clean vector art</strong>, one shape
							each (the placeholder ones are traced from the reference image and
							not perfectly smooth).
						</li>
						<li>
							The ring, either one design I recolour per pearl or three coloured
							versions.
						</li>
						<li>
							The empty-slot design, and anything around the three slots (a
							backplate, labels).
						</li>
					</ul>
				</Subsection>
			</Section>

			<Section id="map" number="9" title="Map info">
				<Subsection id="map-what" number="9.1" title="What it is for">
					<p>
						Tells viewers which map I am playing and how hard it is. Maps are
						rated in tiers from 1 (easy) upwards.
					</p>
					<p>
						This element is the most open of all. It doesn&rsquo;t need the
						map&rsquo;s image in the background; just the map name and tier is
						totally fine. Hell, I am open for just getting rid of map info
						entirely.
					</p>
					<Figure
						src={`${IMG}/now-map.png`}
						alt="Placeholder map card: map image with bhop_3muddz and Tier 7 bottom left"
						tag="Placeholder"
					>
						The current map&rsquo;s image, name and tier.
					</Figure>
				</Subsection>
				<Subsection id="map-shows" number="9.2" title="How it works today">
					<ul>
						<li>
							A card in the top strip, about 530 × 200 px on the canvas, with
							the map&rsquo;s own screenshot filling it (cropped to fit).
						</li>
						<li>
							The map name, bold and bright white, bottom left, and the tier
							(&ldquo;Tier 7&rdquo;) below it, smaller and dimmer. A dark
							gradient behind the text keeps it readable on bright images.
						</li>
						<li>
							Names vary a lot in length (<code>bhop_x</code> to{" "}
							<code>bhop_appaisaniceman_extended</code>); the name shrinks to
							fit, up to a maximum size.
						</li>
						<li>
							It changes by itself when I load a new map. Maps without an image
							show only the name and &ldquo;Tier ?&rdquo;.
						</li>
					</ul>
				</Subsection>
			</Section>

			<Section id="motion" number="10" title="Motion">
				<p>
					Every movement is a reaction to something live. For each element,
					describe it as <strong>in</strong> (when it starts),{" "}
					<strong>hold</strong> (while it lasts) and <strong>out</strong> (when
					it ends), each with a duration, an easing (&ldquo;snappy&rdquo;,
					&ldquo;bouncy overshoot&rdquo;) and what moves. A line like
					&ldquo;Jump pressed: sinks 3 px, 40 ms, sharp; released: back over 120
					ms with a small overshoot&rdquo; is exactly what I can build.
				</p>
				<Table
					head={["Element", "Triggers", "Timing limits"]}
					rows={[
						[
							"Key press display",
							"Key down, key up",
							"In: instant (one frame). Out: 100 ms at most. Taps are ~60 ms.",
						],
						[
							"Mouse movement",
							"Every mouse movement",
							"Drawn live; describe the look, not frames.",
						],
						[
							"Discord guests",
							"Someone joins or leaves, starts or stops talking",
							"Join and leave can be expressive (0.3–0.6 s). Talking: subtle, ~150 ms.",
						],
						[
							"Map info",
							"Map changes",
							"Can be expressive; it happens a few times per stream.",
						],
						[
							"Cameras",
							"Camera on or off",
							"Optional; a short fade is enough.",
						],
					]}
				/>
				<Note title="The one requirement: calm animation">
					The animation shouldn&rsquo;t be noisy. My hands move constantly, so
					anything tied to them (keys, mouse) is best kept quick, small and
					never lagging behind: streams run at 30 or 60 frames per second, so a
					key tap may only be on screen for two frames. Save expressive motion
					for rare moments like guests joining and maps changing, where Wind
					Waker&rsquo;s bouncy menu feel is a great fit.
				</Note>
				<p>
					Formats for motion: a written description as above for anything code
					draws (keys, pearls, map card); <strong>Rive</strong> or{" "}
					<strong>Lottie</strong> for richer vector animations; a numbered PNG
					sequence for frame-by-frame effects; WebM with transparency only for
					non-interactive pieces such as a &ldquo;starting soon&rdquo; loop.
				</p>
			</Section>

			<Section id="handover" number="11" title="Handover">
				<Subsection
					id="handover-formats"
					number="11.1"
					title="Formats that work best"
				>
					<ul>
						<li>
							<strong>Flat shapes</strong> (buttons, rings, frames, symbols):
							SVG, with each part on its own layer and named meaningfully (
							<code>forward</code>, <code>forward-pressed</code>,{" "}
							<code>ring-din</code>). Text converted to shapes unless it is
							meant to stay text; no photos embedded in the SVG.
						</li>
						<li>
							<strong>Painted or textured art</strong>: one PNG (or WebP) per
							part and state, on a transparent background, at twice the size it
							is shown at.
						</li>
						<li>The palette as named colour values (§3.1).</li>
					</ul>
				</Subsection>
				<Subsection id="handover-checklist" number="11.2" title="Checklist">
					<Table
						head={["Element", "Parts", "States"]}
						rows={[
							["Frame", "The L-shaped band (optional redesign)", "One"],
							[
								"Mouse-hand camera",
								"Frame, camera-off placeholder",
								"Live, off",
							],
							[
								"Keyboard-hand camera",
								"Frame, camera-off placeholder",
								"Live, off",
							],
							[
								"Key press display",
								"6 buttons, 2 icons (+ letters)",
								"Rest, pressed",
							],
							[
								"Mouse movement",
								"Surface, number style, trail description",
								"One",
							],
							[
								"Discord guests",
								"3 symbols, ring(s), empty slot",
								"Empty, quiet, talking",
							],
							[
								"Map info",
								"Whatever you keep: card, name and tier style",
								"Depends on the design",
							],
							[
								"Characters",
								"Link, Salvatore, Makar and Medli (each its own layer)",
								"At rest, plus any idle or reaction loops",
							],
						]}
					/>
				</Subsection>
				<Subsection id="handover-rights" number="11.3" title="Files and rights">
					<ul>
						<li>
							The editable source files (Figma, Illustrator, Affinity, Procreate
							or similar), not only the exports: I will split, recolour and
							rebuild parts in code.
						</li>
						<li>
							Permission to modify the art and to use it on stream and in these
							web pages.
						</li>
						<li>Any font licensed for streaming and web use.</li>
					</ul>
				</Subsection>
			</Section>

			<Section id="questions" number="12" title="Open questions">
				<p>Things I would like your opinion on:</p>
				<ol>
					<li>
						A music &ldquo;now playing&rdquo; element may come later; leaving
						room for it in the design would help.
					</li>
				</ol>
			</Section>
		</SpecDocument>
	);
}
