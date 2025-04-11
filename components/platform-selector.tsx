"use client"

import { Facebook, Instagram, MessageCircle, MessageSquare, MessagesSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Platform } from "@/lib/types"

interface PlatformSelectorProps {
  platforms: Platform[]
  selectedPlatformId: string
  onSelectPlatform: (platformId: string) => void
}

export function PlatformSelector({ platforms, selectedPlatformId, onSelectPlatform }: PlatformSelectorProps) {
  // Function to get the appropriate icon for each platform
  const getPlatformIcon = (platformId: string, size: number) => {
    switch (platformId) {
      case "facebook":
        return <Facebook size={size} />
      case "instagram":
        return <Instagram size={size} />
      case "zalo":
        return <MessageCircle size={size} />
      case "telegram":
        return <MessagesSquare size={size} />
      case "whatsapp":
        return <MessageCircle size={size} className="text-green-500" />
      default:
        return <MessageSquare size={size} />
    }
  }

  return (
    <div className="w-16 border-r bg-muted/20 flex flex-col items-center py-4">
      <div className="mb-6 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <MessageSquare size={20} className="text-primary" />
      </div>
      <div className="space-y-2 flex flex-col items-center">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center relative transition-all duration-200",
              selectedPlatformId === platform.id
                ? "bg-primary/10 text-primary shadow-sm"
                : "hover:bg-muted text-muted-foreground hover:text-foreground",
            )}
            onClick={() => onSelectPlatform(platform.id)}
            title={platform.name}
          >
            {getPlatformIcon(platform.id, 20)}
            {selectedPlatformId === platform.id && (
              <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
            )}

            {/* Connection status indicator */}
            {platform.connected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
