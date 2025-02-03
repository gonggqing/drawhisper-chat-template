"use client";

import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Microphone } from "@phosphor-icons/react";
import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { FishTTS } from "@/lib/tts/fish.ai";
import { saveClonedVoice } from "@/lib/tools/save-voice";
import { toast } from "sonner";

export const VoiceClone = ({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) => {
    
    const [audio, setAudio] = useState<File | null>(null);
    const [reference, setReference] = useState<string>('');
    const [generation, setGeneration] = useState<string>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [speaker_id, setSpeakerID] = useState<string | null>(null);

    const [text, setText] = useState<string>("AI Voice Clone is a voice cloning tool that allows you to create a new voice for your AI.");

    const tts = new FishTTS({
        apiKey: process.env.FISH_API_KEY,
        baseUrl: "http://127.0.0.1:8080/v1/tts",
        streaming: false
    });

    const handleFishTTS = useCallback(async () => {
        if (!audio || !reference) return;

        try {
            setIsLoading(true);
            const response = await tts.generateSpeech({
                text,
                referenceAudio: [audio],
                referenceText: [reference],
                options: {
                    format: "wav",
                    normalize: true,
                    latency: "normal",
                    channels: 1,
                    top_p: 0.7,
                    temperature: 0.7,
                    repetition_penalty: 1.2
                }
            });

            if (response.status === "success") {
                setGeneration(response.data.audio?.base64);
            } else {
                console.error("Failed to generate speech:", response.data.error);
                toast.error("Failed to generate speech");
            }
        } catch (error) {
            console.error("Error generating speech:", error);
            toast.error("Error generating speech");
        } finally {
            setIsLoading(false);
        }
    }, [audio, reference, text, tts]);

    const handleSave = async () => {
        if (!speaker_id || !audio || !reference) return toast.error("Missing required fields (speaker_id, audio, reference_text)");

        try {
            setIsSaving(true);
            // Convert File to base64
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === "string") {
                        resolve(reader.result);
                    }
                };
                reader.readAsDataURL(audio);
            });

            await saveClonedVoice({
                speaker_id,
                audio: base64,
                reference_text: reference
            });

            toast.success("Voice saved successfully");
            setOpen(false);
        } catch (error) {
            console.error("Error saving voice:", error);
            toast.error("Failed to save voice");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpen(true);
                    }}
                    variant={"ghost"} size={"icon"} className="h-9 w-9 bg-[color:#edf2fb] hover:bg-[color:#d7e3fc] transition-all rounded-full duration-500">
                    <Microphone size={24} weight="fill" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md h-fit">
                <DialogHeader>
                    <DialogTitle>Voice Clone</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Upload a wav file or record your voice to create a new ai cloned voice.
                </DialogDescription>
                <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-2 items-end">
                        <div className="col-span-1 text-sm text-muted-foreground flex flex-col gap-1">
                            <p>Reference Speaker</p>
                            <Input type="text" placeholder="speaker_id" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSpeakerID(e.target.value)} />
                        </div>
                        <div className="col-span-2">
                            <Input 
                                type="file" 
                                accept="audio/wav" 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAudio(e.target.files?.[0] || null)} 
                                className="w-full"
                            />
                        </div>
                    </div>
                    <Input 
                        type="text" 
                        placeholder="Audio Reference Text"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReference(e.target.value)} 
                        className="w-full"
                    />
                    <h2 className="text-sm text-muted-foreground">Generate Audio</h2>
                    <div className="flex flex-col gap-2 items-end">
                        <Input className="overflow-x-auto w-full" type="text" placeholder="Generate Audio Text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)} />
                        <div className="flex flex-col gap-2 items-start">
                            <span className="max-w-sm inline-flex flex-wrap overflow-hidden text-ellipsis">
                                <p className="text-xs text-muted-foreground">
                                    {text}
                                </p>
                            </span>
                        </div>
                        <Button 
                            onClick={handleFishTTS}
                            disabled={!reference || !audio || !text || isLoading} 
                            className="bg-blue-400 hover:bg-blue-500"
                            size={"sm"}>
                            {isLoading ? "Generating..." : "Generate"}
                        </Button>
                        <div className="w-full">
                            {
                              generation && <audio src={`${generation}`} controls />
                            }
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button 
                        disabled={!speaker_id || !audio || !reference || isSaving} 
                        className="bg-blue-400 hover:bg-blue-500" 
                        onClick={handleSave}>
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}