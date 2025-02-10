"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AvatarWrapper({ src, fallback }: { src: string, fallback: string}) {
    return (
        <Avatar className="w-10 h-10 select-none">
            <AvatarImage src={src} className="object-cover" />
            <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
    )
}