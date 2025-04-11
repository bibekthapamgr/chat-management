"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Send, Search, MoreVertical, MessageSquare, Facebook } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"

interface Message {
  id: string
  page_id: string
  sender_id: string | null
  recipient_id: string | null
  message: string
  direction: "incoming" | "outgoing"
  timestamp: number
  created_at: string
}

interface Conversation {
  user_id: string
  user_name: string
  profile_pic: string | null
  last_message: string
  last_message_time: number
}

interface FacebookChatProps {
  pageId: string
  pageName: string
}

export function FacebookChat({ pageId, pageName }: FacebookChatProps) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations when page changes
  useEffect(() => {
    fetchConversations()
  }, [pageId])

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const fetchConversations = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`http://154.53.42.207/backend/get-conversations.php?pageId=${pageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setConversations(data.conversations)
        if (data.conversations.length > 0 && !selectedConversation) {
          setSelectedConversation(data.conversations[0].user_id)
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (senderId: string) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(
        `http://154.53.42.207/backend/get-messages.php?pageId=${pageId}&senderId=${senderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()
      if (data.success) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setIsSending(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("http://154.53.42.207/backend/send-message.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pageId,
          recipientId: selectedConversation,
          message: newMessage,
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Add the message to the UI immediately
        const newMsg: Message = {
          id: Date.now().toString(),
          page_id: pageId,
          sender_id: null,
          recipient_id: selectedConversation,
          message: newMessage,
          direction: "outgoing",
          timestamp: Math.floor(Date.now() / 1000),
          created_at: new Date().toISOString(),
        }
        setMessages([...messages, newMsg])
        setNewMessage("")

        // Update the conversation list
        setConversations(
          conversations.map((conv) => {
            if (conv.user_id === selectedConversation) {
              return {
                ...conv,
                last_message: newMessage,
                last_message_time: Math.floor(Date.now() / 1000),
              }
            }
            return conv
          }),
        )
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.user_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Conversations list */}
      <div className="w-64 border-r overflow-hidden flex flex-col bg-muted/10">
        <div className="p-3 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <div className="flex items-center space-x-2 mb-3">
            <Facebook className="text-blue-600" size={18} />
            <h2 className="font-medium text-sm">{pageName}</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-8 h-9 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {isLoading && !conversations.length ? (
            // Skeleton loading for conversations
            Array(5)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="p-3 border-b border-border/50">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                      <div className="h-2 bg-muted rounded animate-pulse w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <button
                key={conv.user_id}
                className={cn(
                  "w-full text-left p-3 border-b border-border/50 transition-colors",
                  selectedConversation === conv.user_id
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "hover:bg-muted/50",
                )}
                onClick={() => setSelectedConversation(conv.user_id)}
              >
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={conv.profile_pic || "/placeholder.svg"} />
                    <AvatarFallback>{conv.user_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{conv.user_name}</div>
                    <div className="text-xs text-muted-foreground truncate">{conv.last_message}</div>
                  </div>
                  {conv.last_message_time && (
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(conv.last_message_time * 1000).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm">No conversations found</div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedConversation ? (
          <>
            <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      conversations.find((c) => c.user_id === selectedConversation)?.profile_pic || "/placeholder.svg"
                    }
                  />
                  <AvatarFallback>
                    {conversations.find((c) => c.user_id === selectedConversation)?.user_name.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium text-sm">
                    {conversations.find((c) => c.user_id === selectedConversation)?.user_name || "Unknown"}
                  </h2>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Facebook className="mr-1 text-blue-600" size={12} />
                    <span>Facebook Messenger</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical size={18} />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
              {isLoading && !messages.length ? (
                // Skeleton loading for messages
                Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className={cn("flex", index % 2 === 0 ? "justify-start" : "justify-end")}>
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl p-3 shadow-sm animate-pulse",
                          index % 2 === 0 ? "bg-muted" : "bg-primary/20",
                        )}
                        style={{ width: `${Math.floor(Math.random() * 40) + 30}%` }}
                      >
                        <div className="h-4 bg-muted-foreground/20 rounded"></div>
                      </div>
                    </div>
                  ))
              ) : messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={cn("flex", msg.direction === "outgoing" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl p-3 shadow-sm",
                        msg.direction === "outgoing"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted rounded-tl-none",
                      )}
                    >
                      <div className="text-sm">{msg.message}</div>
                      <div className="text-xs mt-1 opacity-70 text-right">
                        {new Date(msg.timestamp * 1000).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No messages yet</div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t bg-background/95 backdrop-blur-sm">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-muted/50"
                  disabled={isSending}
                />
                <Button type="submit" size="icon" className="rounded-full h-10 w-10 flex-shrink-0" disabled={isSending}>
                  <Send size={18} className={isSending ? "animate-pulse" : ""} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col p-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-muted-foreground" />
            </div>
            <p className="text-center">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}
