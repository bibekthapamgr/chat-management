"use client"

import { useState, useEffect } from "react"
import { PlatformSelector } from "@/components/platform-selector"
import { AccountSelector } from "@/components/account-selector"
import { ChatInterface } from "@/components/chat-interface"
import { FacebookChat } from "@/components/facebook-chat"
import { CustomerInfo } from "@/components/customer-info"
import { platforms } from "@/lib/data"
import { Settings, LogOut, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

interface FacebookPage {
  id: string
  page_id: string
  page_name: string
  access_token: string
  created_at: string
}

export function ChatDashboard() {
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0])
  const [selectedAccount, setSelectedAccount] = useState(selectedPlatform.accounts[0])
  const [selectedChat, setSelectedChat] = useState(selectedAccount.chats.length > 0 ? selectedAccount.chats[0] : null)
  const [facebookPages, setFacebookPages] = useState<FacebookPage[]>([])
  const [selectedFacebookPage, setSelectedFacebookPage] = useState<FacebookPage | null>(null)
  const [showFacebook, setShowFacebook] = useState(false)
  const { logout, user } = useAuth()

  // Fetch Facebook pages on component mount
  useEffect(() => {
    fetchFacebookPages()
  }, [])

  const fetchFacebookPages = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("https://your-cpanel-domain.com/backend/get-facebook-pages.php", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success && data.pages.length > 0) {
        setFacebookPages(data.pages)
        setSelectedFacebookPage(data.pages[0])
      }
    } catch (error) {
      console.error("Error fetching Facebook pages:", error)
    }
  }

  const handlePlatformChange = (platformId: string) => {
    if (platformId === "facebook") {
      setShowFacebook(true)
      return
    }

    setShowFacebook(false)
    const platform = platforms.find((p) => p.id === platformId)
    if (platform) {
      setSelectedPlatform(platform)
      setSelectedAccount(platform.accounts[0])
      setSelectedChat(platform.accounts[0].chats.length > 0 ? platform.accounts[0].chats[0] : null)
    }
  }

  const handleAccountChange = (accountId: string) => {
    if (showFacebook) {
      const page = facebookPages.find((p) => p.id === accountId)
      if (page) {
        setSelectedFacebookPage(page)
      }
      return
    }

    const account = selectedPlatform.accounts.find((a) => a.id === accountId)
    if (account) {
      setSelectedAccount(account)
      setSelectedChat(account.chats.length > 0 ? account.chats[0] : null)
    }
  }

  const handleChatChange = (chatId: string) => {
    const chat = selectedAccount.chats.find((c) => c.id === chatId)
    if (chat) {
      setSelectedChat(chat)
    }
  }

  // Add Facebook to platforms
  const allPlatforms = [
    ...platforms,
    {
      id: "facebook",
      name: "Facebook",
      accounts: facebookPages.map((page) => ({
        id: page.id,
        name: page.page_name,
        chats: [],
      })),
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Layer 1: Platforms */}
      <PlatformSelector
        platforms={allPlatforms}
        selectedPlatformId={showFacebook ? "facebook" : selectedPlatform.id}
        onSelectPlatform={handlePlatformChange}
      />

      {/* Layer 2: Accounts */}
      {showFacebook ? (
        <div className="w-56 border-r overflow-y-auto bg-background/50">
          <div className="p-3 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <h2 className="font-medium text-sm flex items-center">
              <Facebook className="mr-1 text-blue-600" size={16} />
              Facebook Pages
            </h2>
          </div>
          <div className="py-1">
            {facebookPages.length > 0 ? (
              facebookPages.map((page) => (
                <button
                  key={page.id}
                  className={`w-full text-left px-3 py-2 flex items-center space-x-2 transition-colors ${
                    selectedFacebookPage?.id === page.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => handleAccountChange(page.id)}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Facebook size={16} className="text-blue-600" />
                  </div>
                  <div className="truncate">
                    <div className="font-medium text-sm truncate">{page.page_name}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No Facebook pages connected.
                <Link href="/settings/facebook" className="block mt-2 text-blue-600 hover:underline">
                  Connect a page
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <AccountSelector
          accounts={selectedPlatform.accounts}
          selectedAccountId={selectedAccount.id}
          onSelectAccount={handleAccountChange}
        />
      )}

      {/* Layer 3: Chat messages and customer info */}
      <div className="flex flex-1 overflow-hidden relative">
        {showFacebook ? (
          selectedFacebookPage ? (
            <FacebookChat pageId={selectedFacebookPage.page_id} pageName={selectedFacebookPage.page_name} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No Facebook Page Selected</h3>
                <p className="text-muted-foreground mb-4">Select a Facebook page or connect a new one</p>
                <Link href="/settings/facebook">
                  <Button>
                    <Facebook className="mr-2" size={16} />
                    Connect Facebook Page
                  </Button>
                </Link>
              </div>
            </div>
          )
        ) : (
          <>
            <ChatInterface chats={selectedAccount.chats} selectedChat={selectedChat} onSelectChat={handleChatChange} />
            {selectedChat && <CustomerInfo customer={selectedChat.customer} />}
          </>
        )}

        {/* User info and logout */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          {user && (
            <div className="text-sm text-muted-foreground mr-2">
              Logged in as <span className="font-medium">{user.email}</span>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={logout} className="flex items-center">
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
          <Link href="/settings/facebook">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Settings size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
