import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { ChatProvider } from "@/context/chat-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Visit Sri Lanka",
  keywords: [
    "Sri Lanka",
    "Travel",
    "Tourism",
    "Vacation",
    "Explore",
    "Adventure",
    "Culture",
    "Nature",
    "Beaches",
    "Wildlife",
    "Heritage",
    "Cuisine",
    "Hiking",
    "Scenic",
    "Relaxation",
    "Island",
  ],
  authors: [{ name: "Visit Sri Lanka Team", url: "https://visitsrilanka.com" }],
  creator: "Visit Sri Lanka Team",
  openGraph: {
    title: "Visit Sri Lanka",
    description: "Discover the beauty and culture of Sri Lanka",
    url: "https://visitsrilanka.com",
    siteName: "Visit Sri Lanka",
    images: [
      {
        url: "https://visitsrilanka.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Visit Sri Lanka - Discover the beauty and culture of Sri Lanka",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  description: "Discover the beauty and culture of Sri Lanka",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ChatProvider>{children}</ChatProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
