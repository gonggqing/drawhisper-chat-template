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
import { FinnTheHuman, Info, Plus, TrashSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { TooltipWrapper } from "@/components/tooltip-wrapper";

import { CharacterSetting } from "@/components/forms/character-form";
import useUser from "@/lib/store/user-store";
import useCharacter, { Character } from "@/lib/store/character-store";
import useChat from "@/lib/store/chat-store";
import { toast } from "sonner";
import Avatar from "@/components/avatar-wrapper";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { Settings } from "@/components/sidebar/settings";
import Link from "next/link";

import { defaultCharacter } from "@/lib/character";

export const AppSidebar = () => {
    const user = useUser((state) => state.getUser());
    const [username, setUsername] = useState<string | null>(null);
    const [avatar, setAvatar] = useState<string | null>(null);
    const { id } = useParams() as { id: string | undefined };
    const router = useRouter();
    const chats = useChat((state) => state.chats);
    const setCurrentChatId = useChat((state) => state.setCurrentChatId);
    const handleDeleteChat = useChat((state) => state.handleDelete);

    const character = useCharacter((state) => state);
    const currentCharacter = useCharacter((state) => state.currentCharacter);
    const getCharacterById = useCharacter((state) => state.getCharacterById);

    const [characters, setCharacters] = useState<Character[]>([]);

    const handleCharacterClick = (target_character: Character) => {
        if (currentCharacter?.id !== target_character.id) {
            character.setCurrentCharacter(target_character);
        }
    }

    const handleDeleteCharacter = (target_character: Character) => {
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

    useEffect(() => {
        if (!currentCharacter) {
            character.setCurrentCharacter(defaultCharacter());
        }
    }, []);

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
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Link href="/">
                                <Button variant="ghost" className="w-1/2 h-12 font-bold justify-start bg-sidebar-accent rounded-full">
                                    <p>New</p> <Plus size={24} weight="bold" />
                                </Button>
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    <SidebarMenu className="max-h-[448px] overflow-y-auto">
                        {Object.entries(chats).map(([chatId, chat]) => {
                            const c = getCharacterById(chat.characterId);
                            return (
                            <SidebarMenuItem key={chatId} className="relative group flex flex-row items-center gap-2 p-2">
                                <Link href={`/c/${chatId}`}>
                                    <SidebarMenuButton 
                                        className={cn("h-12 w-full items-center justify-between", 
                                            chatId === id && "bg-sidebar-accent shadow-inner"
                                        )}
                                    >
                                        <Avatar src={c?.avatar || "/image/radien.jpg"} fallback={c?.name.charAt(0) || "A"} />
                                        <span className="flex flex-row items-center gap-2">
                                            <span className="text-sm font-medium">
                                                {c?.name + `:${chat.messages[0].content}`}
                                            </span>
                                        </span>
                                        <div 
                                            className="transition-all duration-300 hover:opacity-100 opacity-0 hover:bg-red-400 hover:text-white rounded-full h-8 w-8 p-1.5 flex items-center justify-center" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteChat(chatId);
                                                router.push("/");
                                            }}
                                        >
                                            <TrashSimple size={18} weight="fill" />
                                        </div>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            
                        )})}
                    </SidebarMenu>
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
                    <SidebarMenu className="max-h-[300px] overflow-y-auto">
                        {characters.map((character) => (
                            <SidebarMenuItem key={character.id} className="relative group flex flex-row items-center gap-2 p-2">
                                <SidebarMenuButton 
                                    className={cn("h-12 w-full items-center justify-between", currentCharacter?.id === character.id && "bg-sidebar-accent shadow-inner")}
                                    onClick={() => handleCharacterClick(character)}
                                >
                                    <span className="flex flex-row items-center gap-2">
                                        <Avatar src={character.avatar || "/image/radien.jpg"}  fallback={character.name.charAt(0)} />
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
                        <Avatar src={avatar || "/image/radien.jpg"} fallback={username?.charAt(0) || "U"} />
                        <p className="text-sm font-medium">{username || "User"}</p>
                    </div>
                    <Settings />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
