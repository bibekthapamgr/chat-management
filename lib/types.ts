export interface Platform {
  id: string
  name: string
  accounts: Account[]
  // Add Facebook/Instagram specific fields
  accessToken?: string
  pageId?: string
  connected?: boolean
}

export interface Account {
  id: string
  name: string
  avatar?: string
  chats: Chat[]
  // Add Facebook/Instagram specific fields
  platformAccountId?: string
  accessToken?: string
  pageId?: string
}

export interface Chat {
  id: string
  customer: Customer
  messages: Message[]
  // Add Facebook/Instagram specific fields
  platformConversationId?: string
  platformType?: "facebook" | "instagram"
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  avatar?: string
  notes?: string
  online?: boolean
  // Add Facebook/Instagram specific fields
  platformUserId?: string
  platformUserName?: string
}

export interface Message {
  sender: "user" | "customer"
  content: string
  timestamp: number
  // Add Facebook/Instagram specific fields
  platformMessageId?: string
  attachments?: MessageAttachment[]
  delivered?: boolean
  read?: boolean
}

export interface MessageAttachment {
  type: "image" | "video" | "audio" | "file"
  url: string
  name?: string
  size?: number
}

export interface FacebookAuthResponse {
  accessToken: string
  userID: string
  expiresIn: number
  signedRequest: string
  graphDomain: string
  data_access_expiration_time: number
}

export interface FacebookPage {
  id: string
  name: string
  access_token: string
  category: string
  tasks: string[]
}
