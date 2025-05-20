"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown, Plus, MessageSquare, Trash2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebarContext,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
//import { formatDistanceToNow } from "date-fns";
import { useChat } from "@/context/chat-context";
import { useIsMobile } from "@/hooks/use-mobile";
import clsx from "clsx";

export function ChatSidebar() {
  const { chats, currentChat, createNewChat } = useChat();
  const router = useRouter();
  const { setIsOpen, isOpen } = useSidebarContext();
  const isMobile = useIsMobile();

  const handleSelectChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);

    // Close sidebar on mobile after selection
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleNewChat = () => {
    const newChat = createNewChat();
    router.push(`/chat/${newChat.id}`);

    // Close sidebar on mobile after creating new chat
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-2">
        {isOpen && (
          <Button
            variant="outline"
            className="w-full justify-center gap-2 shadow-sm"
            onClick={handleNewChat}
          >
            <Plus className="h-4 w-4" />
            <span>New chat</span>
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2 py-2">
          <h3 className="px-2 text-sm font-medium text-muted-foreground">
            Recent chats
          </h3>
        </div>
        <SidebarMenu>
          {chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton asChild isActive={currentChat?.id === chat.id}>
                <Button
                  variant="ghost"
                  className={clsx(
                    "w-full justify-start text-sm my-0.5 font-normal gap-2 h-auto  py-3",
                    currentChat?.id === chat.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground"
                  )}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="truncate w-full">{chat.title}</span>
                    {/*  <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(chat.createdAt), {
                        addSuffix: true,
                      })}
                    </span> */}
                  </div>
                </Button>
              </SidebarMenuButton>
              {/* Replace SidebarMenuAction with a positioned button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover/menu-item:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  // Delete functionality would go here
                }}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete chat</span>
              </Button>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 bg-sidebar-accent/50 backdrop-blur-sm transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-purple-600 text-white">
                G
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">Guest</span>
          </div>
          <Button variant="ghost" size="icon">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
