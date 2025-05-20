"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import type { ChatMessage, ChatSession } from "@/types/chat"
import { mockChats, generateChatId } from "@/data/chat-data"

interface ChatContextProps {
  chats: ChatSession[]
  currentChat: ChatSession | null
  isTyping: boolean
  setCurrentChat: (chat: ChatSession | null) => void
  createNewChat: () => ChatSession
  addMessageToChat: (chatId: string, message: Omit<ChatMessage, "id" | "timestamp">) => void
  generateBotResponse: (chatId: string, userMessage: string) => void
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<ChatSession[]>(mockChats)
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  // Create a new chat
  const createNewChat = () => {
    const newChat: ChatSession = {
      id: generateChatId(),
      title: "New Chat",
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          content: "Hello! How can I help you today?",
          role: "assistant",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    }

    setChats((prevChats) => [newChat, ...prevChats])
    setCurrentChat(newChat)
    return newChat
  }

  // Add a message to a chat
  const addMessageToChat = (chatId: string, message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
    }

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          // Update chat title if it's the first user message
          let title = chat.title
          if (chat.title === "New Chat" && message.role === "user") {
            // Use the first 30 characters of the message as the title
            title = message.content.substring(0, 30) + (message.content.length > 30 ? "..." : "")
          }

          return {
            ...chat,
            title,
            messages: [...chat.messages, newMessage],
          }
        }
        return chat
      }),
    )

    // Update current chat if it's the active one
    if (currentChat?.id === chatId) {
      setCurrentChat((prev) => {
        if (!prev) return null

        // Update chat title if it's the first user message
        let title = prev.title
        if (prev.title === "New Chat" && message.role === "user") {
          // Use the first 30 characters of the message as the title
          title = message.content.substring(0, 30) + (message.content.length > 30 ? "..." : "")
        }

        return {
          ...prev,
          title,
          messages: [...prev.messages, newMessage],
        }
      })
    }
  }

  // Generate a bot response
  const generateBotResponse = (chatId: string, userMessage: string) => {
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Omit<ChatMessage, "id" | "timestamp"> = {
        content: `I'm an AI assistant here to help you. Your message was: ${userMessage}`,
        role: "assistant",
      }

      addMessageToChat(chatId, botResponse)
      setIsTyping(false)
    }, 2000)
  }

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        isTyping,
        setCurrentChat,
        createNewChat,
        addMessageToChat,
        generateBotResponse,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
