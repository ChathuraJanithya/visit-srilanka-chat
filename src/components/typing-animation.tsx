"use client"

export function TypingAnimation() {
  return (
    <div className="flex space-x-1.5 p-2 items-center justify-center">
      <div className="h-2 w-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-pulse"></div>
      <div className="h-2 w-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-pulse delay-150"></div>
      <div className="h-2 w-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-pulse delay-300"></div>
    </div>
  )
}
