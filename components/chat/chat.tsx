"use client";
import { useParams } from "next/navigation";
import { useContext } from "react";
import { ChatContext } from "@/context/chat/chat-context";
import { ChatClient } from "./chat-client";

export default function Chat() {
    const { chat } = useContext(ChatContext);
    const { id } = useParams();

    return (
        <ChatClient initialMessages={chat?.messages || []} id={id as string} isMobile={false} />
    )

}
