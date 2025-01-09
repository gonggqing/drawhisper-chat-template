"use client";

import { UserSwitch } from "@phosphor-icons/react";
import { 
    DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuContent, 
    DropdownMenuItem,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SwitchModelProps } from "@/types/model";
import { cn } from "@/lib/utils";
import { ModelFile } from "@/lib/tools/list-files";
export function SwitchModel({ context }: SwitchModelProps) {
    const { 
        files, 
        current, 
        isLoading, 
        error,
        setCurrent
    } = context;

    const handleSwitch = (file: ModelFile) => {
        console.log(`Switching to ${JSON.stringify(file)}`);
        setCurrent(file);
    }

    if (isLoading) {
        return (
            <Button variant="ghost" size="icon" disabled className="h-9 w-9 bg-[color:#edf2fb] transition-all rounded-full duration-500">
                <UserSwitch size={24} weight="fill" className="animate-spin" />
            </Button>
        );
    }

    if (error) {
        return (
            <Button variant="ghost" size="icon" disabled className="h-9 w-9 bg-[color:#edf2fb] transition-all rounded-full duration-500">
                <UserSwitch size={24} weight="fill" className="text-destructive" />
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 bg-[color:#edf2fb] hover:bg-[color:#e2eafc] transition-all rounded-full duration-500">
                    <UserSwitch size={24} weight="fill" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2 bg-[color:#edf2fb] border border-[color:#e2eafc] rounded">
                <DropdownMenuLabel className="text-base text-muted-foreground">Change</DropdownMenuLabel>
                {files.map((file) => (
                    <DropdownMenuItem
                        key={file.path}
                        className={cn(
                            "flex items-center gap-2 cursor-pointer text-muted-foreground",
                            current?.path === file.path && "bg-[color:#e2eafc] text-primary"
                        )}
                        onClick={() => handleSwitch(file)}
                    >
                        <span className="text-sm font-mono capitalize">
                            {file.name}
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

