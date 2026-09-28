/**
 * The overlay's image treatment: greyscale, then tinted with --overlay-brown.
 * The colour blend keeps the image's light and dark and takes the brown's hue;
 * swap mix-blend-color for mix-blend-multiply for a darker result.
 * Fills its (positioned) parent.
 *
 * `isolate` keeps the blend inside this wrapper. Without it, inside a clipped
 * rounded parent Chromium blended the tint with the parent's background
 * instead of the image, and the image disappeared.
 */
export function TintedImage(props: { src: string; alt?: string }) {
	return (
		<div class="absolute inset-0 isolate">
			<img
				src={props.src}
				alt={props.alt ?? ""}
				class="absolute inset-0 h-full w-full object-cover grayscale"
			/>
			<div class="absolute inset-0 bg-(--overlay-brown) mix-blend-color" />
		</div>
	);
}
