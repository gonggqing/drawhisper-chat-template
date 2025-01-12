"use client";

import { useState } from "react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Play } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import Avatar from "./avatar";
import { textToSpeech } from "@/lib/tts/worker";
import { useContext } from "react";
import { Live2DContext } from "@/context/live2d/live2d-context";

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

    const handlePlay = async () => {
        if (!audio) {
            setIsLoading(true);
            const { base64 } = await textToSpeech(message.content, "Xenova/mms-tts-fra");
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


    return (
            <div className={cn(
                "w-full flex flex-row items-end gap-2 relative group",
                message.role === "user" && "justify-end",
            )}>
                {message.role === "assistant" && <Avatar src={"/image/aijier.jpg"} fallback={"AI"} />}
                <Card className={cn(
                    "max-w-xs min-w-[224px] min-h-[40px] inline-flex flex-wrap p-2 items-center shadow-none relative rounded-lg border-none",
                    message.role === "user" && "bg-[color:#bde0fe] place-self-end",
                    message.role === "assistant" && "bg-[color:#ffc2d1] self-start",
                    )}>
                        <p className="text-sm font-mono text-primary">{message.content}</p>
                </Card>
                {message.role === "user" && <Avatar src={"/image/radien.jpg"} fallback={"U"} />}
                {message.role === "assistant" && 
                    <Button 
                        variant="default" 
                        className="w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                        onClick={handlePlay}
                        disabled={isLoading}
                    >
                        <Play size={12} weight="fill" />
                    </Button>}
            </div>
    )
}