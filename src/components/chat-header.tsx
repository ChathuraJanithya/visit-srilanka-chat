"use client"

import { ChevronDown, Lock, Plus, Settings, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useIsMobile } from "@/hooks/use-mobile"
import { useChat } from "@/context/chat-context"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ChatHeader() {
  const isMobile = useIsMobile()
  const { currentChat, createNewChat } = useChat()

  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-lg font-medium truncate max-w-[200px]">{currentChat ? currentChat.title : "AI Chat"}</h1>
        {!isMobile && (
          <>
            <Button variant="ghost" size="icon" className="ml-1" onClick={() => createNewChat()}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="ml-4">
              <span>Chat model</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <Button variant="outline" size="sm" asChild>
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            <span>Login</span>
          </Link>
        </Button>

        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Lock className="mr-2 h-4 w-4" />
                <span>Private Mode</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Chat Model</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Clear History</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Login</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button variant="outline" size="sm">
              <Lock className="mr-2 h-4 w-4" />
              <span>Private</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="default"
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors duration-200"
            >
              <span>Deploy with Vercel</span>
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
