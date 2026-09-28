import solid from "@solidjs/vite-plugin";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	legacy: {
		inconsistentCjsInterop: true,
	},
	plugins: [tailwindcss(), solid()],
});
