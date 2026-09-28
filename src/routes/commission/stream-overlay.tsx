import {
	Ext,
	Note,
	Section,
	SpecDocument,
	Subsection,
	Table,
	Unverified,
} from "../../components/spec/Spec";

export default function StreamOverlaySpec() {
	return (
		<SpecDocument
			title="Twitch stream overlay for Momentum Mod"
			summary="Research into which overlay elements are worth putting on a movement-game stream, where each one gets its data, and how live game state can be pulled out of Momentum Mod."
			meta={[
				["Status", "Research draft"],
				["Author", "Simen"],
				["Updated", "26 September 2026"],
				["Scope", "Twitch · OBS · Momentum Mod 0.10.8"],
				["Theme", "The Legend of Zelda: The Wind Waker"],
			]}
		>
			<Section id="job" number="1" title="Job to be done">
				<p>
					<strong>When</strong> I stream Momentum Mod (bhop, surf, climb),{" "}
					<strong>I want</strong> an overlay that shows viewers what my hands
					are doing and how the run is going, <strong>so that</strong> the
					technique behind the movement is readable to people who do not play
					the game, and the stream feels alive between runs.
				</p>

				<Subsection id="job-goals" number="1.1" title="Goals">
					<ul>
						<li>
							Produce a complete catalogue of overlay element types to choose
							from.
						</li>
						<li>
							Identify which elements matter specifically for bunny hopping and
							speedrunning.
						</li>
						<li>
							Establish, with sources, which data Momentum Mod exposes and how
							it can reach a browser overlay.
						</li>
						<li>
							End with a prioritised shortlist and a technical approach that can
							be built.
						</li>
					</ul>
				</Subsection>

				<Subsection id="job-non-goals" number="1.2" title="Non-goals">
					<ul>
						<li>
							Visual design of the overlay. That follows once the element list
							is settled.
						</li>
						<li>Monetisation features beyond standard Twitch alerts.</li>
						<li>
							Anything that reads game memory in a way that could put runs or
							the account at risk.
						</li>
					</ul>
				</Subsection>

				<Subsection id="job-constraints" number="1.3" title="Constraints">
					<ul>
						<li>
							The overlay is a web page loaded as an OBS <em>Browser Source</em>{" "}
							(Chromium/CEF). It cannot receive global keyboard or mouse input
							on its own.
						</li>
						<li>
							Everything runs locally on the streaming PC; no hosted backend.
						</li>
						<li>
							Claims below marked <Unverified /> were not confirmed against a
							primary source and need testing before they are relied on.
						</li>
					</ul>
				</Subsection>

				<Subsection id="job-play-modes" number="1.4" title="Play modes">
					<p>I play two kinds of maps, and they call for different overlays.</p>
					<h4>Completion maps</h4>
					<p>
						Long maps where the goal is to finish at all. What matters is how
						far into the map I am and how long I have been at it, not the run
						time.
					</p>
					<h4>Time maps</h4>
					<p>Maps I route for the best time. Work on them has two phases:</p>
					<ol>
						<li>
							<strong>Routing.</strong> On a new map I work out the route first.
							Once it is routed I know roughly what time the run is routed for.
						</li>
						<li>
							<strong>Execution.</strong> I then try to execute the route. The
							interesting stats here are the retry count and the total number of
							jumps and strafes in a run.
						</li>
					</ol>
					<p>
						The overlay for each mode is proposed in §7, with the data source
						for every stat.
					</p>
				</Subsection>
			</Section>

			<Section id="catalogue" number="2" title="Overlay element catalogue">
				<p>
					Every element a Twitch overlay commonly carries, grouped by purpose.
					Most Twitch-driven elements get their data from{" "}
					<Ext href="https://dev.twitch.tv/docs/eventsub/handling-websocket-events/">
						EventSub over WebSocket
					</Ext>{" "}
					(user access token; max 3 connections, 300 subscriptions each). Hosted
					platforms such as{" "}
					<Ext href="https://docs.streamelements.com/overlays">
						StreamElements
					</Ext>{" "}
					and <Ext href="https://streamlabs.com/stream-widgets">Streamlabs</Ext>{" "}
					wrap the same events behind a single browser-source URL.
				</p>

				<Subsection
					id="catalogue-community"
					number="2.1"
					title="Community and chat"
				>
					<Table
						head={["Element", "Shows", "Data source"]}
						rows={[
							[
								"Chat box",
								"Live chat with emotes and badges",
								<>
									EventSub <code>channel.chat.message</code> (scope{" "}
									<code>user:read:chat</code>) or IRC via{" "}
									<Ext href="https://github.com/tmijs/tmi.js">tmi.js</Ext>.
									Twitch calls EventSub the{" "}
									<Ext href="https://dev.twitch.tv/docs/chat/">
										preferred method
									</Ext>
									.
								</>,
							],
							[
								"Emote wall",
								"Chat emotes animating across the screen",
								"Chat messages",
							],
							[
								"Polls / predictions",
								"Live vote and channel-point bars",
								<>
									<code>channel.poll.*</code>, <code>channel.prediction.*</code>{" "}
									<Unverified />
								</>,
							],
							[
								"Hype train",
								"Level and progress",
								<>
									<code>channel.hype_train.*</code> (v2) <Unverified />
								</>,
							],
						]}
					/>
				</Subsection>

				<Subsection
					id="catalogue-alerts"
					number="2.2"
					title="Alerts and events"
				>
					<Table
						head={["Element", "Shows", "Data source"]}
						rows={[
							[
								"Alert box",
								"Pop-ups for follow, sub, gift, bits, raid, redemption",
								<>
									<code>channel.follow</code> v2, <code>channel.subscribe</code>
									, <code>channel.subscription.gift</code>,{" "}
									<code>channel.cheer</code>, <code>channel.raid</code>,{" "}
									<code>channel.points_custom_reward_redemption.add</code> —{" "}
									<Ext href="https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/">
										subscription types
									</Ext>
								</>,
							],
							[
								"Event list",
								"Last N events",
								"Same events, Helix API for backfill",
							],
							[
								"Stream labels",
								"“Latest follower: X”, top cheerer, etc.",
								"Same events",
							],
							[
								"Ad-break notice",
								"“Ad break — back in 90s”",
								<>
									<code>channel.ad_break.begin</code> (
									<code>channel:read:ads</code>)
								</>,
							],
						]}
					/>
				</Subsection>

				<Subsection
					id="catalogue-progress"
					number="2.3"
					title="Progress and counters"
				>
					<Table
						head={["Element", "Shows", "Data source"]}
						rows={[
							[
								"Goal bar",
								"Progress toward a follower, sub or bits target",
								<>
									<code>channel.goal.*</code> <Unverified />
								</>,
							],
							[
								"Counter",
								"Resets, attempts, falls, deaths",
								"Chat command or hotkey; for Momentum, can be derived from timer events (§5.4)",
							],
							[
								"Timer / countdown",
								"“Starting in 5:00”, uptime, session length",
								<>
									Local clock; <code>stream.online</code> for uptime
								</>,
							],
						]}
					/>
				</Subsection>

				<Subsection
					id="catalogue-ambient"
					number="2.4"
					title="Ambient and framing"
				>
					<Table
						head={["Element", "Shows", "Data source"]}
						rows={[
							[
								"Webcam frame",
								"Border or mask around the camera",
								"Static asset, OBS image-mask filter",
							],
							[
								"Now playing",
								"Track, artist, cover art",
								<>
									<Ext href="https://github.com/univrsal/tuna">Tuna</Ext> OBS
									plugin (Spotify, Windows media controls, window title)
								</>,
							],
							["Clock", "Local time", "Local clock"],
							[
								"Input display",
								"Keys and mouse in real time",
								"Local input hook (§4.1, §6.2)",
							],
						]}
					/>
				</Subsection>

				<Subsection
					id="catalogue-scenes"
					number="2.5"
					title="Scenes and transitions"
				>
					<ul>
						<li>
							<strong>Starting soon / BRB / Ending</strong> — full-screen
							scenes, usually chat + timer + music.
						</li>
						<li>
							<strong>Stinger transitions</strong> — animated wipe between
							scenes, built into OBS.
						</li>
						<li>
							<strong>Automation glue</strong> —{" "}
							<Ext href="https://github.com/Kruiser8/Kruiz-Control">
								Kruiz Control
							</Ext>{" "}
							runs as a browser source and links chat commands, channel points
							and OBS actions without a server.
						</li>
					</ul>
				</Subsection>
			</Section>

			<Section id="speedrunning" number="3" title="Speedrunning overlays">
				<Subsection id="speedrunning-livesplit" number="3.1" title="LiveSplit">
					<p>
						The standard speedrun timer. Its layout is built from components:
						splits, timer, previous segment, sum of best, possible time save.
						Relevant for an overlay:
					</p>
					<ul>
						<li>
							<Ext href="https://github.com/LiveSplit/LiveSplit">
								Built-in server
							</Ext>{" "}
							(Control → Start TCP/WebSocket Server), default port{" "}
							<code>16834</code>, WebSocket at{" "}
							<code>ws://localhost:16834/livesplit</code>.
						</li>
						<li>
							Read commands: <code>getcurrenttime</code>, <code>getdelta</code>,{" "}
							<code>getsplitindex</code>, <code>getcurrentsplitname</code>,{" "}
							<code>getbestpossibletime</code>, <code>getattemptcount</code>,{" "}
							<code>getcurrenttimerphase</code>. Control commands:{" "}
							<code>startorsplit</code>, <code>reset</code>,{" "}
							<code>setgametime</code>.
						</li>
						<li>
							<Ext href="https://github.com/LiveSplit/LiveSplit.AutoSplitters">
								Auto-splitters
							</Ext>{" "}
							(ASL memory scripts or sandboxed WASM) drive the timer from the
							game automatically.
						</li>
					</ul>
					<Note title="No Momentum auto-splitter">
						Momentum Mod does not appear in{" "}
						<code>LiveSplit.AutoSplitters.xml</code> (checked 26 Sep 2026).
						LiveSplit would have to be driven manually or by a helper (§6.4).
					</Note>
				</Subsection>

				<Subsection
					id="speedrunning-services"
					number="3.2"
					title="Run-tracking services"
				>
					<ul>
						<li>
							<strong>splits.io</strong> —{" "}
							<Ext href="https://twos.dev/splitsio.html">shut down</Ext> on 31
							March 2025; export only.
						</li>
						<li>
							<strong>therun.gg</strong> — a{" "}
							<Ext href="https://github.com/therungg/LiveSplit.TheRun">
								LiveSplit component
							</Ext>{" "}
							uploads splits live to{" "}
							<Ext href="https://therun.gg/live">therun.gg/live</Ext>. No public
							read API found.
						</li>
					</ul>
				</Subsection>

				<Subsection id="speedrunning-src" number="3.3" title="speedrun.com">
					<p>
						<Ext href="https://github.com/speedruncomorg/api">API v1</Ext> is
						read-only, needs no key, and allows 100 requests per minute per IP.
						Momentum Mod is listed as game <code>o1y3gzo6</code> with full-game
						categories per mode (Surf, BHop, BHop HL1, Climb, RJ, SJ, AHop,
						Conc, Defrag), no per-level boards.
					</p>
				</Subsection>
			</Section>

			<Section id="movement" number="4" title="Bhop and movement-game overlays">
				<Subsection id="movement-input" number="4.1" title="Input displays">
					<p>
						The most characteristic element of a bhop stream: it shows the
						strafe-and-jump rhythm.
					</p>
					<ul>
						<li>
							<Ext href="https://github.com/univrsal/input-overlay">
								Input Overlay
							</Ext>{" "}
							(OBS plugin, Windows and Linux) — keyboard, mouse and gamepad. Has
							a{" "}
							<Ext href="https://github.com/univrsal/input-overlay/wiki">
								WebSocket server
							</Ext>{" "}
							that pushes JSON input events to browser sources (port{" "}
							<code>16899</code>). Latest release 5.0.6 (Oct 2024); the author
							does not plan major new features.
						</li>
						<li>
							<Ext href="https://github.com/ThoNohT/NohBoard">NohBoard</Ext> —
							Windows keyboard visualiser, captured as a window.
						</li>
					</ul>
					<p>
						Typical keys for bhop: <code>W A S D</code>, jump, duck, plus mouse
						direction (left/right turn), which is what actually drives air
						strafing.
					</p>
				</Subsection>

				<Subsection id="movement-metrics" number="4.2" title="Movement metrics">
					<Table
						head={["Metric", "Meaning"]}
						rows={[
							[
								"Speed",
								"Horizontal velocity in units/s; the headline number in bhop",
							],
							[
								"Strafe sync",
								"How well mouse turn and strafe key line up; a community guide says 80%+ is good",
							],
							["Strafes / jumps", "Count per jump and per run"],
							[
								"Gain",
								"Speed gained per jump, or actual vs. ideal gain per tick",
							],
							[
								"Jump stats",
								"Takeoff speed, strafes, sync, distance and height per jump",
							],
						]}
					/>
					<p>
						Source:{" "}
						<Ext href="https://steamcommunity.com/sharedfiles/filedetails/?id=855292256">
							bhop guide
						</Ext>
						. Momentum defines sync precisely (§5.3).
					</p>
				</Subsection>

				<Subsection
					id="movement-prior-art"
					number="4.3"
					title="Prior art in CS"
				>
					<ul>
						<li>
							<Ext href="https://github.com/shavitush/bhoptimer">
								shavit&rsquo;s bhoptimer
							</Ext>{" "}
							(SourceMod) — HUD with speed, sync, strafes, jumps and keys.
						</li>
						<li>
							<Ext href="https://github.com/KZGlobalTeam/gokz">GOKZ</Ext> /{" "}
							<Ext href="https://github.com/KZGlobalTeam/cs2kz-metamod">
								cs2kz
							</Ext>{" "}
							— KZ timer with jumpstats.
						</li>
						<li>
							<strong>CS2 Game State Integration</strong> — a cfg file makes the
							game POST JSON to a local HTTP endpoint. Carries map, round and
							player state but no movement data. This is the model Momentum
							lacks (§5.2).
						</li>
					</ul>
					<p>
						What bhop streamers commonly show, inferred from these tools: key
						display, speed, sync, timer and PB/WR comparison. <Unverified />
					</p>
				</Subsection>
			</Section>

			<Section id="momentum" number="5" title="Momentum Mod data access">
				<Subsection id="momentum-status" number="5.1" title="Release status">
					<ul>
						<li>
							Public playtest opened with{" "}
							<Ext href="https://blog.momentum-mod.org/posts/changelog/0.10.0/">
								0.10.0 on 3 Oct 2025
							</Ext>
							; the main Steam app is still &ldquo;coming soon&rdquo;.
						</li>
						<li>
							Current version{" "}
							<Ext href="https://blog.momentum-mod.org/posts/changelog/0.10.8/">
								0.10.8 (4 Aug 2026)
							</Ext>{" "}
							added a fully customisable in-game HUD.
						</li>
						<li>
							Strata Source engine. The game C++ is closed; the website, API and
							Panorama UI are open source.
						</li>
						<li>Leaderboards will be wiped at 1.0 and possibly before.</li>
					</ul>
				</Subsection>

				<Subsection
					id="momentum-integrations"
					number="5.2"
					title="Official integrations"
				>
					<p>
						There is <strong>no stream or game-state integration</strong>. The
						feature request,{" "}
						<Ext href="https://github.com/momentum-mod/game/issues/1311">
							game#1311
						</Ext>
						, has been open since April 2021. There is no LiveSplit
						auto-splitter either. Discord rich presence (
						<code>mom_discord_enable</code>) exists but is not a practical data
						feed.
					</p>
				</Subsection>

				<Subsection
					id="momentum-console"
					number="5.3"
					title="Console and cvars"
				>
					<p>
						From the{" "}
						<Ext href="https://docs.momentum-mod.org/">official docs</Ext>:
					</p>
					<ul>
						<li>
							<code>mom_showkeypresses</code> — in-game key display with strafe
							and jump counter.
						</li>
						<li>
							<code>mom_hud_strafesync_type</code> — Sync1 = perfect strafe
							ticks ÷ strafe ticks; Sync2 = accelerating ticks ÷ strafe ticks.
						</li>
						<li>
							<code>mom_api_log_requests</code> — logs API calls to the console,
							which could reveal map loads and submissions. <Unverified />
						</li>
						<li>
							<code>con_logfile</code> / <code>-condebug</code> — standard
							Source log-to-file, not documented for Strata. Timer events are
							not known to print to the console. <Unverified />
						</li>
					</ul>
				</Subsection>

				<Subsection
					id="momentum-panorama"
					number="5.4"
					title="Panorama UI scripting"
				>
					<p>
						The most promising route to real-time data. The HUD is TypeScript +
						XML running in V8 and is{" "}
						<Ext href="https://github.com/momentum-mod/panorama">
							open source
						</Ext>
						. Files in <code>momentum/custom/&lt;Folder&gt;/panorama/</code>{" "}
						override the stock UI and survive updates (
						<Ext href="https://docs.momentum-mod.org/guide/override_custom_assets/">
							guide
						</Ext>
						).
					</p>
					<Table
						head={["API", "Provides"]}
						rows={[
							[
								<code>MomentumTimerAPI</code>,
								"Timer state (disabled, primed, running, finished), run time, current segment and checkpoint, segment count, style, splits",
							],
							[
								<code>MomentumPlayerAPI</code>,
								"Velocity, strafe sync (both types), energy",
							],
							[
								<code>MomentumMovementAPI</code>,
								"Last jump stats: jump count, takeoff speed, strafes, sync, gain, yaw ratio, distance, efficiency",
							],
							[
								<code>MomentumInputAPI</code>,
								"Currently pressed buttons, as the game sees them",
							],
							[
								<code>RunComparisonsAPI</code>,
								"The run being compared against (PB/WR)",
							],
						]}
					/>
					<p>
						Events such as <code>OnObservedTimerStateChange</code>,{" "}
						<code>OnObservedTimerCheckpointProgressed</code> and{" "}
						<code>MapCache_MapLoad</code> let a panel react without polling.
					</p>
					<p>
						<code>$.AsyncWebRequest</code> exists, and the domain whitelist
						allows <code>localhost</code> and <code>127.0.0.1</code>. A hidden
						custom panel could therefore push game state to a local helper,
						which relays it to the overlay.
					</p>
					<Note title="Risk">
						Whether POST requests work in practice, and whether a modified
						Panorama affects run submission or future anti-cheat, is unknown.{" "}
						<Unverified /> Ask the developers on{" "}
						<Ext href="https://discord.com/invite/momentummod">Discord</Ext>{" "}
						before building on it.
					</Note>
				</Subsection>

				<Subsection id="momentum-api" number="5.5" title="Web API">
					<p>
						<code>https://api.momentum-mod.org</code> (NestJS; Swagger at{" "}
						<code>/docs</code>,{" "}
						<Ext href="https://github.com/momentum-mod/website">source</Ext>).
						Tested without authentication:
					</p>
					<ul>
						<li>
							<code>GET /v1/users?steamID=…</code> — resolve Momentum user ID.
						</li>
						<li>
							<code>GET /v1/runs?userID=…&amp;isPB=true&amp;expand=map</code> —
							personal bests.
						</li>
						<li>
							<code>
								GET /v1/maps/{"{id|name}"}
								/leaderboard?gamemode=&amp;trackType=&amp;style=&amp;steamIDs=
							</code>{" "}
							— rank, time and replay download URL.
						</li>
					</ul>
					<p>
						Rate limits: 20 requests per second and 200 per minute.{" "}
						<strong>CORS only allows the official dashboard</strong>, so the
						overlay cannot call it directly; requests must go through a local
						proxy.
					</p>
				</Subsection>

				<Subsection id="momentum-replays" number="5.6" title="Replays">
					<p>
						Leaderboard runs have downloadable replays (MomentumTV). The file
						format is undocumented. <Unverified /> Not needed for a live
						overlay, but could power a &ldquo;WR ghost&rdquo; comparison later.
					</p>
				</Subsection>
			</Section>

			<Section id="architecture" number="6" title="Technical approach">
				<Subsection id="architecture-shape" number="6.1" title="Overall shape">
					<p>
						One local <strong>helper process</strong> collects every data source
						and re-broadcasts it over a single WebSocket. The overlay is a
						static page served from <code>http://localhost</code> (not{" "}
						<code>file://</code>, which{" "}
						<Ext href="https://obsproject.com/forum/threads/way-to-enable-local-file-access-for-obs-browser-source.115344/">
							breaks fetch
						</Ext>
						) and only renders.
					</p>
					<ol>
						<li>
							Game → helper: Panorama panel POSTs to localhost, or log tailing
							as a fallback.
						</li>
						<li>
							Input → helper: Input Overlay WebSocket, or the helper&rsquo;s own
							global hook.
						</li>
						<li>Twitch → helper: EventSub WebSocket and chat.</li>
						<li>Momentum API → helper: polled proxy for PB, rank and WR.</li>
						<li>Helper → overlay: one WebSocket with typed messages.</li>
					</ol>
				</Subsection>

				<Subsection
					id="architecture-input"
					number="6.2"
					title="Keyboard and mouse input"
				>
					<p>
						A browser source never receives global input. In order of effort:
					</p>
					<ol>
						<li>
							Input Overlay&rsquo;s WebSocket (<code>ws://localhost:16899</code>
							) — no code beyond a client.
						</li>
						<li>
							Own helper using a global hook library (for example{" "}
							<code>rdev</code> in Rust or a uiohook binding in Node).{" "}
							<Unverified />
						</li>
						<li>
							<code>MomentumInputAPI</code> through Panorama — shows
							game-registered buttons rather than raw keys, which avoids leaking
							keystrokes typed outside the game.
						</li>
					</ol>
				</Subsection>

				<Subsection
					id="architecture-twitch"
					number="6.3"
					title="Twitch and OBS"
				>
					<ul>
						<li>
							EventSub WebSocket for alerts and chat; subscribe within 10
							seconds of the welcome message.
						</li>
						<li>
							<Ext href="https://github.com/obsproject/obs-websocket">
								OBS WebSocket v5
							</Ext>{" "}
							(bundled since OBS 28, port <code>4455</code>) for scene
							switching, for example BRB scene when the game loses focus.
						</li>
						<li>
							<Ext href="https://github.com/obsproject/obs-browser/blob/master/README.md">
								<code>window.obsstudio</code>
							</Ext>{" "}
							inside the browser source exposes scene and streaming events.
						</li>
					</ul>
				</Subsection>

				<Subsection
					id="architecture-game"
					number="6.4"
					title="Game data options, ranked"
				>
					<Table
						head={["#", "Approach", "Data", "Trade-off"]}
						rows={[
							[
								"1",
								"Momentum web API via proxy",
								"PB, rank, WR per map",
								"Reliable, but not real time",
							],
							[
								"2",
								"Panorama panel → localhost",
								"Timer, splits, speed, sync, jump stats, keys",
								"Richest; unconfirmed, may affect runs",
							],
							[
								"3",
								"Console log tailing",
								"Map loads, possibly API events",
								"Unconfirmed on Strata; limited data",
							],
							[
								"4",
								"LiveSplit driven by helper",
								"Standard split display",
								"Only as good as the feed driving it",
							],
							[
								"5",
								"Memory reading",
								"Anything",
								"Breaks every patch; anti-cheat risk; avoid",
							],
							[
								"6",
								"Screen OCR of the HUD",
								"Timer, speed",
								"Laggy and error-prone; last resort",
							],
						]}
					/>
				</Subsection>
			</Section>

			<Section id="shortlist" number="7" title="Proposed overlay">
				<p>
					A base layer that is always on, plus one panel that changes with the
					play mode (§1.4). The helper can remember the mode per map name,
					switching on <code>MapCache_MapLoad</code>, with a hotkey or chat
					command as an override.
				</p>

				<Subsection id="shortlist-base" number="7.1" title="Always on">
					<ul>
						<li>
							<strong>Input display</strong> — WASD, jump, duck and mouse
							direction.
						</li>
						<li>
							<strong>Speedometer</strong> — current speed, ideally with a small
							graph of the last few seconds.
						</li>
						<li>
							<strong>Chat</strong> — compact, fading out when idle so it does
							not cover the map.
						</li>
						<li>
							<strong>Alerts</strong> — follow, sub, raid, bits.
						</li>
						<li>
							<strong>Speakers</strong> — three circular slots for me and up to
							two co-hosts or guests, one per pearl (Din, Farore, Nayru). An
							empty slot shows its pearl; a taken slot shows the speaker&rsquo;s
							picture, greyscaled and tinted brown, with the pearl overlapping
							its bottom edge.
						</li>
					</ul>
				</Subsection>

				<Subsection
					id="shortlist-routing"
					number="7.2"
					title="Time maps: routing"
				>
					<p>
						While routing, viewers mostly need context: what the route is
						worth.
					</p>
					<Table
						head={["Stat", "Shows", "Source"]}
						rows={[
							[
								"Routed time",
								"The time the finished route is worth, e.g. “routed for ~1:24”",
								"Entered by me once routing is done; stored per map by the helper. The game has no notion of it.",
							],
							[
								"Phase label",
								"“Routing” or “Executing”",
								<>
									Manual toggle. Could follow practice mode automatically (
									<code>OnMomentumPlayerPracticeModeStateChange</code>) if
									routing is done in practice mode.
								</>,
							],
						]}
					/>
				</Subsection>

				<Subsection
					id="shortlist-execution"
					number="7.3"
					title="Time maps: execution"
				>
					<p>
						The core panel for timed maps. Every counter resets when the map
						changes; per-run values reset when the timer starts.
					</p>
					<Table
						head={["Stat", "Shows", "Source"]}
						rows={[
							[
								"Retry count",
								"Attempts on this map this session",
								<>
									<code>OnObservedTimerStateChange</code>: each transition from
									RUNNING to PRIMED or DISABLED is a retry, RUNNING to FINISHED
									a completion. Counting logic is untested. <Unverified />
								</>,
							],
							[
								"Jumps",
								"Total jumps in the current run",
								<>
									Helper counts <code>OnJumpStarted</code> while the timer is
									RUNNING. <code>LastJump.jumpCount</code> is not used because
									its meaning (run total or current chain) is undocumented.
								</>,
							],
							[
								"Strafes",
								"Total strafes in the current run",
								<>
									Sum of <code>LastJump.strafeCount</code> at each jump. Stats
									appear to be reported at the next takeoff, so the final
									airtime before the end zone may be missing. <Unverified />
								</>,
							],
							[
								"Time vs route",
								"Live run time against the routed time; delta on finish",
								<>
									<code>MomentumTimerAPI.GetObservedTimerStatus().runTime</code>{" "}
									plus the routed time from §7.2
								</>,
							],
							[
								"Run sync",
								"Average sync across the run's jumps",
								"Mean of per-jump sync, already sent by the bridge prototype",
							],
						]}
					/>
					<Note title="Built on the bridge prototype">
						The Panorama bridge already sends per-jump sync and strafes.
						Retries, run totals and run time need one more event handler (
						<code>OnObservedTimerStateChange</code>) and a counter in the
						helper.
					</Note>
				</Subsection>

				<Subsection
					id="shortlist-completion"
					number="7.4"
					title="Completion maps"
				>
					<p>Run time matters less here than progress and persistence.</p>
					<Table
						head={["Stat", "Shows", "Source"]}
						rows={[
							[
								"Progress",
								"Stage X of Y, current checkpoint",
								<>
									<code>TimerStatus.majorNum</code> / <code>segmentsCount</code>{" "}
									and <code>minorNum</code>, updated on{" "}
									<code>OnObservedTimerCheckpointProgressed</code>. Field
									meaning is inferred from names. <Unverified />
								</>,
							],
							[
								"Furthest reached",
								"Best stage reached this session",
								"Highest progress value seen by the helper",
							],
							[
								"Time on map",
								"How long I have been on this map",
								<>
									Helper clock started on <code>MapCache_MapLoad</code>
								</>,
							],
							[
								"Falls",
								"Times sent back by a fail teleport",
								<>
									No direct event exists (§8). Only possible with a heuristic on
									velocity and view-angle snaps. <Unverified />
								</>,
							],
						]}
					/>
				</Subsection>

				<Subsection id="shortlist-could" number="7.5" title="Could have">
					<ul>
						<li>Now playing, emote wall, goal bar.</li>
						<li>
							Chat-triggered predictions: &ldquo;PB within the next 10
							attempts?&rdquo;
						</li>
						<li>
							Starting soon / BRB scenes.
						</li>
					</ul>
				</Subsection>
			</Section>

			<Section id="open-questions" number="8" title="Open questions">
				<ol>
					<li>
						Does <code>$.AsyncWebRequest</code> POST to localhost work from a
						custom Panorama panel?
					</li>
					<li>
						Does a custom Panorama override affect run submission or future
						anti-cheat?
					</li>
					<li>
						Does <code>con_logfile</code> work in Strata, and what does it print
						during a run?
					</li>
					<li>
						Is the 0.10.8 HUD Customizer enough to hide in-game elements that
						the overlay duplicates?
					</li>
					<li>
						Which Twitch scopes are required for polls, predictions, hype train
						and goals?
					</li>
					<li>
						Is there any event for the player touching a teleport? Not in
						0.10.8: no Panorama event, no position API, and{" "}
						<code>trigger_teleport</code> has no teleport output. The docs
						describe a &ldquo;Fail Teleport&rdquo; flag that the installed FGD
						lacks, so it is worth asking the developers to expose fail teleports
						as an event.
					</li>
					<li>
						What do <code>LastJump.jumpCount</code> and{" "}
						<code>TimerStatus.majorNum</code> count exactly, and do jump stats
						cover the last airtime before the end zone?
					</li>
				</ol>
			</Section>
		</SpecDocument>
	);
}
