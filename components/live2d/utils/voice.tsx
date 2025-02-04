"use client";

import axios from "axios";
import { Headset, Play } from "@phosphor-icons/react";
import { 
    DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuContent, 
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useContext, useRef, useCallback } from "react";
import { Live2DContext } from "@/context/live2d/live2d-context";
import { useState, useEffect } from "react";
import { VoiceFile } from "@/lib/tools/load-voice";
import { Slider } from "@/components/ui/slider";
import { useVoice } from "@/context/voice/voice-context";

export const VoiceButton = () => {
    const { controller } = useContext(Live2DContext);
    const [voices, setVoices] = useState<VoiceFile[]>([]);
    const [volume, setVolume] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);
    const voicesFetched = useRef(false);

    const { voice: currentVoice, updateVoice } = useVoice();

    // Move fetch to a separate function with error handling
    const fetchVoices = useCallback(async () => {
        if (voicesFetched.current) return;
        
        try {
            setIsLoading(true);
            const response = await axios.get('/api/voices');
            const { data: { data: voices } } = response;
            setVoices(voices || []);
            voicesFetched.current = true;
        } catch (error) {
            console.error('Failed to fetch voices:', error);
            // Optionally reset the ref to allow retry
            voicesFetched.current = false;
            setVoices([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVoices();
    }, [fetchVoices]);

    // Memoize the play handler
    const handleVoicePlay = useCallback((voice: VoiceFile) => {
        if (!controller || !voice.base64) return;
        controller.speak(voice.base64, undefined, true, volume);
    }, [controller, volume]);

    // Early return for disabled state
    if (!controller) return (
        <Button 
            variant="ghost" 
            size="icon" 
            disabled 
            className="h-9 w-9 bg-[color:#edf2fb] transition-all rounded-full duration-500"
        >
            <Headset size={24} weight="fill" className="text-destructive" />
        </Button>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    disabled={isLoading}
                    className={cn(
                        "h-9 w-9 bg-[color:#edf2fb] hover:bg-[color:#e2eafc] transition-all rounded-full duration-500",
                        isLoading && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <Headset size={24} weight="fill" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                align="start" 
                className="w-56 p-2 bg-[color:#edf2fb] border border-[color:#e2eafc] rounded"
            >
                <DropdownMenuLabel className="text-base text-muted-foreground">
                    Voices
                </DropdownMenuLabel>
                <DropdownMenuItem 
                    onClick={(e) => e.preventDefault()} 
                    className="flex items-center justify-start gap-2"
                >
                    <span className="text-sm">Volume</span>
                    <Slider 
                        value={[volume]} 
                        min={0.1} 
                        max={1} 
                        step={0.1} 
                        onValueChange={(value) => setVolume(value[0])} 
                        className="flex-1"
                    />
                    <p className="text-xs text-muted-foreground w-8 text-right">
                        {volume.toFixed(1)}
                    </p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {voices?.map((voice) => (
                    <DropdownMenuItem 
                        key={voice.name} 
                        className={cn(
                            "flex items-center justify-between font-mono bg-[color:#edf2fb] transition-all rounded-md duration-500",
                            voice.name === currentVoice?.speaker_id && "bg-blue-300"
                        )}
                        onClick={(e) => {
                            e.preventDefault();
                            updateVoice({
                                speaker_id: voice.name,
                                audio: voice.base64,
                                reference_text: voice.name
                            });
                        }}
                    >
                        <span className="truncate">
                            {voice.name.replace('.wav', '')}
                        </span>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 bg-[color:#edf2fb] transition-all rounded-full duration-500 flex-shrink-0"
                            onClick={(e) => {
                                e.preventDefault();
                                handleVoicePlay(voice);
                            }}
                        >
                            <Play size={24} weight="fill" />
                        </Button>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
