"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Facebook,
  Instagram,
  MessageCircle,
  MessageSquare,
  Send,
  Search,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  X,
  Edit2,
  Save,
  User,
} from "lucide-react"

// Định nghĩa các kiểu dữ liệu
interface Platform {
  id: string
  name: string
  accounts: Account[]
}

interface Account {
  id: string
  name: string
  avatar?: string
  chats: Chat[]
}

interface Chat {
  id: string
  customer: Customer
  messages: Message[]
}

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  avatar?: string
  notes?: string
  online?: boolean
}

interface Message {
  sender: "user" | "customer"
  content: string
  timestamp: number
}

// Dữ liệu mẫu
const platforms: Platform[] = [
  {
    id: "facebook",
    name: "Facebook",
    accounts: [
      {
        id: "fb-account-1",
        name: "Trang chính thức",
        avatar: "/placeholder.svg?height=40&width=40",
        chats: [
          {
            id: "fb-chat-1",
            customer: {
              id: "customer-1",
              name: "Nguyễn Văn A",
              email: "nguyenvana@example.com",
              phone: "0901234567",
              address: "123 Đường ABC, Quận 1, TP.HCM",
              notes: "Khách hàng thân thiết, thường mua sản phẩm cao cấp.",
              online: true,
            },
            messages: [
              {
                sender: "customer",
                content: "Xin chào, tôi muốn hỏi về sản phẩm mới của bạn",
                timestamp: Date.now() - 3600000,
              },
              {
                sender: "user",
                content: "Chào bạn, chúng tôi vừa ra mắt dòng sản phẩm mới. Bạn quan tâm đến loại nào?",
                timestamp: Date.now() - 3500000,
              },
              {
                sender: "customer",
                content: "Tôi quan tâm đến mẫu XYZ. Bạn có thể cho tôi biết giá không?",
                timestamp: Date.now() - 3400000,
              },
            ],
          },
          {
            id: "fb-chat-2",
            customer: {
              id: "customer-2",
              name: "Trần Thị B",
              email: "tranthib@example.com",
              phone: "0909876543",
              notes: "Khách hàng mới, cần tư vấn kỹ.",
            },
            messages: [
              {
                sender: "customer",
                content: "Sản phẩm của bạn có ship đến Hà Nội không?",
                timestamp: Date.now() - 86400000,
              },
              {
                sender: "user",
                content: "Dạ có ạ, chúng tôi ship toàn quốc. Thời gian giao hàng từ 2-3 ngày.",
                timestamp: Date.now() - 85000000,
              },
            ],
          },
        ],
      },
      {
        id: "fb-account-2",
        name: "Nhóm hỗ trợ",
        chats: [
          {
            id: "fb-chat-3",
            customer: {
              id: "customer-3",
              name: "Lê Văn C",
              phone: "0912345678",
            },
            messages: [
              {
                sender: "customer",
                content: "Tôi cần hỗ trợ về đơn hàng #12345",
                timestamp: Date.now() - 172800000,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    accounts: [
      {
        id: "ig-account-1",
        name: "Instagram Official",
        avatar: "/placeholder.svg?height=40&width=40",
        chats: [
          {
            id: "ig-chat-1",
            customer: {
              id: "customer-4",
              name: "Phạm Thị D",
              notes: "Influencer, có thể hợp tác marketing.",
            },
            messages: [
              {
                sender: "customer",
                content: "Tôi muốn hợp tác quảng cáo sản phẩm của bạn",
                timestamp: Date.now() - 259200000,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "zalo",
    name: "Zalo",
    accounts: [
      {
        id: "zalo-account-1",
        name: "Zalo Business",
        chats: [
          {
            id: "zalo-chat-1",
            customer: {
              id: "customer-5",
              name: "Hoàng Văn E",
              phone: "0987654321",
              address: "456 Đường XYZ, Quận 2, TP.HCM",
            },
            messages: [
              {
                sender: "customer",
                content: "Chào shop, tôi muốn đặt hàng",
                timestamp: Date.now() - 432000000,
              },
            ],
          },
        ],
      },
    ],
  },
]

// Utility function to conditionally join classNames
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

export default function ChatDashboard() {
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0])
  const [selectedAccount, setSelectedAccount] = useState(selectedPlatform.accounts[0])
  const [selectedChat, setSelectedChat] = useState(selectedAccount.chats.length > 0 ? selectedAccount.chats[0] : null)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [notes, setNotes] = useState(selectedChat?.customer.notes || "")
  const [isEditing, setIsEditing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMessageSending, setIsMessageSending] = useState(false)
  const [messages, setMessages] = useState<Message[]>(selectedChat?.messages || [])
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Update messages when selected chat changes
  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages)
      setNotes(selectedChat.customer.notes || "")
    }
  }, [selectedChat])

  // Simulate loading when changing platform
  const handlePlatformChange = (platformId: string) => {
    setIsLoading(true)

    setTimeout(() => {
      const platform = platforms.find((p) => p.id === platformId)
      if (platform) {
        setSelectedPlatform(platform)
        setSelectedAccount(platform.accounts[0])
        setSelectedChat(platform.accounts[0].chats.length > 0 ? platform.accounts[0].chats[0] : null)
      }
      setIsLoading(false)
    }, 300)
  }

  const handleAccountChange = (accountId: string) => {
    setIsLoading(true)

    setTimeout(() => {
      const account = selectedPlatform.accounts.find((a) => a.id === accountId)
      if (account) {
        setSelectedAccount(account)
        setSelectedChat(account.chats.length > 0 ? account.chats[0] : null)
      }
      setIsLoading(false)
    }, 200)
  }

  const handleChatChange = (chatId: string) => {
    const chat = selectedAccount.chats.find((c) => c.id === chatId)
    if (chat) {
      setSelectedChat(chat)
      setNotes(chat.customer.notes || "")
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && selectedChat) {
      setIsMessageSending(true)

      // Simulate sending message
      setTimeout(() => {
        const newMessage: Message = {
          sender: "user",
          content: message,
          timestamp: Date.now(),
        }

        setMessages((prev) => [...prev, newMessage])
        setMessage("")
        setIsMessageSending(false)
      }, 500)
    }
  }

  const handleSaveNotes = () => {
    // Simulate saving notes
    setTimeout(() => {
      console.log(`Saving notes for ${selectedChat?.customer.name}: ${notes}`)
      setIsEditing(false)
    }, 300)
  }

  // Function to get the appropriate icon for each platform
  const getPlatformIcon = (platformId: string, size: number) => {
    switch (platformId) {
      case "facebook":
        return <Facebook size={size} />
      case "instagram":
        return <Instagram size={size} />
      case "zalo":
        return <MessageCircle size={size} />
      default:
        return <MessageSquare size={size} />
    }
  }

  const filteredChats = selectedAccount.chats.filter(
    (chat) =>
      chat.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="flex h-screen bg-white">
      {/* Layer 1: Platforms */}
      <div className="w-16 border-r bg-gray-50 flex flex-col items-center py-4">
        <div className="mb-6 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
          <MessageSquare size={20} className="text-blue-600" />
        </div>
        <div className="space-y-2 flex flex-col items-center">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center relative transition-all duration-300 transform hover:scale-110",
                selectedPlatform.id === platform.id
                  ? "bg-blue-100 text-blue-600 shadow-md"
                  : "hover:bg-gray-200 text-gray-500 hover:text-gray-700",
              )}
              onClick={() => handlePlatformChange(platform.id)}
              title={platform.name}
            >
              {getPlatformIcon(platform.id, 20)}
              {selectedPlatform.id === platform.id && (
                <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Layer 2: Accounts */}
      <div className="w-56 border-r overflow-y-auto bg-white">
        <div className="p-3 border-b sticky top-0 bg-white z-10 backdrop-blur-sm">
          <h2 className="font-medium text-sm">{selectedPlatform.name}</h2>
        </div>
        <div className="py-1">
          {isLoading
            ? // Skeleton loading for accounts
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="px-3 py-2 flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  </div>
                ))
            : selectedPlatform.accounts.map((account) => (
                <button
                  key={account.id}
                  className={cn(
                    "w-full text-left px-3 py-2 flex items-center space-x-2 transition-all duration-300",
                    selectedAccount.id === account.id
                      ? "bg-blue-50 text-blue-600 border-l-2 border-blue-600"
                      : "hover:bg-gray-100 text-gray-500 hover:text-gray-700 border-l-2 border-transparent",
                  )}
                  onClick={() => handleAccountChange(account.id)}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden transition-transform duration-300 hover:scale-105">
                    {account.avatar ? (
                      <img
                        src={account.avatar || "/placeholder.svg"}
                        alt={account.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <div className="truncate">
                    <div className="font-medium text-sm truncate">{account.name}</div>
                    <div className="text-xs text-gray-500 truncate">{account.chats.length} cuộc trò chuyện</div>
                  </div>
                </button>
              ))}
        </div>
      </div>

      {/* Layer 3: Chat messages and customer info */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat list */}
        <div className="w-64 border-r overflow-hidden flex flex-col bg-gray-50">
          <div className="p-3 border-b sticky top-0 bg-white z-10 backdrop-blur-sm">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                placeholder="Tìm kiếm..."
                className="pl-8 h-9 w-full rounded-md border border-gray-300 bg-white transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 scroll-smooth" ref={chatContainerRef}>
            {isLoading ? (
              // Skeleton loading for chats
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="p-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded animate-pulse w-full"></div>
                      </div>
                    </div>
                  </div>
                ))
            ) : filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  className={cn(
                    "w-full text-left p-3 border-b border-gray-200 transition-all duration-300",
                    selectedChat?.id === chat.id
                      ? "bg-blue-50 text-blue-600 border-l-2 border-blue-600"
                      : "hover:bg-gray-100 border-l-2 border-transparent",
                  )}
                  onClick={() => handleChatChange(chat.id)}
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center transform transition-transform duration-300 hover:scale-105">
                      {chat.customer.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{chat.customer.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {chat.messages.length > 0
                          ? chat.messages[chat.messages.length - 1].content
                          : "Không có tin nhắn"}
                      </div>
                    </div>
                    {chat.messages.length > 0 && (
                      <div className="text-xs text-gray-500 whitespace-nowrap">
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
              <div className="p-4 text-center text-gray-500 text-sm">Không tìm thấy cuộc trò chuyện</div>
            )}
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedChat ? (
            <>
              <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-white z-10 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center transform transition-transform duration-300 hover:scale-105">
                    {selectedChat.customer.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-medium text-sm">{selectedChat.customer.name}</h2>
                    <div className="text-xs text-gray-500 flex items-center">
                      <span
                        className={cn(
                          "inline-block w-2 h-2 rounded-full mr-1",
                          selectedChat.customer.online ? "bg-green-500" : "bg-gray-400",
                        )}
                      ></span>
                      {selectedChat.customer.online ? "Đang hoạt động" : "Không hoạt động"}
                    </div>
                  </div>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300">
                  <MoreVertical size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-smooth">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex transition-all duration-500 animate-fadeIn",
                      msg.sender === "user" ? "justify-end" : "justify-start",
                    )}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      opacity: isMessageSending && index === messages.length - 1 ? 0.7 : 1,
                    }}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl p-3 shadow-sm transform transition-all duration-300",
                        msg.sender === "user"
                          ? "bg-blue-600 text-white rounded-tr-none hover:bg-blue-700"
                          : "bg-white rounded-tl-none hover:shadow-md",
                      )}
                    >
                      <div className="text-sm">{msg.content}</div>
                      <div className="text-xs mt-1 opacity-70 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
                {isMessageSending && (
                  <div className="flex justify-end">
                    <div className="max-w-[75%] rounded-2xl p-3 shadow-sm bg-blue-400 text-white rounded-tr-none animate-pulse">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-3 border-t bg-white">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 h-10 rounded-md border border-gray-300 px-3 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isMessageSending}
                  />
                  <button
                    type="submit"
                    className={cn(
                      "rounded-full h-10 w-10 flex-shrink-0 bg-blue-600 text-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:bg-blue-700",
                      isMessageSending ? "opacity-70 cursor-not-allowed" : "hover:shadow-md",
                    )}
                    disabled={isMessageSending}
                  >
                    <Send size={18} className={isMessageSending ? "animate-pulse" : ""} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 flex-col p-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4 animate-pulse">
                <MessageSquare size={24} className="text-gray-400" />
              </div>
              <p className="text-center">Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </div>

        {/* Customer info */}
        {selectedChat && isExpanded ? (
          <div className="w-72 border-l overflow-hidden flex flex-col bg-white transition-all duration-500 ease-in-out">
            <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-white z-10 backdrop-blur-sm">
              <h2 className="font-medium text-sm">Thông tin khách hàng</h2>
              <button
                className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors duration-300"
                onClick={() => setIsExpanded(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-3">
              <div className="flex items-center space-x-3 mb-4 p-2 bg-gray-100 rounded-lg transform transition-transform duration-300 hover:scale-102 hover:shadow-sm">
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                  {selectedChat.customer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-semibold">{selectedChat.customer.name}</h2>
                  <div className="text-sm text-gray-500">{selectedChat.customer.email || "Không có email"}</div>
                </div>
              </div>

              <div className="space-y-3">
                {selectedChat.customer.phone && (
                  <div className="text-sm transform transition-all duration-300 hover:translate-x-1">
                    <div className="flex items-center text-gray-500 mb-1">
                      <Phone size={14} />
                      <span className="ml-1">Số điện thoại</span>
                    </div>
                    <div className="pl-5">{selectedChat.customer.phone}</div>
                  </div>
                )}

                {selectedChat.customer.email && (
                  <div className="text-sm transform transition-all duration-300 hover:translate-x-1">
                    <div className="flex items-center text-gray-500 mb-1">
                      <Mail size={14} />
                      <span className="ml-1">Email</span>
                    </div>
                    <div className="pl-5">{selectedChat.customer.email}</div>
                  </div>
                )}

                {selectedChat.customer.address && (
                  <div className="text-sm transform transition-all duration-300 hover:translate-x-1">
                    <div className="flex items-center text-gray-500 mb-1">
                      <MapPin size={14} />
                      <span className="ml-1">Địa chỉ</span>
                    </div>
                    <div className="pl-5">{selectedChat.customer.address}</div>
                  </div>
                )}

                <hr className="my-4" />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">Ghi chú</div>
                    {!isEditing ? (
                      <button
                        className="h-7 px-2 text-sm rounded hover:bg-gray-100 transition-colors duration-300 flex items-center"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 size={14} className="mr-1" />
                        Sửa
                      </button>
                    ) : (
                      <button
                        className="h-7 px-2 text-sm rounded hover:bg-gray-100 transition-colors duration-300 flex items-center"
                        onClick={handleSaveNotes}
                      >
                        <Save size={14} className="mr-1" />
                        Lưu
                      </button>
                    )}
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    readOnly={!isEditing}
                    className={cn(
                      "min-h-[120px] text-sm w-full rounded-md p-2 transition-all duration-300",
                      !isEditing
                        ? "bg-gray-100 border-0 focus:outline-none resize-none"
                        : "border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    )}
                    placeholder="Thêm ghi chú về khách hàng..."
                  />
                </div>
              </div>
            </div>
          </div>
        ) : selectedChat ? (
          <div className="w-12 border-l flex flex-col items-center py-4 bg-white transition-all duration-500 ease-in-out">
            <button
              onClick={() => setIsExpanded(true)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-4 hover:bg-gray-200 transition-all duration-300 transform hover:scale-110"
            >
              <User size={16} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
