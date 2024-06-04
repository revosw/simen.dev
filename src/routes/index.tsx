import { A } from "@solidjs/router";
import { FileFormatVisualizer } from "~/components/FileFormatVisualizer";

export default function Home() {
  return (
      <main class="text-center mx-auto text-gray-700 p-4">
        <div>Animation here</div>
          <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">A Grand Tour of the WinMD format</h1>
          <p>For optimal reading experience, read this interactive article on a desktop browser</p>
          <section class="grid grid-cols-[max-content_1fr]">
              <div class="w-[500px]">
                <h2>In the beginning</h2>
                <p>Lorem ipsum dolor sit amet</p>
              </div>
              <div class="mx-auto">
                  <FileFormatVisualizer />
              </div>
          </section>
    </main>
  );
}
