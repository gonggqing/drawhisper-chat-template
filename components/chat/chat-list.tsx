"use client";

import { useEffect, useRef } from "react";
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
import useChatStore from "@/lib/store/chat-store";
import useCharacter from "@/lib/store/character-store";
import { WaterBubble } from "../ui/water-bubble";
import { ThinkingBubble } from "../ui/chat/thinking-bubble";

interface ChatListProps {
    chatId: string;
    messages: Message[];
    isLoading: boolean;
    loadingSubmit?: boolean;
    play: (message: Message) => void;
    reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
  }



export function ChatList({ chatId, messages, isLoading, loadingSubmit, play, reload }: ChatListProps) {
    const getChatById = useChatStore((state) => state.getChatById);
    const currentCharacter = useCharacter((state) => state.currentCharacter);
    const getCharacterById = useCharacter((state) => state.getCharacterById);
    const chatListRef = useRef<HTMLDivElement>(null);

    const chat = getChatById(chatId);
    const character = getCharacterById(chat?.characterId || "default_character");

    useEffect(() => {
        if (chatListRef.current && messages.length > 0) {
            chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
        }
        if (chatListRef.current && isLoading) {
            chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
        }
    }, [messages.length, isLoading])
    return (
        <div className="w-full flex justify-center absolute bottom-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%]">
            <div ref={chatListRef} className="relative w-full max-w-3xl bg-transparent rounded-lg shadow-sm overflow-y-auto">
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
                                        character={character}
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
                                        <ThinkingBubble className="relative p-2 bg-transparent backdrop-blur-sm w-[56px] min-h-[56px]">
                                            <WaterBubble className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
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
