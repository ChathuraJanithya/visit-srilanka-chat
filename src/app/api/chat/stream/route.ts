import type { NextRequest } from "next/server";
import { sendStreamingChatMessage } from "@/lib/chat-api";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");
    const message = searchParams.get("message");
    const conversationId = searchParams.get("conversationId");

    if (!chatId || !message) {
      return new Response("Missing required parameters", { status: 400 });
    }

    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Verify the chat belongs to the user
    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .eq("user_id", user.id)
      .single();

    if (chatError || !chatData) {
      return new Response("Chat not found", { status: 404 });
    }

    // Get streaming response from API
    const apiResponse = await sendStreamingChatMessage({
      query: message,
      conversation_id: conversationId || "",
      user: user.id,
    });

    if (!apiResponse.success || !apiResponse.stream) {
      return new Response(
        apiResponse.error || "Failed to get streaming response",
        { status: 500 }
      );
    }

    // Return the stream with proper headers
    return new Response(apiResponse.stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Streaming API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
