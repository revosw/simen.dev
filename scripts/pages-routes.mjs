// Runs after `vite build`. GitHub Pages only serves files, so a direct visit to a
// client-side route like /commission/stream-overlay/brief would 404. For every route in
// src/router.tsx this writes a copy of index.html at <route>/index.html (served with
// a 200), plus 404.html so unknown paths still load the app and show its 404 page.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const dist = "dist";
const index = join(dist, "index.html");
const router = readFileSync("src/router.tsx", "utf8");

const routes = [...router.matchAll(/path:\s*"([^"]+)"/g)]
	.map((m) => m[1])
	.filter((path) => path.startsWith("/") && path !== "/" && !path.includes(":"));

for (const route of routes) {
	const target = join(dist, route, "index.html");
	mkdirSync(dirname(target), { recursive: true });
	copyFileSync(index, target);
}
copyFileSync(index, join(dist, "404.html"));

console.log(`pages-routes: wrote index.html for ${routes.length} routes, and 404.html`);
