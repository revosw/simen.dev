import { createSignal } from "solid-js";

const winmd = [
    // 0x0
    {section: "", bytes: [], color: "#ff0000"},
    // 0x8
    {section: "", color: "#ff0000"},
    // 0x16
    {section: "", color: "#ff0000"},
    // 0x32
    {section: "", color: "#ff0000"},
    // 0x64
    {section: "", color: "#ff0000"},
]

export function FileFormatVisualizer() {
    let fileinput!: HTMLInputElement;
    const [rows, setRows] = createSignal(0)

    function uploadFile() {
        if (fileinput == null) return;
        fileinput.click()
    }

    async function onUploadFile(files: FileList | null) {
        if (files == null) return;
        const fileAsArrayBuffer = await files[0].arrayBuffer()
        const file = new Uint8Array(fileAsArrayBuffer)
        console.log(file)
        // next step: 
    }

    return (
        <>
            <input type="file" class="hidden" ref={
                ref => {
                    ref.addEventListener("change", e => {
                        onUploadFile(ref.files)
                    })
                    fileinput = ref
                }
            } />
            <button class="bg-slate-600 text-white rounded-2xl p-2" onClick={uploadFile}>Upload your own WinMD file</button>
            <div
                style={{
                    "grid-template-rows": `repeat(${rows()}, max-content`
                }}
                class="grid grid-cols-[repeat(17,max-content)] grid-flow-row-dense grid-rows-[repeat(100,max-content)] gap-2 font-mono text-sm">
                <p aria-hidden></p>
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
                <div class="bg-amber-400">4D</div>
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
                <div class="bg-amber-400">00</div>
                    
                </div>
            </div>
        </>
    )
}