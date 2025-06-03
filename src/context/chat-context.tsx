"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import type { ChatMessage, ChatSession } from "@/types/chat";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";
import { processChatMessage } from "@/app/actions/chat";
import { useRouter } from "next/navigation";

interface ChatContextProps {
  chats: ChatSession[];
  currentChat: ChatSession | null;
  isTyping: boolean;
  loading: boolean;
  conversationIds: Record<string, string>; // Map chat IDs to conversation IDs
  setCurrentChat: (chat: ChatSession | null) => void;
  createNewChat: () => Promise<ChatSession | null>;
  addMessageToChat: (
    chatId: string,
    message: Omit<ChatMessage, "id" | "timestamp">
  ) => Promise<void>;
  generateBotResponse: (chatId: string, userMessage: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  loadChats: () => Promise<void>;
  resetConversation: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversationIds, setConversationIds] = useState<
    Record<string, string>
  >({});
  const { user } = useAuth();
  const router = useRouter();

  // Use refs to prevent multiple chat creation
  const isCreatingChat = useRef(false);
  const hasInitializedChats = useRef(false);

  // Load chats from Supabase
  const loadChats = async () => {
    if (!user) {
      setChats([]);
      setLoading(false);
      hasInitializedChats.current = false;
      return;
    }

    try {
      setLoading(true);

      // First fetch chats
      const { data: chatsData, error: chatsError } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (chatsError) throw chatsError;

      // Then fetch messages for each chat
      const chatsWithMessages = await Promise.all(
        chatsData.map(async (chat: any) => {
          const { data: messagesData, error: messagesError } = await supabase
            .from("messages")
            .select("*")
            .eq("chat_id", chat.id)
            .order("created_at", { ascending: true });

          if (messagesError) {
            console.error(
              "Error loading messages for chat:",
              chat.id,
              messagesError
            );
            return {
              id: chat.id,
              title: chat.title,
              createdAt: new Date(chat.created_at),
              messages: [],
            };
          }

          return {
            id: chat.id,
            title: chat.title,
            createdAt: new Date(chat.created_at),
            messages: messagesData.map((msg: any) => ({
              id: msg.id,
              content: msg.content,
              role: msg.role,
              timestamp: new Date(msg.created_at),
            })),
          };
        })
      );

      setChats(chatsWithMessages);
      hasInitializedChats.current = true;
    } catch (error) {
      console.error("Error loading chats:", error);
      hasInitializedChats.current = true;
    } finally {
      setLoading(false);
    }
  };

  // Load chats when user changes
  useEffect(() => {
    if (user) {
      loadChats();
    } else {
      // Reset state when user logs out
      setChats([]);
      setCurrentChat(null);
      setLoading(false);
      hasInitializedChats.current = false;
    }
  }, [user?.id]); // Use user.id instead of user to prevent unnecessary re-renders

  // Reset conversation for a specific chat
  const resetConversation = (chatId: string) => {
    setConversationIds((prev) => {
      const updated = { ...prev };
      delete updated[chatId];
      return updated;
    });
    console.log(`Reset conversation for chat: ${chatId}`);
  };

  // Create a new chat
  const createNewChat = async (): Promise<ChatSession | null> => {
    if (!user || isCreatingChat.current) return null;

    // Prevent multiple chat creation
    isCreatingChat.current = true;

    try {
      console.log("Creating new chat for user:", user.id);

      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .insert({
          user_id: user.id,
          title: "New Chat",
        })
        .select()
        .single();

      if (chatError) {
        console.error("Error creating chat:", chatError);
        throw chatError;
      }

      console.log("Chat created successfully:", chatData);

      const newChat: ChatSession = {
        id: chatData.id,
        title: chatData.title,
        createdAt: new Date(chatData.created_at),
        messages: [],
      };

      setChats((prevChats) => [newChat, ...prevChats]);
      setCurrentChat(newChat);

      // Use replace instead of push to avoid navigation issues
      router.replace(`/chat/${newChat.id}`);
      return newChat;
    } catch (error) {
      console.error("Error creating chat:", error);
      return null;
    } finally {
      isCreatingChat.current = false;
    }
  };

  // Add a message to a chat
  const addMessageToChat = async (
    chatId: string,
    message: Omit<ChatMessage, "id" | "timestamp">
  ) => {
    if (!user) return;

    try {
      const { data: messageData, error } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          content: message.content,
          role: message.role,
        })
        .select()
        .single();

      if (error) throw error;

      const newMessage: ChatMessage = {
        id: messageData.id,
        content: messageData.content,
        role: messageData.role as "user" | "assistant",
        timestamp: new Date(messageData.created_at),
      };

      // Update local state
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === chatId) {
            // Update chat title if it's the first user message
            let title = chat.title;
            if (chat.title === "New Chat" && message.role === "user") {
              title =
                message.content.substring(0, 30) +
                (message.content.length > 30 ? "..." : "");

              // Update title in database
              supabase
                .from("chats")
                .update({ title })
                .eq("id", chatId)
                .then(() => {});
            }

            return {
              ...chat,
              title,
              messages: [...chat.messages, newMessage],
            };
          }
          return chat;
        })
      );

      // Update current chat if it's the active one
      if (currentChat?.id === chatId) {
        setCurrentChat((prev) => {
          if (!prev) return null;

          let title = prev.title;
          if (prev.title === "New Chat" && message.role === "user") {
            title =
              message.content.substring(0, 30) +
              (message.content.length > 30 ? "..." : "");
          }

          return {
            ...prev,
            title,
            messages: [...prev.messages, newMessage],
          };
        });
      }
    } catch (error) {
      console.error("Error adding message:", error);
    }
  };

  // Generate a bot response using the real API
  const generateBotResponse = async (chatId: string, userMessage: string) => {
    setIsTyping(true);

    try {
      console.log("Generating bot response for:", userMessage);
      console.log(
        "Current conversation ID for chat:",
        chatId,
        "->",
        conversationIds[chatId]
      );

      // Get the conversation ID for this chat (if any)
      const currentConversationId = conversationIds[chatId];

      // Use the Server Action to process the chat message
      const result = await processChatMessage(
        chatId,
        userMessage,
        currentConversationId
      );

      console.log("API Response:", result);

      if (result.success && result.response) {
        // Update conversation ID if provided
        if (result.conversationId) {
          setConversationIds((prev) => ({
            ...prev,
            [chatId]: result.conversationId!,
          }));
          console.log(
            "Updated conversation ID for chat:",
            chatId,
            "->",
            result.conversationId
          );
        }

        // Add the AI response to the database
        await addMessageToChat(chatId, {
          content: result.response,
          role: "assistant",
        });
      } else {
        // Handle error case
        console.error("API Error:", result.error);

        await addMessageToChat(chatId, {
          content:
            result.error ||
            "Sorry, I encountered an error while processing your message.",
          role: "assistant",
        });
      }
    } catch (error) {
      console.error("Error generating bot response:", error);

      // Add error message to chat
      await addMessageToChat(chatId, {
        content:
          "Sorry, I encountered an error while processing your message. Please try again.",
        role: "assistant",
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Delete a chat
  const deleteChat = async (chatId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("chats")
        .delete()
        .eq("id", chatId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Get remaining chats before updating state
      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      const deletedChat = chats.find((chat) => chat.id === chatId);

      // Update local state
      setChats(remainingChats);

      // Clear conversation ID for this chat
      setConversationIds((prev) => {
        const updated = { ...prev };
        delete updated[chatId];
        return updated;
      });

      // Handle navigation after deletion
      /*  if (currentChat?.id === chatId) {
        if (remainingChats.length > 0) {
          // Find the next chat to navigate to
          const nextChat = deletedChat
            ? remainingChats.find(
                (chat) => chat.createdAt < deletedChat.createdAt
              ) || remainingChats[0]
            : remainingChats[0];

          setCurrentChat(nextChat);
          router.replace(`/chat/${nextChat.id}`);
        } else {
          // No chats remaining, go to home and create new chat
          setCurrentChat(null);
          router.replace("/");
        }
      } */

      if (remainingChats.length > 0) {
        // If there are remaining chats, set the first one as current
        setCurrentChat(remainingChats[0]);
        router.replace(`/chat/${remainingChats[0].id}`);
      } else {
        const newChat = await createNewChat();
        if (newChat) {
          setCurrentChat(newChat);
          router.replace(`/chat/${newChat.id}`);
        }
      }
      console.log("Chat deleted successfully:", chatId);
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        isTyping,
        loading,
        conversationIds,
        setCurrentChat,
        createNewChat,
        addMessageToChat,
        generateBotResponse,
        deleteChat,
        loadChats,
        resetConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
