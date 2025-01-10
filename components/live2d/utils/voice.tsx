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
import { useContext } from "react";
import { Live2DContext } from "@/context/live2d/live2d-context";
import { useState, useEffect } from "react";
import { VoiceFile } from "@/lib/tools/load-voice";
import { Slider } from "@/components/ui/slider";

export const VoiceButton = () => {
    const { controller } = useContext(Live2DContext);
    const [voices, setVoices] = useState<VoiceFile[]>([]);

    const [volume, setVolume] = useState<number>(1);

    useEffect(() => {
        async function fetchVoices() {
            const response = await axios.get('/api/voices');
            const {data: voices} = response;
            setVoices(voices);
            console.log(`Loaded ${voices.length} voices: ${voices.map((voice: VoiceFile) => voice.name).join(', ')}`)
        }
        fetchVoices();
    }, [])

    if (!controller) return (
        <Button variant="ghost" size="icon" disabled className="h-9 w-9 bg-[color:#edf2fb] transition-all rounded-full duration-500">
            <Headset size={24} weight="fill" className="text-destructive" />
        </Button>
    )

    const handleVoicePlay = (voice: VoiceFile) => {
        console.log(voice);
        if (!controller && !voice.base64) return;
        controller.speak(voice.base64, undefined, true, volume);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 bg-[color:#edf2fb] hover:bg-[color:#e2eafc] transition-all rounded-full duration-500">
                    <Headset size={24} weight="fill" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2 bg-[color:#edf2fb] border border-[color:#e2eafc] rounded">
                <DropdownMenuLabel className="text-base text-muted-foreground">Voices</DropdownMenuLabel>
                <DropdownMenuItem onClick={(e) => e.preventDefault()} className="flex items-center justify-start gap-2">
                    <span className="text-sm text-muted-foreground font-mono">Volume</span>
                    <Slider value={[volume]} min={0.1} max={1} step={0.1} onValueChange={(value) => setVolume(value[0])} />
                    <p className="text-xs text-muted-foreground">{volume}</p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                { voices && voices.length > 0 && voices.map((voice) => {
                    return (
                        <DropdownMenuItem key={voice.name} className="flex items-center justify-between font-mono">
                            <span>{voice.name.replace('.wav', '')}</span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-9 w-9 bg-[color:#edf2fb] hover:bg-[color:#e2eafc] transition-all rounded-full duration-500"
                                onClick={() => handleVoicePlay(voice)}
                            >
                                <Play size={24} weight="fill" />
                            </Button>
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
