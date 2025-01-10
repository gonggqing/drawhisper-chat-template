"use client";

import { Headset } from "@phosphor-icons/react";
import { 
    DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuContent, 
    DropdownMenuItem,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useContext } from "react";
import { Live2DContext } from "@/context/live2d/live2d-context";

export const VoiceButton = () => {
    const { controller } = useContext(Live2DContext);

    if (!controller) return (
        <Button variant="ghost" size="icon" disabled className="h-9 w-9 bg-[color:#edf2fb] transition-all rounded-full duration-500">
            <Headset size={24} weight="fill" className="text-destructive" />
        </Button>
    )

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 bg-[color:#edf2fb] hover:bg-[color:#e2eafc] transition-all rounded-full duration-500">
                    <Headset size={24} weight="fill" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2 bg-[color:#edf2fb] border border-[color:#e2eafc] rounded">
                <DropdownMenuLabel className="text-base text-muted-foreground">Change</DropdownMenuLabel>
                
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
