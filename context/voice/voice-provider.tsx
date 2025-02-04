"use client";
import { useState, useCallback, useEffect } from "react";
import { VoiceContext, VoiceType } from "./voice-context";

interface VoiceProviderProps {
    children: React.ReactNode;
    data: VoiceType | null;
}

export function VoiceProvider({ children, data }: VoiceProviderProps) {
    const [voice, setVoice] = useState<VoiceType | null>(data);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update voice when data prop changes
    useEffect(() => {
        if (data) {
            setVoice(data);
            setError(null);
        }
    }, [data]);

    const updateVoice = useCallback((newVoice: VoiceType) => {
        setVoice(newVoice);
        setError(null);
    }, []);

    return (
        <VoiceContext.Provider 
            value={{
                voice,
                isLoading,
                error,
                updateVoice
            }}
        >
            {children}
        </VoiceContext.Provider>
    );
}