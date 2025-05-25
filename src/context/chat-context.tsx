"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { ChatMessage, ChatSession } from "@/types/chat";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";

interface ChatContextProps {
  chats: ChatSession[];
  currentChat: ChatSession | null;
  isTyping: boolean;
  loading: boolean;
  setCurrentChat: (chat: ChatSession | null) => void;
  createNewChat: () => Promise<ChatSession | null>;
  addMessageToChat: (
    chatId: string,
    message: Omit<ChatMessage, "id" | "timestamp">
  ) => Promise<void>;
  generateBotResponse: (chatId: string, userMessage: string) => void;
  deleteChat: (chatId: string) => Promise<void>;
  loadChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load chats from Supabase
  const loadChats = async () => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch chats with their messages
      const { data: chatsData, error: chatsError } = await supabase
        .from("chats")
        .select(
          `
          id,
          title,
          created_at,
          messages (
            id,
            content,
            role,
            created_at
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (chatsError) throw chatsError;

      const formattedChats: ChatSession[] = chatsData.map((chat: any) => ({
        id: chat.id,
        title: chat.title,
        createdAt: new Date(chat.created_at),
        messages: chat.messages
          .map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            role: msg.role,
            timestamp: new Date(msg.created_at),
          }))
          .sort(
            (a: any, b: any) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ),
      }));

      setChats(formattedChats);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load chats when user changes
  useEffect(() => {
    loadChats();
  }, [user]);

  // Create a new chat
  const createNewChat = async (): Promise<ChatSession | null> => {
    if (!user) return null;

    try {
      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .insert({
          user_id: user.id,
          title: "New Chat",
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Create welcome message
      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .insert({
          chat_id: chatData.id,
          content: "Hello! How can I help you today?",
          role: "assistant",
        })
        .select()
        .single();

      if (messageError) throw messageError;

      const newChat: ChatSession = {
        id: chatData.id,
        title: chatData.title,
        createdAt: new Date(chatData.created_at),
        messages: [
          {
            id: messageData.id,
            content: messageData.content,
            role: messageData.role as "user" | "assistant",
            timestamp: new Date(messageData.created_at),
          },
        ],
      };

      setChats((prevChats) => [newChat, ...prevChats]);
      setCurrentChat(newChat);
      return newChat;
    } catch (error) {
      console.error("Error creating chat:", error);
      return null;
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

  // Generate a bot response
  const generateBotResponse = (chatId: string, userMessage: string) => {
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Omit<ChatMessage, "id" | "timestamp"> = {
        content: `I'm an AI assistant here to help you. Your message was: ${userMessage}`,
        role: "assistant",
      };

      addMessageToChat(chatId, botResponse);
      setIsTyping(false);
    }, 2000);
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

      // Update local state
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

      // Clear current chat if it was deleted
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
      }
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
        setCurrentChat,
        createNewChat,
        addMessageToChat,
        generateBotResponse,
        deleteChat,
        loadChats,
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
