import { createContext, useContext } from "react";

export interface VoiceType {
    speaker_id: string;
    audio: string;
    reference_text: string;
}

interface VoiceContextType {
    voice: VoiceType | null;
    updateVoice: (newVoice: VoiceType) => void;
    isLoading: boolean;
    error: string | null;
}

export const VoiceContext = createContext<VoiceContextType>({
    voice: null,
    updateVoice: () => {},
    isLoading: false,
    error: null
});

// Custom hook for easier context usage
export function useVoice() {
    const context = useContext(VoiceContext);
    if (!context) {
        throw new Error("useVoice must be used within a VoiceProvider");
    }
    return context;
}