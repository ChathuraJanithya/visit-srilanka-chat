"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatHeader } from "@/components/chat-header";
import { ChatCanvas } from "@/components/chat-canvas";
import { SidebarProvider, useSidebarContext } from "@/components/ui/sidebar";
import { MobileOverlay } from "@/components/mobile-overlay";
import { useSwipe } from "@/hooks/use-swipe";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChat } from "@/context/chat-context";
import { useAuth } from "@/context/auth-context";

function ChatApp() {
  const { isOpen, setIsOpen } = useSidebarContext();
  const isMobile = useIsMobile();
  const { createNewChat, currentChat, chats } = useChat();
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // If there are chats but no current chat is selected, redirect to the first chat
  useEffect(() => {
    if (user && chats.length > 0 && !currentChat) {
      router.push(`/chat/${chats[0].id}`);
    }
  }, [chats, currentChat, router, user]);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-gradient-to-b from-background to-background/95"
      {...handlers}
    >
      <ChatSidebar />
      {/* <MobileOverlay /> */}
      <div className="flex flex-1 flex-col">
        <ChatHeader />
        <ChatCanvas />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <SidebarProvider defaultIsOpen={false}>
      <ChatApp />
    </SidebarProvider>
  );
}
