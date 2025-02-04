import Image from "next/image";
import Live2DWrapper from "@/components/live2d/live-2d-wrapper";
import { InitTTSModel } from "@/components/voice/init-tts";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
export default function Home() {
  return (
      <SidebarProvider>
        <AppSidebar />
        <main className="gap-4 row-start-2 items-center sm:items-start font-[family-name:var(--font-geist-sans)]">
              <div className="w-screen h-14 sticky z-50 top-0 bg-sidebar border-b border-sidebar-border flex items-center justify-start px-2">
                <SidebarTrigger className="hover:bg-[color:#edf2fb] transition-all rounded-full duration-300" />
              </div>
            <div className="w-full h-fullitems-center justify-start min-h-screen sm:p-8 ">
              <InitTTSModel />
              <div className="w-full h-full flex justify-start items-start">
                <Live2DWrapper />
              </div>
          </div>
        </main>
      </SidebarProvider>
  );
}
