"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Play } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import Avatar from "./avatar";
import { textToSpeech } from "@/lib/tts/legacy/worker";
import { useContext } from "react";
import { Live2DContext } from "@/context/live2d/live2d-context";

import { generateSpeech } from "@/lib/tts/legacy/oute.ai";
import { FishTTS } from "@/lib/tts/fish.ai";
import { useVoice } from "@/context/voice/voice-context";

import useUser from "@/lib/store/user-store";   

export interface MessagType {
    role: "user" | "assistant";
    content: string;

}

interface MessageContainer {
    message: MessagType;
}

export const Message = ({ message }: MessageContainer) => {
    const [isLoading, setIsLoading] = useState(false);
    const [audio, setAudio] = useState<string | null>(null);
    const { controller } = useContext(Live2DContext);
    const { voice } = useVoice();

    const avatar = useUser((state) => state.getUser()?.avatar);

    // Read audio file as Blob from public directory
    const audioFile = useCallback(async () => {
        if (!voice?.audio) return null;
        
        try {
            // Fetch the actual file and get blob directly
            const response = await fetch(voice.audio);
            if (!response.ok) throw new Error('Failed to fetch audio file');
            
            // Get blob and create File object
            const blob = await response.blob();
            return new File([blob], `${voice.speaker_id}.wav`, { type: 'audio/wav' });
        } catch (error) {
            console.error('Failed to load audio file:', error);
            return null;
        }
    }, [voice?.speaker_id]);

    const tts = new FishTTS({
        apiKey: process.env.FISH_API_KEY,
        baseUrl: "http://127.0.0.1:8080/v1/tts",
        streaming: false
    });

    const handlePalyAudio = useCallback(async () => {
        if (!voice?.speaker_id) return;
        if (!audio) {
            setIsLoading(true);
        
            // Get the reference audio file as blob
            const referenceFile = await audioFile();
            if (!referenceFile) {
                console.error('Failed to get reference audio file');
                setIsLoading(false);
                return;
            }

            console.log(`voice:${voice?.speaker_id}`);
            const response = await tts.generateSpeech({
                text: message.content,
                referenceAudio: [referenceFile],
                referenceText: [voice?.reference_text || ""],
                options: {
                    format: "wav",
                    normalize: true,
                    chunk_length: 300,
                    latency: "balanced",
                    channels: 2,
                    top_p: 0.5,
                    temperature: 0.7,
                    repetition_penalty: 1.2
                }
            });
            if (response.status === "success" && response.data.audio) {
                const { base64, blob } = response.data.audio;
                setAudio(base64);
                controller?.speak(base64);
                setIsLoading(false);
            }

        } else {
            controller?.speak(audio);
        }
    }, [message.content, voice?.speaker_id]);

    const handlePlay = async () => {
        if (!audio) {
            setIsLoading(true);
            const { base64 } = await textToSpeech(message.content, "Xenova/speecht5_tts");
            if (base64) {
                setAudio(base64);
                controller?.speak(base64);
            }
            setIsLoading(false);
        } else {
            controller?.speak(audio);
        }
        setIsLoading(false);
    }

    const handleOuteTTS = async () => {
        if (!audio) {
            setIsLoading(true);
            const { status, data } = await generateSpeech(message.content, {
                language: "en", 
                speaker_id: "female_1"
            });
            console.log(status, data);
            if (status === "success" && data.audio) {
                setAudio(data.audio);
                controller?.speak(data.audio);
            }
            setIsLoading(false);
        } else {
            controller?.speak(audio);
        }
        setIsLoading(false);
    }

    return (
            <div className={cn(
                "w-full flex flex-row items-end gap-2 relative group",
                message.role === "user" && "justify-end",
            )}>
                {message.role === "assistant" && <Avatar src={"/image/aijier.jpg"} fallback={"AI"} />}
                <Card className={cn(
                    "max-w-xs min-w-[224px] min-h-[40px] inline-flex flex-wrap p-2 items-center shadow-none relative rounded-lg border-none",
                    message.role === "user" && "bg-[color:#bde0fe] place-self-end rounded-br-none",
                    message.role === "assistant" && "bg-[color:#ffc2d1] self-start rounded-bl-none",
                    )}>
                        <p className="text-sm font-mono text-primary">{message.content}</p>
                </Card>
                {message.role === "user" && <Avatar src={avatar || "/image/radien.jpg"} fallback={"U"} />}
                {message.role === "assistant" && 
                    <Button 
                        variant="default" 
                        className="w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                        onClick={handlePalyAudio}
                        disabled={isLoading}
                    >
                        <Play size={12} weight="fill" />
                    </Button>}
            </div>
    )
}