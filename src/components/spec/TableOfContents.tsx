import { For, Show, createEffect, createSignal } from "solid-js";

type Heading = { id: string; title: string };
type Entry = Heading & { children: Heading[] };

// How far below the top of the viewport a heading must pass before its
// section counts as the one being read.
const ACTIVE_OFFSET = 120;

function readOutline(article: HTMLElement): Entry[] {
	const outline: Entry[] = [];
	for (const el of article.querySelectorAll<HTMLElement>("h2[id], h3[id]")) {
		const heading = {
			id: el.id,
			title: el.dataset.tocTitle ?? el.textContent ?? "",
		};
		if (el.tagName === "H2") outline.push({ ...heading, children: [] });
		else outline.at(-1)?.children.push(heading);
	}
	return outline;
}

/** The id of the last heading in `ids` that has scrolled past the offset line. */
function lastPassed(ids: string[]): string | undefined {
	let passed: string | undefined;
	for (const id of ids) {
		const el = document.getElementById(id);
		if (el && el.getBoundingClientRect().top <= ACTIVE_OFFSET) passed = id;
	}
	return passed;
}

/**
 * Builds itself from the h2/h3 headings (with ids) inside `article`.
 * Subheadings are only listed for the section currently being read.
 */
export function TableOfContents(props: {
	article: () => HTMLElement | undefined;
}) {
	const [outline, setOutline] = createSignal<Entry[]>([]);
	const [activeSection, setActiveSection] = createSignal<string>();
	const [activeSubsection, setActiveSubsection] = createSignal<string>();

	createEffect(props.article, (article) => {
		if (!article) return;
		// Signal writes are batched, so the handlers below use this local copy.
		const entries = readOutline(article);
		setOutline(entries);

		let frame = 0;
		const update = () => {
			frame = 0;
			const passed = lastPassed(entries.map((s) => s.id));
			const section = entries.find((s) => s.id === passed);
			setActiveSection(section?.id);
			setActiveSubsection(
				section ? lastPassed(section.children.map((c) => c.id)) : undefined,
			);
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			cancelAnimationFrame(frame);
		};
	});

	function jumpTo(event: MouseEvent, id: string) {
		event.preventDefault();
		document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
		history.replaceState(history.state, "", `#${id}`);
	}

	const linkClass = (active: boolean) =>
		`block border-l py-1 -ml-px transition-colors ${
			active
				? "border-neutral-900 text-neutral-900"
				: "border-transparent text-neutral-400 hover:text-neutral-700"
		}`;

	return (
		<nav aria-label="Table of contents" class="text-[13px] leading-snug">
			<p class="mb-3 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
				Contents
			</p>
			<ul class="border-l border-neutral-200">
				<For each={outline()}>
					{(section) => (
						<li>
							<a
								href={`#${section.id}`}
								onClick={(e) => jumpTo(e, section.id)}
								class={`${linkClass(
									activeSection() === section.id && !activeSubsection(),
								)} pl-3 ${
									activeSection() === section.id ? "text-neutral-900" : ""
								}`}
							>
								{section.title}
							</a>
							<Show
								when={
									activeSection() === section.id && section.children.length > 0
								}
							>
								<ul class="mb-1">
									<For each={section.children}>
										{(sub) => (
											<li>
												<a
													href={`#${sub.id}`}
													onClick={(e) => jumpTo(e, sub.id)}
													class={`${linkClass(
														activeSubsection() === sub.id,
													)} pl-6`}
												>
													{sub.title}
												</a>
											</li>
										)}
									</For>
								</ul>
							</Show>
						</li>
					)}
				</For>
			</ul>
		</nav>
	);
}
