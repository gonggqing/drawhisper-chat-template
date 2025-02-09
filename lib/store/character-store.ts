import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Message } from "ai";
import { createId } from '@paralleldrive/cuid2';


export interface CharacterState {
    id: string;
    name: string;
    avatar: string | null;
    initial_message: string | null;
    description: string | null;
    personality: string | null;
    memory: string | null;
}

interface State {
    current_character: CharacterState | null;
    characters: Record<string, CharacterState>;
}

interface Actions {
    createCharacter: (name: string, avatar: string, description: string, memory: string | null, personality: string, initial_message: string) => string;
    getCharacterById: (id: string) => CharacterState | null;
    getCharacters: () => State["characters"];
    setCurrentCharacter: (character: CharacterState) => void;
    getCurrentCharacter: () => CharacterState | null;
    deleteCharacter: (id: string) => void;
    updateCharacter: (id: string, updates: Partial<Omit<CharacterState, 'id'>>) => void;
}

const useCharacterStore = create<State & Actions>()(
    persist(
        (set, get) => ({
            current_character: null,
            characters: {},

            createCharacter: (name, avatar, description, memory, personality, initial_message) => {
                const id = createId();
                const newCharacter: CharacterState = {
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

            getCurrentCharacter: () => get().current_character,

            setCurrentCharacter: (character) => set({ current_character: character }),

            deleteCharacter: (id) => {
                set((state) => {
                    const { [id]: deleted, ...rest } = state.characters;
                    return { 
                        characters: rest,
                        current_character: state.current_character?.id === id ? null : state.current_character
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
                        current_character: state.current_character?.id === id 
                            ? updatedCharacter 
                            : state.current_character,
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