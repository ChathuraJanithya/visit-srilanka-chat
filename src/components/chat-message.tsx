import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";
//import { formatDistanceToNow } from "date-fns"

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  // Format the timestamp to show how long ago the message was sent
  // const timeAgo = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })

  return (
    <div
      className={cn(
        "flex w-full items-start gap-2 py-2 animate-in fade-in-0 slide-in-from-bottom-3 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] sm:max-w-[75%] flex-col gap-1 rounded-2xl px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-muted rounded-tl-none"
        )}
      >
        {message.content.split("\n").map((line, i) => (
          <p key={i} className="whitespace-pre-wrap text-sm sm:text-base">
            {line}
          </p>
        ))}
        {/* <span className="text-[10px] opacity-70 self-end mt-1">{timeAgo}</span> */}
      </div>
    </div>
  );
}
