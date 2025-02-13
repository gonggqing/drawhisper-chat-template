import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Message } from "ai";
import { createId } from '@paralleldrive/cuid2';


export interface Character {
    id: string;
    name: string;
    avatar: string | null;
    initial_message: string | null;
    description: string | null;
    personality: string | null;
    memory: string | null;
}

interface State {
    currentCharacter: Character | null;
    characters: Record<string, Character>;
}

interface Actions {
    createCharacter: (id: string | undefined, name: string, avatar: string, description: string, memory: string | null, personality: string, initial_message: string) => string;
    getCharacterById: (id: string) => Character | null;
    getCharacters: () => State["characters"];
    setCurrentCharacter: (character: Character) => void;
    getCurrentCharacter: () => Character | null;
    deleteCharacter: (id: string) => void;
    updateCharacter: (id: string, updates: Partial<Omit<Character, 'id'>>) => void;
}

const useCharacterStore = create<State & Actions>()(
    persist(
        (set, get) => ({
            currentCharacter: null,
            characters: {},

            createCharacter: (id, name, avatar, description, memory, personality, initial_message) => {
                if (!id) {
                    id = createId();
                }
                const newCharacter: Character = {
                    id,
                    name,
                    avatar,
                    description,
                    memory,
                    personality,
                    initial_message,
                };

                set((state) => ({
                    characters: {
                        ...state.characters,
                        [id]: newCharacter,
                    },
                }));

                return id;
            },

            getCharacterById: (id) => {
                const state = get();
                return state.characters[id] || null;
            },

            getCharacters: () => get().characters,

            getCurrentCharacter: () => get().currentCharacter,

            setCurrentCharacter: (character) => set({ currentCharacter: character }),

            deleteCharacter: (id) => {
                set((state) => {
                    const { [id]: deleted, ...rest } = state.characters;
                    return { 
                        characters: rest,
                        currentCharacter: state.currentCharacter?.id === id ? null : state.currentCharacter
                    };
                });
            },

            updateCharacter: (id, updates) => {
                set((state) => {
                    const character = state.characters[id];
                    if (!character) return state;

                    const updatedCharacter = {
                        ...character,
                        ...updates,
                    };

                    return {
                        characters: {
                            ...state.characters,
                            [id]: updatedCharacter,
                        },
                        currentCharacter: state.currentCharacter?.id === id 
                            ? updatedCharacter 
                            : state.currentCharacter,
                    };
                });
            },
        }),
        {
            name: "drawhsiper-template-character-store",
        }
    )
)

export default useCharacterStore;