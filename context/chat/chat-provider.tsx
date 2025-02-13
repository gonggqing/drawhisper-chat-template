"use client";

import { ChatContext, ChatContextType } from "./chat-context";

export const ChatProvider = ({ children, data }: { children: React.ReactNode, data: ChatContextType }) => {
    return (
        <ChatContext.Provider value={data}>
            {children}
        </ChatContext.Provider>
    )
}