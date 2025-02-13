"use client";

import Live2DWrapper from "@/components/live2d/live-2d-wrapper";
import { notFound } from "next/navigation";
import useChatStore from "@/lib/store/chat-store";
import { ChatProvider } from "@/context/chat/chat-provider";
import { ChatClient } from "@/components/chat/chat-client";
import * as React from "react";


export default function Page({ params }: { params: any }) {

  const { id } = React.use(params) as { id: string };

  const getChatById = useChatStore((state) => state.getChatById);
  const chat = getChatById(id);

  if (!chat) {
    return notFound();
  }

  return (
    <ChatProvider data={{ chat }}>
      <div className="absolute -translate-x-1/2 left-1/2 bottom-2 flex flex-col gap-2 select-none">
        <ChatClient initialMessages={chat.messages} id={id} isMobile={false} />
      </div>
    </ChatProvider>
  );
}