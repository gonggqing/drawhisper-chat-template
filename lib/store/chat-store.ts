import { CoreMessage, generateId, Message } from "ai";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { currentCharacter } from "../character";

interface ChatSession {
  messages: Message[];
  createdAt: string;
  characterId: string;
}

interface State {
  base64Images: string[] | null;
  chats: Record<string, ChatSession>;
  currentChatId: string | null;
  selectedModel: string | null;
}

interface Actions {
  setBase64Images: (base64Images: string[] | null) => void;
  setCurrentChatId: (chatId: string) => void;
  setSelectedModel: (selectedModel: string) => void;
  getChatById: (chatId: string) => ChatSession | undefined;
  getMessagesById: (chatId: string) => Message[];
  saveMessages: (chatId: string, messages: Message[]) => void;
  handleDelete: (chatId: string, messageId?: string) => void;
}

const useChatStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      base64Images: null,
      chats: {},
      currentChatId: null,
      selectedModel: null,

      setBase64Images: (base64Images) => set({ base64Images }),

      setCurrentChatId: (chatId) => set({ currentChatId: chatId }),
      setSelectedModel: (selectedModel) => set({ selectedModel }),
      getChatById: (chatId) => {
        const state = get();
        return state.chats[chatId];
      },
      getMessagesById: (chatId) => {
        const state = get();
        return state.chats[chatId]?.messages || [];
      },
      saveMessages: (chatId, messages) => {
        set((state) => {
          const existingChat = state.chats[chatId];

          return {
            chats: {
              ...state.chats,
              [chatId]: {
                messages: [...messages],
                createdAt: existingChat?.createdAt || new Date().toISOString(),
                characterId: existingChat?.characterId || currentCharacter().id,
              },
            },
          };
        });
      },
      handleDelete: (chatId, messageId) => {
        set((state) => {
          const chat = state.chats[chatId];
          if (!chat) return state;

          // If messageId is provided, delete specific message
          if (messageId) {
            const updatedMessages = chat.messages.filter(
              (message) => message.id !== messageId
            );
            return {
              chats: {
                ...state.chats,
                [chatId]: {
                  ...chat,
                  messages: updatedMessages,
                },
              },
            };
          }

          // If no messageId, delete the entire chat
          const { [chatId]: _, ...remainingChats } = state.chats;
          return {
            chats: remainingChats,
          };
        });
      },
    }),
    {
      name: "drawhsiper-template-chat-store",
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId,
        selectedModel: state.selectedModel,
      }),
    }
  )
);

export default useChatStore;