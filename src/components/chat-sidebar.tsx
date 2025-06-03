"use client";
import { ChevronDown, Plus, MessageSquare, Trash2 } from "lucide-react";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useChat } from "@/context/chat-context";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";

export function ChatSidebar() {
  const { chats, currentChat, createNewChat, deleteChat, loading } = useChat();
  const { user } = useAuth();
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

  const handleNewChat = async () => {
    //const newChat = await createNewChat();
    await createNewChat();
    /*  if (newChat) {
      router.push(`/chat/${newChat.id}`);

      // Close sidebar on mobile after creating new chat
      if (isMobile) {
        setIsOpen(false);
      }
    } */
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this chat?")) {
      await deleteChat(chatId);
    }
  };

  if (!user) {
    return (
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Please sign in to access your chats
            </p>
            <Button variant="outline" className="mt-2" asChild>
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </SidebarHeader>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-2">
        {isOpen && (
          <Button
            variant="outline"
            className="w-full justify-start gap-2 shadow-sm"
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
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <SidebarMenu>
            {chats.map((chat) => (
              <SidebarMenuItem key={chat.id} className="relative group">
                <SidebarMenuButton
                  asChild
                  isActive={currentChat?.id === chat.id}
                >
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
                    <div className="flex flex-col items-start text-start overflow-hidden">
                      <span className="truncate w-full">{chat.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(chat.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </Button>
                </SidebarMenuButton>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete chat</span>
                </Button>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
      </SidebarContent>
      {isOpen && (
        <SidebarFooter className="p-4 bg-sidebar-accent/50 backdrop-blur-sm transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-purple-600 text-white">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-sm truncate max-w-[120px]">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {user.email}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
