// Installs the bridge as a custom Panorama override in Momentum Mod.
//
//   node install.mjs                 install into the default Steam location
//   node install.mjs --game <dir>    install into another "momentum" folder
//   node install.mjs --uninstall     remove it again
//
// Loading the bridge needs one extra <Frame> in layout/hud/hud.xml. Rather than
// shipping a copy of hud.xml that goes stale, this patches the one from the
// installed game, so re-run it after every Momentum Mod update.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_GAME_DIR = "C:/Program Files (x86)/Steam/steamapps/common/Momentum Mod Playtest/momentum";
const FRAME = '<Frame id="OverlayBridge" src="file://{resources}/layout/hud/overlay-bridge.xml" hittest="false" />';

const args = process.argv.slice(2);
const gameIndex = args.indexOf("--game");
const gameDir = gameIndex === -1 ? DEFAULT_GAME_DIR : args[gameIndex + 1];
const targetDir = join(gameDir, "custom", "OverlayBridge");

if (args.includes("--uninstall")) {
	rmSync(targetDir, { recursive: true, force: true });
	console.log(`Removed ${targetDir}`);
	process.exit(0);
}

const stockHud = join(gameDir, "panorama", "layout", "hud", "hud.xml");
if (!existsSync(stockHud)) {
	console.error(`Could not find ${stockHud}. Pass the game's "momentum" folder with --game.`);
	process.exit(1);
}

const hud = readFileSync(stockHud, "utf8");
const closing = hud.lastIndexOf("</Hud>");
if (closing === -1) {
	console.error("hud.xml has no </Hud> tag; its structure has changed and the patch needs updating.");
	process.exit(1);
}
const patched = `${hud.slice(0, closing)}\t${FRAME}\n\t${hud.slice(closing)}`;

const sourceDir = join(dirname(fileURLToPath(import.meta.url)), "panorama");
rmSync(targetDir, { recursive: true, force: true });
cpSync(sourceDir, join(targetDir, "panorama"), { recursive: true });
mkdirSync(join(targetDir, "panorama", "layout", "hud"), { recursive: true });
writeFileSync(join(targetDir, "panorama", "layout", "hud", "hud.xml"), patched);

console.log(`Installed into ${targetDir}`);
console.log("Start the server (node server.mjs), then launch the game or press F7 in-game to reload Panorama.");
