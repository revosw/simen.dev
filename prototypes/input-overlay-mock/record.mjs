// Records mouse movement from the input-overlay plugin's WebSocket to a file, to see
// exactly what the plugin reports in a game (for tuning /overlay/mouse).
// Run with: node record.mjs [seconds]   (default 15), then strafe in-game until it stops.
// Writes mouse-recording.json next to this file.
import { writeFileSync } from "node:fs";

const seconds = Number(process.argv[2]) || 15;
const events = [];
const socket = new WebSocket("ws://localhost:16899/");

socket.onopen = () => console.log(`Recording mouse movement for ${seconds} s... strafe now.`);
socket.onerror = () => {
	console.error("Can't reach input-overlay on ws://localhost:16899/ (is OBS running with its WebSocket server on?)");
	process.exit(1);
};
socket.onmessage = (message) => {
	let event;
	try {
		event = JSON.parse(message.data);
	} catch {
		return;
	}
	if (event.event_type === "mouse_moved" || event.event_type === "mouse_dragged")
		events.push({ t: Number(performance.now().toFixed(2)), time: event.time, x: event.x, y: event.y });
};

setTimeout(() => {
	const file = new URL("./mouse-recording.json", import.meta.url);
	writeFileSync(file, JSON.stringify(events));
	console.log(`Saved ${events.length} mouse events (${(events.length / seconds).toFixed(0)}/s) to ${file.pathname.slice(1)}`);
	socket.close();
	process.exit(0);
}, seconds * 1000);
