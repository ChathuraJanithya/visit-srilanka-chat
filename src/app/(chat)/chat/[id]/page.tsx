"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatHeader } from "@/components/chat-header";
import { ChatCanvas } from "@/components/chat-canvas";
import { SidebarProvider, useSidebarContext } from "@/components/ui/sidebar";
import { MobileOverlay } from "@/components/mobile-overlay";
import { useSwipe } from "@/hooks/use-swipe";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChat } from "@/context/chat-context";

function ChatPage() {
  const { chatId } = useParams();
  const { setCurrentChat, chats } = useChat();
  const router = useRouter();
  const { isOpen, setIsOpen } = useSidebarContext();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Find the chat in our context
    const chat = chats.find((c) => c.id === chatId);

    if (chat) {
      setCurrentChat(chat);
    } else {
      // If chat doesn't exist, redirect to home
      //router.push("/");
    }
  }, [chatId, chats, setCurrentChat, router]);

  // Add swipe gestures for mobile
  const { handlers } = useSwipe({
    onSwipeRight: () => {
      if (isMobile && !isOpen) {
        setIsOpen(true);
      }
    },
    onSwipeLeft: () => {
      if (isMobile && isOpen) {
        setIsOpen(false);
      }
    },
  });

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-gradient-to-b from-background to-background/95"
      {...handlers}
    >
      <ChatSidebar />
      <MobileOverlay />
      <div className="flex flex-1 flex-col">
        <ChatHeader />
        <ChatCanvas />
      </div>
    </div>
  );
}

export default function ChatPageWithSidebar() {
  return (
    <SidebarProvider defaultIsOpen={false}>
      <ChatPage />
    </SidebarProvider>
  );
}
