import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface State {
    voiceProvider: "fish-speech" | "f5-tts" | "sovits";
    voiceAvailable: boolean;
}

interface Actions {
    setVoiceProvider: (voiceProvider: "fish-speech" | "f5-tts" | "sovits") => void;
    setVoiceAvailable: (voiceAvailable: boolean) => void;

    getVoiceProvider: () => State;
}

const useVoiceStore = create<State & Actions>()(
    persist(
        (set, get) => ({
            voiceProvider: "fish-speech",
            voiceAvailable: false,

            setVoiceProvider: (voiceProvider) => set({ voiceProvider }),
            setVoiceAvailable: (voiceAvailable) => set({ voiceAvailable }),

            getVoiceProvider: () => get(),
        }),
        {
            storage: createJSONStorage(() => sessionStorage), // each session should check if the voice provider is available
            name: "drawhsiper-template-voice-store",
        }
    )
)

export default useVoiceStore;