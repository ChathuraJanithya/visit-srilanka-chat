import type React from "react";
import { ChatProvider } from "@/context/chat-context";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ChatProvider>{children}</ChatProvider>
    </ThemeProvider>
  );
}
