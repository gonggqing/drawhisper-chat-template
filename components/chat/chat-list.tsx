"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CaretDown, PaperPlaneRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { MessageItem } from "./message";
import { Message } from "ai";


interface ChatListProps {
    messages: Message[];
    isLoading: boolean;
    loadingSubmit?: boolean;
  }

export function ChatList({ messages, isLoading, loadingSubmit }: ChatListProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [historyMessages, setHistoryMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "「神之眼」，即是胸怀大志之人所获的印绶。如果问我有什么志向的话…这个还是保密吧，只是一个微不足道的梦想罢了。"
        },
        {
            id: "2",
            role: "user",
            content: "I'm fine, thank you! I'm a user, I can help you with your questions. "
        }
    ]);

    return (
        <div className="w-full flex justify-center absolute bottom-1/2 left-1/2 -translate-x-1/2">
            <div className="relative w-full max-w-2xl bg-transparent rounded-t-lg shadow-sm overflow-hidden">
                <AnimatePresence mode="popLayout">
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0.2 }}
                            animate={{ height: 300, opacity: 1 }}
                            exit={{ height: 0, opacity: 0, transition: { duration: 0.2 }, y: 100 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className="w-full overflow-hidden"
                        >
                            <div className="h-[300px] px-4 pt-4 overflow-y-auto mb-4 flex gap-2 flex-col-reverse">
                                <div className="space-y-4">
                                    {messages.map((message, index) => (
                                        <MessageItem key={index} message={message} />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="p-4 bg-transparent">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(!isOpen)}
                            className={cn(
                                "h-8 w-8 rounded-full bg-[color:#e2eafc] hover:bg-[color:#d7e3fc] transition-all duration-500 flex-shrink-0",
                                !isOpen && "bg-[color:#d7e3fc]"
                            )}
                        >
                            <CaretDown 
                                size={20} 
                                weight="bold" 
                                className={cn(
                                    "transition-transform duration-300",
                                    isOpen && "transform rotate-180"
                                )} 
                            />
                        </Button>
                        <div className="flex-1 flex items-center gap-2 bg-white rounded-lg p-2">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent outline-none text-sm w-[384px]"
                            />
                            <Button
                                size="icon"
                                className="h-8 w-8 rounded-full bg-[color:#e2eafc] hover:bg-[color:#d7e3fc] text-foreground flex-shrink-0"
                            >
                                <PaperPlaneRight size={20} weight="fill" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
