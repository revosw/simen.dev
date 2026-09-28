// Looks up the tier, name and thumbnail of a map on the Momentum Mod API.
// The API only allows CORS from the official dashboard, so the overlay can't
// call it itself; the local server does it instead.

const API = "https://api.momentum-mod.org/v1/maps";

// Momentum's Gamemode enum (panorama/scripts/common/web/enums/gamemode.enum.ts).
export const GAMEMODES = {
	surf: 1,
	bhop: 2,
	bhop_hl1: 3,
	climb_mom: 4,
	climb_kzt: 5,
	climb_16: 6,
	rj: 7,
	sj: 8,
	ahop: 9,
	conc: 10,
	defrag_cpm: 11,
	defrag_vq3: 12,
	defrag_vtg: 13,
};

const TRACK_MAIN = 0;
const STYLE_NORMAL = 0;

const cache = new Map();

/**
 * Tier of the main track, as the in-game map info HUD shows it (common/maps.ts getTier).
 * Uses the given gamemode when the map has a tier for it, otherwise the first
 * gamemode that has one.
 */
function mainTrackTier(leaderboards, gamemode) {
	const main = leaderboards.filter(
		(lb) => lb.trackType === TRACK_MAIN && lb.trackNum === 1 && lb.style === STYLE_NORMAL && lb.tier != null,
	);
	const match = main.find((lb) => lb.gamemode === gamemode) ?? main[0];
	return match ? { tier: match.tier, gamemode: match.gamemode } : { tier: null, gamemode: gamemode ?? null };
}

/** @returns {Promise<{ name: string, tier: number | null, gamemode: number | null, image: string | null }>} */
export async function lookupMap(name, gamemode) {
	const key = `${name}:${gamemode ?? ""}`;
	if (cache.has(key)) return cache.get(key);

	let card = { name, tier: null, gamemode: gamemode ?? null, image: null };
	try {
		const res = await fetch(`${API}/${encodeURIComponent(name)}?expand=leaderboards`);
		if (res.ok) {
			const map = await res.json();
			card = {
				name: map.name,
				...mainTrackTier(map.leaderboards ?? [], gamemode),
				image: map.thumbnail?.large ?? null,
			};
		} else {
			console.warn(`[maps] ${name}: API returned ${res.status}, showing the name only`);
		}
	} catch (error) {
		console.warn(`[maps] ${name}: lookup failed (${error.message}), showing the name only`);
	}

	cache.set(key, card);
	return card;
}
