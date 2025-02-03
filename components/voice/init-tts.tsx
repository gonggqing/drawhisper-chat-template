"use client";

import { initTTS } from "@/lib/tts/legacy/oute.ai";
import { useEffect, useState } from "react";
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SpinnerDotted } from "spinners-react";
import { Check } from "@phosphor-icons/react";
import "@/styles/wave.css";

export const InitTTSModel = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<"ready" | "error" | "loading">("loading");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function init() {
            setStatus("loading");
            setError(null);

            const res = await initTTS({
                model_path: "onnx-community/OuteTTS-0.2-500M",
                language: "en",
                max_length: 4096
            })

            if (res.status === "error") {
                setStatus("error");
                setError(res.data?.error || "Failed to initialize TTS Model for webgpu, check the webgpu support of your device.");
            } else {
                setStatus("ready");
                setTimeout(() => {
                    setIsLoading(false);
                }, 1500);
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
                        This will only happen once when you first run the app.
                    </DialogDescription>
                </DialogHeader>
                <div className="relative w-full flex-1 flex flex-col items-center justify-start">
                    <div className="z-10 flex flex-col items-center gap-4 mt-8">
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