import { createRouter } from "@solidjs/router";
import { lazy } from "solid-js";
import About from "./routes/about";
import Home from "./routes/index";
import NotFound from "./routes/not-found";

const MapsOverlay = lazy(() => import("./routes/overlay/maps"));
const SpeakersOverlay = lazy(() => import("./routes/overlay/speakers"));
const KeysOverlay = lazy(() => import("./routes/overlay/keys"));
const MapOverlay = lazy(() => import("./routes/overlay/map"));
const PearlsOverlay = lazy(() => import("./routes/overlay/pearls"));
const MouseOverlay = lazy(() => import("./routes/overlay/mouse"));
const StreamOverlayBrief = lazy(
	() => import("./routes/commission/stream-overlay-brief"),
);
const StreamOverlaySpec = lazy(
	() => import("./routes/commission/stream-overlay"),
);

export const Router = createRouter({
	routes: [
		{ path: "/", component: Home },
		{ path: "/about", component: About },
		{ path: "/commission/stream-overlay", component: StreamOverlaySpec },
		{ path: "/commission/stream-overlay/brief", component: StreamOverlayBrief },
		{ path: "/overlay/maps", component: MapsOverlay },
		{ path: "/overlay/speakers", component: SpeakersOverlay },
		{ path: "/overlay/keys", component: KeysOverlay },
		{ path: "/overlay/map", component: MapOverlay },
		{ path: "/overlay/pearls", component: PearlsOverlay },
		{ path: "/overlay/mouse", component: MouseOverlay },
		{ path: "*404", component: NotFound },
	],
});
