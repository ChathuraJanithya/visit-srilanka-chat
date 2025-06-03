"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatHeader } from "@/components/chat-header";
import { ChatCanvas } from "@/components/chat-canvas";
import { SidebarProvider, useSidebarContext } from "@/components/ui/sidebar";
/* import { MobileOverlay } from "@/components/mobile-overlay"; */
import { useSwipe } from "@/hooks/use-swipe";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChat } from "@/context/chat-context";
import { useAuth } from "@/context/auth-context";

function ChatApp() {
  const { isOpen, setIsOpen } = useSidebarContext();
  const isMobile = useIsMobile();
  const { currentChat, chats, loading: chatLoading, createNewChat } = useChat();
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Use refs to prevent multiple redirects and chat creations
  const hasRedirected = useRef(false);
  const isCreatingNewChat = useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Handle chat navigation logic
  useEffect(() => {
    // Don't do anything if user is not authenticated or still loading
    if (!user || loading || chatLoading) return;

    // Reset redirect flag when pathname changes
    if (hasRedirected.current && pathname !== "/") {
      hasRedirected.current = false;
    }

    // If we're on the root page and have a current chat, redirect to it
    if (pathname === "/" && currentChat && !hasRedirected.current) {
      console.log("Redirecting to current chat:", currentChat.id);
      hasRedirected.current = true;
      router.replace(`/chat/${currentChat.id}`);
      return;
    }

    // If we have chats but no current chat is selected, redirect to the first chat
    if (chats.length > 0 && !currentChat && !hasRedirected.current) {
      console.log("Redirecting to first chat:", chats[0].id);
      hasRedirected.current = true;
      router.replace(`/chat/${chats[0].id}`);
      return;
    }

    // If there are no chats and we're on root, create a new chat
    if (
      chats.length === 0 &&
      pathname === "/" &&
      !isCreatingNewChat.current &&
      !hasRedirected.current
    ) {
      console.log("No chats found, creating new chat");
      isCreatingNewChat.current = true;
      hasRedirected.current = true;

      createNewChat().finally(() => {
        isCreatingNewChat.current = false;
      });
    }
  }, [
    chats,
    currentChat,
    pathname,
    user,
    loading,
    chatLoading,
    router,
    createNewChat,
  ]);

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
