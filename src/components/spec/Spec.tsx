import type { JSX } from "@solidjs/web";
import { For, createSignal } from "solid-js";
import { TableOfContents } from "./TableOfContents";

/**
 * Building blocks for long-form spec documents: one reading column with an
 * unobtrusive table of contents in the left margin (wide screens only).
 */
export function SpecDocument(props: {
	/** Shown above the title; defaults to "Specification". */
	kind?: string;
	title: string;
	summary: string;
	meta: [label: string, value: string][];
	children: JSX.Element;
}) {
	const [article, setArticle] = createSignal<HTMLElement>();

	return (
		<div class="min-h-screen bg-white text-neutral-800 antialiased">
			<div class="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-[13rem_minmax(0,42rem)] xl:gap-20">
				<aside class="hidden lg:block">
					<div class="sticky top-16 max-h-[calc(100vh-8rem)] overflow-y-auto">
						<TableOfContents article={article} />
					</div>
				</aside>

				<article ref={setArticle} class="spec min-w-0">
					<header class="mb-14 border-b border-neutral-200 pb-10">
						<p class="mb-3 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
							{props.kind ?? "Specification"}
						</p>
						<h1 class="text-3xl font-semibold tracking-tight text-neutral-900">
							{props.title}
						</h1>
						<p class="mt-4 text-lg leading-relaxed text-neutral-600">
							{props.summary}
						</p>
						<dl class="mt-8 grid grid-cols-[max-content_1fr] gap-x-8 gap-y-1.5 text-sm">
							<For each={props.meta}>
								{([label, value]) => (
									<>
										<dt class="text-neutral-400">{label}</dt>
										<dd class="text-neutral-700">{value}</dd>
									</>
								)}
							</For>
						</dl>
					</header>
					{props.children}
				</article>
			</div>
		</div>
	);
}

export function Section(props: {
	id: string;
	number: string;
	title: string;
	children: JSX.Element;
}) {
	return (
		<section class="mb-16">
			<h2 id={props.id} data-toc-title={`${props.number}. ${props.title}`}>
				<span class="mr-3 text-neutral-300 tabular-nums">{props.number}</span>
				{props.title}
			</h2>
			{props.children}
		</section>
	);
}

export function Subsection(props: {
	id: string;
	number: string;
	title: string;
	children: JSX.Element;
}) {
	return (
		<>
			<h3 id={props.id} data-toc-title={props.title}>
				<span class="mr-2.5 text-neutral-300 tabular-nums">{props.number}</span>
				{props.title}
			</h3>
			{props.children}
		</>
	);
}

export function Note(props: { title?: string; children: JSX.Element }) {
	return (
		<aside class="my-6 border-l-2 border-neutral-300 bg-neutral-50 px-5 py-4 text-[15px] text-neutral-600">
			{props.title && (
				<p class="mt-0 mb-1 font-medium text-neutral-800">{props.title}</p>
			)}
			{props.children}
		</aside>
	);
}

/** External link that opens in a new tab. */
export function Ext(props: { href: string; children: JSX.Element }) {
	return (
		<a href={props.href} target="_blank" rel="noopener noreferrer">
			{props.children}
		</a>
	);
}

/** Marks a claim that has not been confirmed against a primary source. */
export function Unverified() {
	return (
		<span class="ml-1 whitespace-nowrap rounded border border-amber-300 px-1 py-px align-[1px] text-[10px] font-medium uppercase tracking-wide text-amber-700">
			Unverified
		</span>
	);
}

export function Table(props: {
	head: string[];
	rows: (string | JSX.Element)[][];
}) {
	return (
		<div class="my-6 overflow-x-auto">
			<table class="w-full border-collapse text-left text-sm">
				<thead>
					<tr class="border-b border-neutral-300">
						<For each={props.head}>
							{(cell) => (
								<th class="py-2 pr-4 align-bottom font-medium text-neutral-900">
									{cell}
								</th>
							)}
						</For>
					</tr>
				</thead>
				<tbody>
					<For each={props.rows}>
						{(row) => (
							<tr class="border-b border-neutral-100">
								<For each={row}>
									{(cell) => (
										<td class="py-2 pr-4 align-top text-neutral-600">{cell}</td>
									)}
								</For>
							</tr>
						)}
					</For>
				</tbody>
			</table>
		</div>
	);
}

/**
 * An image with a caption. `tag` labels what it is, e.g. "Reference" for art to take
 * after, "Placeholder" for the current working version.
 */
export function Figure(props: {
	src: string;
	alt: string;
	tag?: string;
	children?: JSX.Element;
}) {
	return (
		<figure class="my-0">
			<div class="grid place-items-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 p-3">
				<img
					src={props.src}
					alt={props.alt}
					class="max-h-80 w-auto max-w-full object-contain"
					loading="lazy"
				/>
			</div>
			<figcaption class="mt-2 text-[13px] leading-snug text-neutral-500">
				{props.tag && (
					<span class="mr-1.5 font-medium uppercase tracking-wide text-[11px] text-neutral-700">
						{props.tag}
					</span>
				)}
				{props.children}
			</figcaption>
		</figure>
	);
}

/** Figures side by side (stacked on narrow screens). */
export function Figures(props: { children: JSX.Element }) {
	return <div class="my-6 grid gap-6 sm:grid-cols-2">{props.children}</div>;
}

/** Colour swatches with their name, value and use. */
export function Swatches(props: {
	colors: { name: string; value: string; use: string }[];
}) {
	return (
		<ul class="my-6 grid gap-3 !pl-0 sm:grid-cols-2">
			<For each={props.colors}>
				{(c) => (
					<li class="!my-0 flex list-none items-center gap-3 !pl-0">
						<span
							class="size-10 shrink-0 rounded-md border border-black/10"
							style={{ background: c.value }}
						/>
						<span class="text-sm leading-snug">
							<span class="font-medium text-neutral-900">{c.name}</span>{" "}
							<code>{c.value}</code>
							<br />
							<span class="text-neutral-500">{c.use}</span>
						</span>
					</li>
				)}
			</For>
		</ul>
	);
}
