"use client";

import Live2DWrapper from "@/components/live2d/live-2d-wrapper";
import { InitTTSModel } from "@/components/voice/init-tts";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const { id } = useParams();
  return (
    <>
        <div className="w-full h-fullitems-center justify-start min-h-screen sm:p-8 ">
            <div className="w-full h-full flex justify-start items-start">
            <Live2DWrapper />
            </div>
        </div>
    </>
  );
}
