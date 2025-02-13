import { createContext } from "react";
import { Message } from "ai";

interface ChatSession {
    messages: Message[];
    createdAt: string;
    characterId: string;
  }

export interface ChatContextType {
    chat?: ChatSession;
}

export const ChatContext = createContext<ChatContextType>({
    chat: undefined
});