"use client"

import { User } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Account } from "@/lib/types"

interface AccountSelectorProps {
  accounts: Account[]
  selectedAccountId: string
  onSelectAccount: (accountId: string) => void
}

export function AccountSelector({ accounts, selectedAccountId, onSelectAccount }: AccountSelectorProps) {
  return (
    <div className="w-56 border-r overflow-y-auto bg-background/50">
      <div className="p-3 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <h2 className="font-medium text-sm">Tài khoản</h2>
      </div>
      <div className="py-1">
        {accounts.map((account) => (
          <button
            key={account.id}
            className={cn(
              "w-full text-left px-3 py-2 flex items-center space-x-2 transition-colors",
              selectedAccountId === account.id
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
            )}
            onClick={() => onSelectAccount(account.id)}
          >
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              {account.avatar ? (
                <img src={account.avatar || "/placeholder.svg"} alt={account.name} className="w-8 h-8 rounded-full" />
              ) : (
                <User size={16} />
              )}
            </div>
            <div className="truncate">
              <div className="font-medium text-sm truncate">{account.name}</div>
              <div className="text-xs text-muted-foreground truncate">{account.chats.length} cuộc trò chuyện</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
