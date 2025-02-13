import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { GearSix } from "@phosphor-icons/react";
import { UserForm } from "@/components/forms/user-form";

export const Settings = () => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="light_blue" size="icon" className="h-9 w-9 bg-[color:#edf2fb] hover:bg-[color:#d7e3fc] transition-all duration-300 rounded-full">
                    <GearSix size={24} weight="fill" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] flex flex-col gap-2 p-4">
                <div className="flex flex-row items-center justify-between gap-2">
                    <p className="text-sm font-medium">User Settings</p>
                    <UserForm />
                </div>
                <Separator />
                <div className="flex flex-row items-center justify-between gap-2">
                    <p className="text-sm font-medium">Theme</p>
                    <ThemeToggle />
                </div>
            </PopoverContent>
        </Popover>
    )
}