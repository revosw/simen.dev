// Sends per-jump strafe stats and the current map to a local server
// (prototypes/momentum-bridge/server.mjs).
//
// $.AsyncWebRequest's typed options only cover `type` and `complete`, so the
// data travels as query parameters on a GET, the same way learn.ts uses it.
// localhost and 127.0.0.1 are on the default domain_whitelist.kv3.

const BRIDGE_HOST = 'http://127.0.0.1:8765';
const BRIDGE_URL = `${BRIDGE_HOST}/jump`;

let lastRequestFailed = false;

function send(params: Record<string, string>) {
	const query = Object.keys(params)
		.map((key) => `${key}=${encodeURIComponent(params[key])}`)
		.join('&');

	$.AsyncWebRequest(`${BRIDGE_URL}?${query}`, {
		type: 'GET',
		complete: (data) => {
			// Log only state changes, so a stopped server doesn't spam the console every jump.
			const failed = data.statusText !== 'success';
			if (failed && !lastRequestFailed) $.Warning(`[overlay-bridge] request failed: ${data.statusText}`);
			if (!failed && lastRequestFailed) $.Msg('[overlay-bridge] connected again');
			lastRequestFailed = failed;
		}
	});
}

$.RegisterForUnhandledEvent('OnJumpStarted', () => {
	const jump = MomentumMovementAPI.GetLastJumpStats();
	send({
		jump: jump.jumpCount.toFixed(0),
		strafes: jump.strafeCount.toFixed(0),
		// Sync of the jump that just ended, as a 0-1 fraction.
		sync: jump.strafeSync.toFixed(4),
		// Running sync percentages, same values the strafe sync HUD shows.
		sync1: MomentumPlayerAPI.GetStrafeSync(0).toFixed(2),
		sync2: MomentumPlayerAPI.GetStrafeSync(1).toFixed(2)
	});
});

function sendMap(mapName: string) {
	if (!mapName) return;
	$.AsyncWebRequest(`${BRIDGE_HOST}/map?name=${encodeURIComponent(mapName)}&gamemode=${GameModeAPI.GetCurrentGameMode()}`, {
		type: 'GET',
		complete: () => {}
	});
}

$.RegisterForUnhandledEvent('MapCache_MapLoad', (mapName: string) => sendMap(mapName));
// The HUD may load after the map has, so report the current one straight away too.
sendMap(MapCacheAPI.GetMapName());

$.Msg(`[overlay-bridge] loaded, sending jump stats and map changes to ${BRIDGE_HOST}`);
