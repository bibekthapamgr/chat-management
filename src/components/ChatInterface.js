"use client"

import { useState } from "react"
import { Send, Search, MoreVertical, MessageSquare } from "lucide-react"
import { cn } from "../utils/utils"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"

function ChatInterface({ chats, selectedChat, onSelectChat }) {
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredChats = chats.filter(
    (chat) =>
      chat.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim() && selectedChat) {
      // In a real app, you would send the message to an API
      console.log(`Sending message to ${selectedChat.customer.name}: ${message}`)
      setMessage("")
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
                    <div className="font-medium text-sm truncate">{chat.customer.name}</div>
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
                  <h2 className="font-medium text-sm">{selectedChat.customer.name}</h2>
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
            </div>
            <div className="p-3 border-t bg-background/95 backdrop-blur-sm">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-muted/50"
                />
                <Button type="submit" size="icon" className="rounded-full h-10 w-10 flex-shrink-0">
                  <Send size={18} />
                </Button>
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

function ChatMessage({ message }) {
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
        <div className="text-xs mt-1 opacity-70 text-right">{time}</div>
      </div>
    </div>
  )
}

export default ChatInterface
