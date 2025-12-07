"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const loaderVariants = {
  spinner: "animate-spin rounded-full border-2 border-current border-t-transparent",
  dots: "flex gap-1",
  pulse: "animate-pulse rounded-full bg-current",
}

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof loaderVariants
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
}

function Loader({ 
  variant = "spinner", 
  size = "md", 
  className,
  ...props 
}: LoaderProps) {
  if (variant === "dots") {
    return (
      <div className={cn("flex gap-1", className)} {...props}>
        <div className={cn("h-2 w-2 rounded-full bg-current animate-bounce", "[animation-delay:-0.3s]")} />
        <div className={cn("h-2 w-2 rounded-full bg-current animate-bounce", "[animation-delay:-0.15s]")} />
        <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
      </div>
    )
  }

  if (variant === "pulse") {
    return (
      <div
        className={cn(
          "animate-pulse rounded-full bg-current",
          sizeMap[size],
          className
        )}
        {...props}
      />
    )
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeMap[size],
        className
      )}
      {...props}
    />
  )
}

export { Loader }
