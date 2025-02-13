"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CaretDown, PaperPlaneRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { MessageItem } from "./message";
import { Message, ChatRequestOptions } from "ai";
import ChatMessage from "./chat-message";
import {
    ChatBubble,
    ChatBubbleMessage,
  } from "../ui/chat/chat-bubble";
import Avatar from "@/components/avatar-wrapper";
import useCharacter from "@/lib/store/character-store";
import { WaterBubble } from "../ui/water-bubble";
import { ThinkingBubble } from "../ui/chat/thinking-bubble";

interface ChatListProps {
    messages: Message[];
    isLoading: boolean;
    loadingSubmit?: boolean;
    play: (message: Message) => void;
    reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
  }

export function ChatList({ messages, isLoading, loadingSubmit, play, reload }: ChatListProps) {
    const character = useCharacter((state) => state.currentCharacter);
    return (
        <div className="w-full flex justify-center absolute bottom-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%]">
            <div className="relative w-full max-w-3xl bg-transparent rounded-lg shadow-sm overflow-y-auto">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        initial={{ height: 0, opacity: 0.2 }}
                        animate={{ height: 350, opacity: 1 }}
                        exit={{ height: 0, opacity: 0, transition: { duration: 0.2 }, y: 100 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="w-full"
                    >
                        <div className="px-4 py-2 mb-4 flex gap-2 flex-col-reverse">
                            <div className="space-y-4">
                                {messages.map((message, index) => (
                                    <ChatMessage 
                                        key={index} 
                                        message={message} 
                                        isLast={index === messages.length - 1} 
                                        isLoading={isLoading} 
                                        reload={reload} 
                                        play={play} 
                                    />
                                ))}
                                {loadingSubmit && (
                                    <ChatBubble variant="received">
                                        <Avatar
                                            src={character?.avatar || "/image/radien.jpg"}
                                            fallback={character?.name || "AI"}
                                        />
                                        <ThinkingBubble className="relative p-2 opacity-95 backdrop-blur-sm bg-accent w-[56px] min-h-[56px]">
                                            <WaterBubble className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" variant="loading" />
                                        </ThinkingBubble>
                                    </ChatBubble>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
