import { Button } from "@/components/ui/button";
import { Moon, Sun, Gear } from "@phosphor-icons/react";
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex flex-row items-center gap-2">
            <Button 
                variant="light_blue" 
                size="icon" 
                onClick={() => setTheme("light")}
                className={cn(
                    "rounded-full",
                    theme === "light" && "bg-foreground text-background"
                )}
            >
                <Sun size={24} weight="fill" />
            </Button>
            <Button 
                variant="light_blue" 
                size="icon" 
                onClick={() => setTheme("dark")}
                className={cn(
                    "rounded-full",
                    theme === "dark" && "bg-foreground text-background"
                )}
            >
                <Moon size={24} weight="fill" />
            </Button>
            <Button 
                variant="light_blue" 
                size="icon" 
                onClick={() => setTheme("system")}
                className={cn(
                    "rounded-full",
                    theme === "system" && "bg-foreground text-background"
                )}
            >
                <Gear size={24} weight="fill" />
            </Button>
        </div>
    )
}