"use server";

import { sendChatMessage } from "@/lib/chat-api";

export async function processChatMessage(
  chatId: string,
  userMessage: string,
  conversationId?: string
): Promise<{
  success: boolean;
  response?: string;
  conversationId?: string;
  error?: string;
}> {
  try {
    console.log("Processing chat message:", {
      chatId,
      userMessage: userMessage.substring(0, 50) + "...",
      conversationId,
    });

    // Send message to the chat API
    const apiResponse = await sendChatMessage({
      query: userMessage,
      conversation_id: conversationId, // This will be undefined for new conversations
      user: `user-${chatId}`, // Use chatId as part of user identifier for consistency
      response_mode: "blocking",
    });

    if (!apiResponse.success) {
      throw new Error(apiResponse.error || "Failed to get AI response");
    }

    // Extract the response and conversation ID
    const aiResponse =
      apiResponse.data?.answer || "I'm sorry, I couldn't generate a response.";
    const newConversationId = apiResponse.data?.conversation_id;

    console.log("API response processed:", {
      responseLength: aiResponse.length,
      newConversationId,
    });

    return {
      success: true,
      response: aiResponse,
      conversationId: newConversationId,
    };
  } catch (error) {
    console.error("Error processing chat message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
