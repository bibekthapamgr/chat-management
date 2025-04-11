"use client"

import { useState } from "react"
import PlatformSelector from "./PlatformSelector"
import AccountSelector from "./AccountSelector"
import ChatInterface from "./ChatInterface"
import CustomerInfo from "./CustomerInfo"
import { platforms } from "../data/platforms"

function ChatDashboard() {
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0])
  const [selectedAccount, setSelectedAccount] = useState(selectedPlatform.accounts[0])
  const [selectedChat, setSelectedChat] = useState(selectedAccount.chats.length > 0 ? selectedAccount.chats[0] : null)

  const handlePlatformChange = (platformId) => {
    const platform = platforms.find((p) => p.id === platformId)
    if (platform) {
      setSelectedPlatform(platform)
      setSelectedAccount(platform.accounts[0])
      setSelectedChat(platform.accounts[0].chats.length > 0 ? platform.accounts[0].chats[0] : null)
    }
  }

  const handleAccountChange = (accountId) => {
    const account = selectedPlatform.accounts.find((a) => a.id === accountId)
    if (account) {
      setSelectedAccount(account)
      setSelectedChat(account.chats.length > 0 ? account.chats[0] : null)
    }
  }

  const handleChatChange = (chatId) => {
    const chat = selectedAccount.chats.find((c) => c.id === chatId)
    if (chat) {
      setSelectedChat(chat)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Layer 1: Platforms */}
      <PlatformSelector
        platforms={platforms}
        selectedPlatformId={selectedPlatform.id}
        onSelectPlatform={handlePlatformChange}
      />

      {/* Layer 2: Accounts */}
      <AccountSelector
        accounts={selectedPlatform.accounts}
        selectedAccountId={selectedAccount.id}
        onSelectAccount={handleAccountChange}
      />

      {/* Layer 3: Chat messages and customer info */}
      <div className="flex flex-1 overflow-hidden">
        <ChatInterface chats={selectedAccount.chats} selectedChat={selectedChat} onSelectChat={handleChatChange} />
        {selectedChat && <CustomerInfo customer={selectedChat.customer} />}
      </div>
    </div>
  )
}

export default ChatDashboard
