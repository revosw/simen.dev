// ==UserScript==
// @name         Pearl relay (Discord StreamKit -> overlay bridge)
// @description  Sends who is in the voice channel, and who is talking, to the stream overlay's pearl slots.
// @match        https://streamkit.discord.com/overlay/voice/*
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// @run-at       document-idle
// ==/UserScript==

/*
 * Reads Discord StreamKit's voice widget (the page Discord's app keeps up to date) and
 * mirrors it into the bridge server's three pearl slots (prototypes/momentum-bridge):
 *   GET /speaker?pearl=<slot>&name=<name>&image=<avatar>   someone takes a slot
 *   GET /speaker?pearl=<slot>                             the slot empties
 *   GET /speaking?pearl=<slot>&on=1|0                      talking / quiet
 *
 * People get Din, Farore, Nayru in the order they appear and keep their slot until they
 * leave; a fourth person waits for a free slot. Pin someone with PINNED below.
 *
 * The widget markup (li with data-userid, img avatar with an "avatarSpeaking" class,
 * span name) follows community StreamKit CSS from 2023-2024; class names carry
 * generated suffixes, so they are matched with [class*=...].
 */
(() => {
	"use strict";

	const BRIDGE = "http://127.0.0.1:8765";
	const SLOTS = ["din", "farore", "nayru"];

	/** Discord user ID -> pearl, e.g. { "123456789012345678": "din" } to always put yourself in Din. */
	const PINNED = {};

	// Tampermonkey's request function can reach 127.0.0.1 from this https page; plain fetch
	// (no-cors) is the fallback for testing outside a userscript manager.
	function get(path) {
		return new Promise((resolve, reject) => {
			if (typeof GM_xmlhttpRequest === "function") {
				GM_xmlhttpRequest({ method: "GET", url: BRIDGE + path, timeout: 2000, onload: resolve, onerror: reject, ontimeout: reject });
			} else {
				fetch(BRIDGE + path, { mode: "no-cors" }).then(resolve, reject);
			}
		});
	}

	/** What the widget shows now: [{ id, name, avatar, speaking }] in list order. */
	function readWidget() {
		return [...document.querySelectorAll('li[class*="voiceState"]')].map((li) => {
			const img = li.querySelector('img[class*="avatar"]');
			const name = li.querySelector('span[class*="name"]')?.textContent?.trim() ?? "";
			return {
				id: li.dataset.userid || name,
				name,
				avatar: img?.src ?? "",
				speaking: /avatarSpeaking/.test(img?.className ?? ""),
			};
		});
	}

	/** pearl -> { id, name, avatar, speaking } | null, as last sent to the bridge. */
	let sent = Object.fromEntries(SLOTS.map((s) => [s, null]));
	/** Discord user ID -> pearl, for everyone currently holding a slot. */
	const assigned = new Map();

	const query = (params) =>
		Object.entries(params)
			.filter(([, v]) => v != null && v !== "")
			.map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
			.join("&");

	async function sync(force = false) {
		const people = readWidget();
		const present = new Set(people.map((p) => p.id));

		// Free the slots of people who left.
		for (const [id, pearl] of assigned) if (!present.has(id)) assigned.delete(id);

		// Give newcomers a slot: their pinned pearl if it is free, otherwise the first free one.
		for (const person of people) {
			if (assigned.has(person.id)) continue;
			const taken = new Set(assigned.values());
			const pinned = PINNED[person.id];
			const pearl = pinned && !taken.has(pinned) ? pinned : SLOTS.find((s) => !taken.has(s));
			if (pearl) assigned.set(person.id, pearl);
		}

		const bySlot = Object.fromEntries(SLOTS.map((s) => [s, null]));
		for (const person of people) {
			const pearl = assigned.get(person.id);
			if (pearl) bySlot[pearl] = person;
		}

		for (const pearl of SLOTS) {
			const now = bySlot[pearl];
			const before = sent[pearl];
			const changedPerson = force || now?.id !== before?.id || now?.name !== before?.name || now?.avatar !== before?.avatar;
			if (changedPerson) {
				await get(`/speaker?${query({ pearl, name: now?.name, image: now?.avatar })}`);
				// /speaker resets "speaking", so resend it for someone already talking.
				if (now?.speaking) await get(`/speaking?${query({ pearl, on: 1 })}`);
			} else if (now && now.speaking !== before?.speaking) {
				await get(`/speaking?${query({ pearl, on: now.speaking ? 1 : 0 })}`);
			}
			sent[pearl] = now && { ...now };
		}
	}

	// One sync at a time; changes that arrive meanwhile are folded into the next one.
	// Deliberately no requestAnimationFrame or setTimeout here: browsers pause or slow
	// those in background tabs, and this tab will usually be in the background. DOM
	// mutation callbacks and request replies keep arriving there.
	let dirty = false;
	let forceNext = false;
	let running = false;
	function schedule(force = false) {
		dirty = true;
		if (force) forceNext = true;
		if (!running) void run();
	}
	async function run() {
		running = true;
		while (dirty) {
			dirty = false;
			const force = forceNext;
			forceNext = false;
			await Promise.resolve();
			try {
				await sync(force);
				bridgeUp(true);
			} catch {
				bridgeUp(false);
			}
		}
		running = false;
	}

	// The bridge keeps no state across restarts: when it comes back, send everything again.
	let up = null;
	function bridgeUp(ok) {
		if (ok && up === false) {
			console.info("[pearl relay] bridge is back, resyncing");
			schedule(true);
		}
		if (!ok && up !== false) console.warn(`[pearl relay] can't reach the bridge at ${BRIDGE}; is node server.mjs running?`);
		up = ok;
	}
	// Background tabs slow this down (to once a minute after a while); it only detects a
	// restarted bridge, so that just delays the resync.
	setInterval(() => get("/speaking").then(() => bridgeUp(true), () => bridgeUp(false)), 5000);

	new MutationObserver(() => schedule()).observe(document.body, {
		subtree: true,
		childList: true,
		attributes: true,
		attributeFilter: ["class", "src", "data-userid"],
		characterData: true,
	});
	// First sync also empties slots left over from earlier (manual commands, a previous tab).
	schedule(true);
	console.info("[pearl relay] watching StreamKit, sending to", BRIDGE);
})();
