import { For, createSignal } from "solid-js";

const winmd = [
	// 0x0
	{
		name: "MS-DOS Stub (Image Only)",
		bytes: [
			0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00,
			0xff, 0xff, 0x00, 0x00, 0xb8, 0x00, 0x00, 0x00,
		],
		color: "#ff0000",
	},
	// 0x8
	{
		name: "Signature (Image Only)",
		bytes: [0x50, 0x45, 0x00, 0x00],
		color: "#ff0000",
	},
	// 0x16
	{
		name: "COFF File Header (Object and Image)",
		bytes: [
			0x4c, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0xe0, 0x00,
		],
		color: "#ff0000",
	},
	// 0x32
	{ name: "Machine Types", bytes: [0x14, 0xc0], color: "#ff0000" },
	// 0x64
	{ name: "Characteristics", bytes: [0x0f, 0xa0], color: "#ff0000" },
	// Optional Header (Image Only)
	{
		name: "Optional Header (Image Only)",
		bytes: [
			0x0b, 0x02, 0x01, 0x00, 0x06, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00,
		],
		color: "#ff0000",
	},
	// Optional Header Standard Fields (Image Only)
	{
		name: "Optional Header Standard Fields (Image Only)",
		bytes: [
			0x0b, 0x01, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00,
		],
		color: "#ff0000",
	},
	// Optional Header Windows-Specific Fields (Image Only)
	{
		name: "Optional Header Windows-Specific Fields (Image Only)",
		bytes: [
			0x10, 0x00, 0x20, 0x00, 0x00, 0x10, 0x00, 0x00, 0x20, 0x00, 0x00, 0x10,
		],
		color: "#ff0000",
	},
	// Optional Header Data Directories (Image Only)
	{
		name: "Optional Header Data Directories (Image Only)",
		bytes: [
			0x04, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00,
		],
		color: "#ff0000",
	},
];

export function FileFormatVisualizer() {
	let fileinput!: HTMLInputElement;
	const [rows, setRows] = createSignal(0);
	const [highlightedSection, setHighlightedSection] = createSignal("");

	function uploadFile() {
		if (fileinput == null) return;
		fileinput.click();
	}

	async function onUploadFile(files: FileList | null) {
		if (files == null) return;
		const fileAsArrayBuffer = await files[0].arrayBuffer();
		const file = new Uint8Array(fileAsArrayBuffer);
		console.log(file);
		// next step:
	}

	return (
		<>
			<input
				type="file"
				class="hidden"
				ref={(ref) => {
					ref.addEventListener("change", (e) => {
						onUploadFile(ref.files);
					});
					fileinput = ref;
				}}
			/>
			<button
				type="button"
				class="bg-slate-600 text-white rounded-2xl p-2"
				onClick={uploadFile}
			>
				Upload your own WinMD file
			</button>
			<div
				style={{
					"grid-template-rows": `repeat(${rows()}, max-content`,
				}}
				class="grid grid-cols-[repeat(17,max-content)] grid-flow-row-dense grid-rows-[repeat(100,max-content)] gap-2 font-mono text-sm"
			>
				<p aria-hidden="true"></p>
				<p>00</p>
				<p>01</p>
				<p>02</p>
				<p>03</p>
				<p>04</p>
				<p>05</p>
				<p>06</p>
				<p>07</p>
				<p>08</p>
				<p>09</p>
				<p>0A</p>
				<p>0B</p>
				<p>0C</p>
				<p>0D</p>
				<p>0E</p>
				<p>0F</p>

				<div class="grid grid-rows-subgrid grid-cols-subgrid [grid-area:2/1/-1/1] text-[8px] place-items-start justify-items-end">
					<p>0x00000000</p>
					<p>0x00000010</p>
					<p>0x00000020</p>
					<p>0x00000030</p>
					<p>0x00000040</p>
				</div>
				<div class="grid grid-cols-subgrid grid-rows-subgrid [grid-area:2/2/-1/-1]">
					<For each={winmd}>
						{(section) => (
							<For each={section.bytes}>
								{(byte) => (
									<button
										onMouseEnter={() => setHighlightedSection(section.name)}
										type="button"
										class={`uppercase ${
											highlightedSection() === section.name ? "" : ""
										}`}
									>
										{byte.toString(16).padStart(2, "0")}
									</button>
								)}
							</For>
						)}
					</For>
					{/* <div class="bg-amber-400">4D</div>
					<div class="bg-amber-400">5A</div>
					<div class="bg-amber-400">90</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">03</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">04</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">FF</div>
					<div class="bg-amber-400">FF</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">00</div>

					<div class="bg-amber-400">B8</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">04</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">00</div>
					<div class="bg-amber-400">00</div> */}
				</div>
			</div>
		</>
	);
}
