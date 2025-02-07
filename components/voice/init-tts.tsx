"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SpinnerDotted } from "spinners-react";
import { Check } from "@phosphor-icons/react";
import { FishTTS } from "@/lib/tts/fish.ai";
import "@/styles/wave.css";

export const InitTTSModel = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<"ready" | "error" | "loading">("loading");
    const [error, setError] = useState<string | null>(null);

    const tts = new FishTTS({
        apiKey: process.env.FISH_API_KEY,
        baseUrl: "http://127.0.0.1:8080/v1/tts",
        streaming: false
    });

    useEffect(() => {
        async function init() {
            setStatus("loading");
            setError(null);

            try {
                const res = await tts.generateSpeech({
                    text: "TTS is ready",
                    options: {
                        format: "wav",
                        normalize: true,
                    }
                })
    
                if (res.status !== "success") {
                    setStatus("error");
                    setError("Failed to initialize TTS service, check if the tts server is running on http://127.0.0.1:8080");
                } else {
                    setStatus("ready");
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 1500);
                }
            } catch (error) {
                console.error(`Error when initilize tts server: ${error}`)
            }
        }
        init();
    }, []);

    return (
        <Dialog open={isLoading} onOpenChange={setIsLoading}>
            <DialogContent className="w-full max-w-xl h-[512px] flex flex-col overflow-hidden p-0">
                <DialogHeader className="p-8 flex flex-col items-center justify-center gap-4">
                    <DialogTitle className="text-xl font-bold">Initializing TTS Model</DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground">
                        Check if the TTS service is running ...
                    </DialogDescription>
                </DialogHeader>
                <div className="relative w-full flex-1 flex flex-col items-center justify-start">
                    <div className="z-10 flex flex-col items-center gap-4 mt-8 p-4">
                        <p className="font-mono text-muted-foreground">Status: {status}</p>
                        {status === "ready"
                            ?  <Check weight="bold" size={36} color="rgba(57, 115, 172, 1)" />
                            : <SpinnerDotted size={50} thickness={100} speed={100} color="rgba(57, 115, 172, 1)" />
                        }
                        {error && <p className="font-mono text-red-500">{error}</p>}
                    </div>
                    <div className="ocean">
                        <div className="wave"></div>
                        <div className="wave"></div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}