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
import { Button } from "../ui/button";

export const AppSidebar = () => {
    return (
        <Sidebar className="z-50">
            <SidebarHeader className="gap-2 flex flex-row items-center justify-start border-b border-sidebar-border h-14">
                <FinnTheHuman size={24} weight="fill" />
                <h1 className="text-lg font-bold">Drawhisper Chat</h1>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Local Chat
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
            <SidebarFooter>
                <div className="flex flex-row p-2 w-full justify-between items-center rounded-md bg-sidebar-accent">
                    <div className="flex flex-row gap-2 items-center">
                        <Avatar>
                            <AvatarImage src="/image/radien.jpg" />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">User</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 bg-[color:#edf2fb] hover:bg-[color:#d7e3fc] transition-all duration-300 rounded-full">
                        <DotsThree size={24} weight="bold" />
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
