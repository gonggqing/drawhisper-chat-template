import Image from "next/image";
import Live2DWrapper from "@/components/live2d/live-2d-wrapper";

export default function Home() {
  return (
    <div className="w-full h-fullitems-center justify-start min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Live 2D Canvas</h1>
        <div className="w-full h-full flex justify-center items-center">
          <Live2DWrapper />
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        
      </footer>
    </div>
  );
}
