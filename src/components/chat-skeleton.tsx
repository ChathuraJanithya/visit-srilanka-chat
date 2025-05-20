import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatSkeleton() {
  return (
    <div className="space-y-6 py-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            "flex w-full items-start gap-3 py-3",
            i % 2 === 0 ? "justify-end" : "justify-start"
          )}
        >
          {/* Sparkles icon with pulse */}
          <div
            className={cn(
              "flex items-center",
              i % 2 === 0 ? "order-2" : "order-1"
            )}
          >
            <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
          </div>

          <div
            className={cn(
              "flex max-w-[70%] flex-col gap-2 rounded-3xl px-6 py-3 shadow-md",
              i % 2 === 0
                ? "bg-primary/25 text-primary-700 rounded-tr-none"
                : "bg-muted/60 text-muted-900 rounded-tl-none"
            )}
          >
            <div className="h-5 w-28 rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse" />
            <div className="h-5 w-40 rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse" />
            {i === 3 && (
              <div className="h-5 w-32 rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse" />
            )}
            <div className="h-3 w-16 self-end rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
