"use server";

interface ChatAPIResponse {
  event: string;
  conversation_id: string;
  message_id: string;
  created_at: number;
  task_id: string;
  id: string;
  answer: string;
}

interface ChatAPIRequest {
  query: string;
  conversation_id?: string;
  user: string;
  inputs?: Record<string, any>;
  response_mode?: "streaming" | "blocking";
  files?: Array<{
    type: string;
    transfer_method: string;
    url: string;
  }>;
}

export async function sendChatMessage(request: ChatAPIRequest): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;
    const apiKey = process.env.CHAT_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error("Chat API configuration missing");
    }

    // If conversation_id is empty or null, don't include it in the request
    // This will create a new conversation
    const requestBody: any = {
      inputs: request.inputs || {},
      query: request.query,
      response_mode: request.response_mode || "blocking",
      user: request.user,
      files: request.files || [],
    };

    // Only include conversation_id if it's a valid non-empty string
    if (request.conversation_id && request.conversation_id.trim() !== "") {
      requestBody.conversation_id = request.conversation_id;
    }

    console.log("Sending API request:", {
      url: `${apiUrl}/chat-messages`,
      body: requestBody,
    });

    const response = await fetch(`${apiUrl}/chat-messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      // If it's a conversation not found error and we had a conversation_id,
      // try again without the conversation_id to start a new conversation
      if (response.status === 404 && request.conversation_id) {
        console.log("Conversation not found, starting new conversation...");
        return sendChatMessage({
          ...request,
          conversation_id: undefined, // Remove the invalid conversation_id
        });
      }

      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("API Success Response:", data);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Chat API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function sendStreamingChatMessage(
  request: ChatAPIRequest
): Promise<{
  success: boolean;
  stream?: ReadableStream;
  error?: string;
}> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;
    const apiKey = process.env.CHAT_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error("Chat API configuration missing");
    }

    // If conversation_id is empty or null, don't include it in the request
    const requestBody: any = {
      inputs: request.inputs || {},
      query: request.query,
      response_mode: "streaming",
      user: request.user,
      files: request.files || [],
    };

    // Only include conversation_id if it's a valid non-empty string
    if (request.conversation_id && request.conversation_id.trim() !== "") {
      requestBody.conversation_id = request.conversation_id;
    }

    const response = await fetch(`${apiUrl}/chat-messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();

      // If it's a conversation not found error and we had a conversation_id,
      // try again without the conversation_id
      if (response.status === 404 && request.conversation_id) {
        return sendStreamingChatMessage({
          ...request,
          conversation_id: undefined,
        });
      }

      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    return {
      success: true,
      //@ts-ignore
      stream: response.body,
    };
  } catch (error) {
    console.error("Streaming chat API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
