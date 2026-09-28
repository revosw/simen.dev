import { useLocation } from "@solidjs/router";
import { Loading, Show } from "solid-js";
import Nav from "./components/Nav";
import { Router } from "./router";

// Spec pages (/commission) and OBS overlays (/overlay) render without the site nav.
function SiteNav() {
	const location = useLocation();
	return (
		<Show
			when={
				!["/commission", "/overlay"].some((prefix) =>
					location.pathname.startsWith(prefix),
				)
			}
		>
			<Nav />
		</Show>
	);
}

export default function App() {
	return (
		<Router>
			{(props) => (
				<>
					<SiteNav />
					<Loading>{props.children}</Loading>
				</>
			)}
		</Router>
	);
}
