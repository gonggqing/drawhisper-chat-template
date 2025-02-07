"use client";

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
import { FinnTheHuman, DotsThree } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserForm } from "@/components/forms/user-form";
import useUser from "@/lib/store/user-store";
import { useEffect, useState } from "react";

export const AppSidebar = () => {
    const user = useUser((state) => state.getUser());
    const [username, setUsername] = useState<string | null>(null);
    const [avatar, setAvatar] = useState<string | null>(null);

    useEffect(() => {
        setUsername(user?.username || "User");
        setAvatar(user?.avatar || null);
    }, [user]);

    return (
        <Sidebar className="z-50">
            <SidebarHeader className="gap-2 flex flex-row items-center justify-start border-b border-sidebar-border h-14">
                <FinnTheHuman size={24} weight="fill" />
                <h1 className="text-lg font-bold">Drawhisper Chat</h1>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Your Chats
                    </SidebarGroupLabel>
                    {/* <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                Local Chat
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu> */}
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
