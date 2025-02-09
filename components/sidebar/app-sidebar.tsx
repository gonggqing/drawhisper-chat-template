"use client";

import { cn } from "@/lib/utils";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarGroup,
    SidebarFooter,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { FinnTheHuman, Info, TrashSimple } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserForm } from "@/components/forms/user-form";
import { useEffect, useState } from "react";
import { TooltipWrapper } from "@/components/tooltip-provider";

import { CharacterSetting } from "@/components/forms/character-form";
import useUser from "@/lib/store/user-store";
import useCharacter, { CharacterState } from "@/lib/store/character-store";
import { toast } from "sonner";

export const AppSidebar = () => {
    const user = useUser((state) => state.getUser());
    const [username, setUsername] = useState<string | null>(null);
    const [avatar, setAvatar] = useState<string | null>(null);

    const character = useCharacter((state) => state);
    const currentCharacter = useCharacter((state) => state.current_character);

    const [characters, setCharacters] = useState<CharacterState[]>([]);

    const handleCharacterClick = (target_character: CharacterState) => {
        if (currentCharacter?.id !== target_character.id) {
            character.setCurrentCharacter(target_character);
        }
    }

    const handleDeleteCharacter = (target_character: CharacterState) => {
        try {
            character.deleteCharacter(target_character.id);
            toast.success("Character deleted successfully");
        } catch (error) {
            toast.error("Failed to delete character");
        }
    }

    useEffect(() => {
        setUsername(user?.username || "User");
        setAvatar(user?.avatar || null);
    }, [user]);

    useEffect(() => {
        if (character.characters) {
            setCharacters(Object.values(character.characters));
        }
    }, [character.characters]);

    const character_tip = "You can create a character's basic information and use it in any chat."

    return (
        <Sidebar className="z-50">
            <SidebarHeader className="gap-2 flex flex-row items-center justify-start border-b border-sidebar-border h-14">
                <FinnTheHuman size={24} weight="fill" />
                <h1 className="text-lg font-bold">Drawhisper Chat</h1>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Chats 
                    </SidebarGroupLabel>
                    {/* <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                Local Chat
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu> */}
                </SidebarGroup>
                <Separator className="border-sidebar-border"/>
                <SidebarGroup>
                    <SidebarGroupLabel className="gap-2">
                        Characters
                        <TooltipWrapper content={character_tip} side="right" align="start">
                            <Info size={18} weight="fill" />
                        </TooltipWrapper>
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <CharacterSetting />
                        </SidebarMenuItem>
                    </SidebarMenu>
                    <Separator className="border-sidebar-border"/>
                    <SidebarMenu className="max-h-[300px] overflow-y-auto">
                        {characters.map((character) => (
                            <SidebarMenuItem key={character.id} className="relative group flex flex-row items-center gap-2 p-2">
                                <SidebarMenuButton 
                                    className={cn("h-12 w-full items-center justify-between", currentCharacter?.id === character.id && "bg-sidebar-accent shadow-inner")}
                                    onClick={() => handleCharacterClick(character)}
                                >
                                    <span className="flex flex-row items-center gap-2">
                                        <Avatar>
                                            <AvatarImage 
                                                src={character.avatar || "/image/radien.jpg"} 
                                                alt={character.name}
                                                className="object-cover w-10 h-10 rounded-full"
                                            />
                                            <AvatarFallback>
                                                {character.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <p className="text-sm font-medium">{character.name}</p>
                                    </span>
                                    <div 
                                        className="transition-all duration-300 hover:opacity-100 opacity-0 hover:bg-red-400 hover:text-white rounded-full h-8 w-8 p-1.5 flex items-center justify-center" 
                                        onClick={() => handleDeleteCharacter(character)}
                                        >
                                        <TrashSimple size={18} weight="fill" />
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <Separator className="border-sidebar-border"/>
            <SidebarFooter>
                <div className="flex flex-row p-2 w-full justify-between items-center rounded-md bg-sidebar-accent">
                    <div className="flex flex-row gap-2 items-center">
                        <Avatar>
                            <AvatarImage src={avatar || "/image/radien.jpg"} />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">{username || "User"}</p>
                    </div>
                    <UserForm />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
