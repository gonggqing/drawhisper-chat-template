"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Play } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import Avatar from "./avatar";

export interface MessagType {
    role: "user" | "assistant";
    content: string;

}

interface MessageContainer {
    message: MessagType;
    onPlay?: (content: string) => void;
}

export const Message = ({ message, onPlay }: MessageContainer) => {
    return (
            <div className={cn(
                "w-full flex flex-row items-end gap-2 relative group",
                message.role === "user" && "justify-end",
            )}>
                {message.role === "assistant" && <Avatar src={"/image/aijier.jpg"} fallback={"AI"} />}
                {message.role === "user" && <Button variant="ghost" className="w-6 h-6 rounded-lg bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Play size={12} weight="fill" />
                </Button>}
                <Card className={cn(
                    "max-w-xs min-w-[224px] min-h-[40px] inline-flex flex-wrap p-2 items-center shadow-none relative rounded-lg border-none",
                    message.role === "user" && "bg-[color:#bde0fe] place-self-end",
                    message.role === "assistant" && "bg-[color:#ffc2d1] self-start",
                    )}>
                        <p className="text-sm font-mono text-primary">{message.content}</p>
                </Card>
                {message.role === "user" && <Avatar src={"/image/radien.jpg"} fallback={"U"} />}
                {message.role === "assistant" && <Button variant="ghost" className="w-6 h-6 rounded-lg bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Play size={12} weight="fill" />
                </Button>}
            </div>
    )
}