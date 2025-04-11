"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Search, MoreVertical, MessageSquare, ImageIcon, Paperclip, Smile } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Chat, Message, MessageAttachment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { sendFacebookMessage, sendInstagramMessage } from "@/lib/services/facebook-service"
import { Facebook, Instagram } from "lucide-react"

interface ChatInterfaceProps {
  chats: Chat[]
  selectedChat: Chat | null
  onSelectChat: (chatId: string) => void
}

export function ChatInterface({ chats, selectedChat, onSelectChat }: ChatInterfaceProps) {
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const filteredChats = chats.filter(
    (chat) =>
      chat.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedChat?.messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && selectedChat) {
      setIsLoading(true)

      try {
        // In a real app, you would get these from your database
        const pageAccessToken = "YOUR_PAGE_ACCESS_TOKEN"
        const recipientId = selectedChat.customer.platformUserId || ""

        // Send message based on platform type
        if (selectedChat.platformType === "facebook") {
          await sendFacebookMessage(recipientId, message, pageAccessToken)
        } else if (selectedChat.platformType === "instagram") {
          await sendInstagramMessage(recipientId, message, pageAccessToken)
        }

        // In a real app, the message would be added via webhook
        // For demo purposes, we'll add it directly
        const newMessage: Message = {
          sender: "user",
          content: message,
          timestamp: Date.now(),
        }

        // Here you would update your database
        console.log(`Sending message to ${selectedChat.customer.name}: ${message}`)

        setMessage("")
      } catch (error) {
        console.error("Error sending message:", error)
        // Show error to user
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Chat list - Made more compact */}
      <div className="w-64 border-r overflow-hidden flex flex-col bg-muted/10">
        <div className="p-3 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-8 h-9 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                className={cn(
                  "w-full text-left p-3 border-b border-border/50 transition-colors",
                  selectedChat?.id === chat.id ? "bg-primary/10 text-primary border-primary/20" : "hover:bg-muted/50",
                )}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={chat.customer.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{chat.customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate flex items-center">
                      {chat.customer.name}
                      {chat.platformType && (
                        <span className="ml-1">
                          {chat.platformType === "facebook" ? (
                            <Facebook size={12} className="text-blue-600" />
                          ) : (
                            <Instagram size={12} className="text-pink-600" />
                          )}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : "Không có tin nhắn"}
                    </div>
                  </div>
                  {chat.messages.length > 0 && (
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(chat.messages[chat.messages.length - 1].timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm">Không tìm thấy cuộc trò chuyện</div>
          )}
        </div>
      </div>

      {/* Chat messages - Enlarged */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedChat ? (
          <>
            <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedChat.customer.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{selectedChat.customer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium text-sm flex items-center">
                    {selectedChat.customer.name}
                    {selectedChat.platformType && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-muted">
                        {selectedChat.platformType === "facebook" ? "Facebook" : "Instagram"}
                      </span>
                    )}
                  </h2>
                  <div className="text-xs text-muted-foreground">
                    {selectedChat.customer.online ? "Đang hoạt động" : "Không hoạt động"}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical size={18} />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
              {selectedChat.messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t bg-background/95 backdrop-blur-sm">
              <form onSubmit={handleSendMessage} className="space-y-2">
                <div className="flex space-x-2">
                  <Button type="button" variant="ghost" size="icon" className="rounded-full h-10 w-10 flex-shrink-0">
                    <Paperclip size={18} />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="rounded-full h-10 w-10 flex-shrink-0">
                    <ImageIcon size={18} />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="rounded-full h-10 w-10 flex-shrink-0">
                    <Smile size={18} />
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 bg-muted/50"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full h-10 w-10 flex-shrink-0"
                    disabled={isLoading}
                  >
                    <Send size={18} className={isLoading ? "animate-pulse" : ""} />
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col p-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-muted-foreground" />
            </div>
            <p className="text-center">Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface ChatMessageProps {
  message: Message
}

function ChatMessage({ message }: ChatMessageProps) {
  const isOutgoing = message.sender === "user"
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <div className={cn("flex", isOutgoing ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl p-3 shadow-sm",
          isOutgoing ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none",
        )}
      >
        <div className="text-sm">{message.content}</div>

        {/* Render attachments if any */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((attachment, index) => (
              <MessageAttachmentView key={index} attachment={attachment} />
            ))}
          </div>
        )}

        <div className="text-xs mt-1 opacity-70 text-right flex justify-end items-center">
          <span>{time}</span>
          {isOutgoing && (
            <span className="ml-1">
              {message.read ? (
                <span className="text-blue-500">✓✓</span>
              ) : message.delivered ? (
                <span className="text-gray-400">✓</span>
              ) : null}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface MessageAttachmentViewProps {
  attachment: MessageAttachment
}

function MessageAttachmentView({ attachment }: MessageAttachmentViewProps) {
  switch (attachment.type) {
    case "image":
      return (
        <div className="rounded-md overflow-hidden">
          <img src={attachment.url || "/placeholder.svg"} alt="Image attachment" className="max-w-full h-auto" />
        </div>
      )
    case "video":
      return (
        <div className="rounded-md overflow-hidden">
          <video src={attachment.url} controls className="max-w-full h-auto" />
        </div>
      )
    case "audio":
      return (
        <div>
          <audio src={attachment.url} controls className="w-full" />
        </div>
      )
    case "file":
      return (
        <div className="bg-background/80 p-2 rounded-md flex items-center">
          <Paperclip size={16} className="mr-2" />
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            {attachment.name || "Download file"}
          </a>
          {attachment.size && (
            <span className="text-xs text-muted-foreground ml-2">({formatFileSize(attachment.size)})</span>
          )}
        </div>
      )
    default:
      return null
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
  else return (bytes / 1048576).toFixed(1) + " MB"
}
