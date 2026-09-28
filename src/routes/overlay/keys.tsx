import {
	type DiamondKey,
	KeyDiamond,
} from "../../components/overlay/KeyDiamond";
import {
	type Binding,
	KEY,
	MOUSE,
	useInputOverlay,
} from "../../components/overlay/inputOverlay";

/**
 * What lights each piece of the diamond. Change here to rebind, e.g. jump on scroll:
 * jump: { kind: "wheel", direction: "down" }.
 */
const BINDINGS: Record<DiamondKey, Binding> = {
	forward: { kind: "key", vk: KEY.W },
	left: { kind: "key", vk: KEY.A },
	back: { kind: "key", vk: KEY.S },
	right: { kind: "key", vk: KEY.D },
	mouse: { kind: "mouse", button: MOUSE.RIGHT },
	jump: { kind: "key", vk: KEY.SPACE },
};

/** OBS browser source: the movement key display, driven by the input-overlay plugin. */
export default function KeysOverlay() {
	const pressed = useInputOverlay(BINDINGS);

	return (
		<main class="p-2">
			<KeyDiamond pressed={(key) => pressed().has(key)} />
		</main>
	);
}
