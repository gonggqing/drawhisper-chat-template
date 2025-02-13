"use client";

import React, { useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "../ui/button";
import { CaretUpDown } from "@phosphor-icons/react";
import useChatStore from "@/lib/store/chat-store";

export function ModelSelect() {
    const [models, setModels] = React.useState<string[]>([]);
    const [open, setOpen] = React.useState(false);
    const selectedModel = useChatStore((state) => state.selectedModel);
    const setSelectedModel = useChatStore((state) => state.setSelectedModel);

    useEffect(() => {
        const fetchModels = async () => {
        const fetchedModels = await fetch("/api/tags");
        const json = await fetchedModels.json();
        const apiModels = json.models.map((model: any) => model.name);
        setModels([...apiModels]);
        };
        fetchModels();
    }, []);

    const handleModelChange = (model: string) => {
        setSelectedModel(model);
        setOpen(false);
    };
    return (
        <div className="w-full flex items-center justify-center p-1.5">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[300px] justify-between -translate-x-1/2"
                >
                    {selectedModel || "Select model"}
                    <CaretUpDown weight="bold" className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-1">
                    {models.length > 0 ? (
                        models.map((model) => (
                        <Button
                            key={model}
                            variant="ghost"
                            className="w-full"
                            onClick={() => {
                            handleModelChange(model);
                            }}
                        >
                            {model}
                        </Button>
                        ))
                    ) : (
                        <Button variant="ghost" disabled className=" w-full">
                            No models available
                        </Button>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    )
}