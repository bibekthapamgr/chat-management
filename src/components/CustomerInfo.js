"use client"

import { useState } from "react"
import { Save, User, Phone, Mail, MapPin, X, Edit2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Separator } from "../components/ui/separator"
import { cn } from "../utils/utils"

function CustomerInfo({ customer }) {
  const [notes, setNotes] = useState(customer.notes || "")
  const [isEditing, setIsEditing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  const handleSaveNotes = () => {
    // In a real app, you would save the notes to an API
    console.log(`Saving notes for ${customer.name}: ${notes}`)
    setIsEditing(false)
  }

  if (!isExpanded) {
    return (
      <div className="w-12 border-l flex flex-col items-center py-4 bg-background">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center mb-4 hover:bg-muted transition-colors"
        >
          <User size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="w-72 border-l overflow-hidden flex flex-col bg-muted/5">
      <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <h2 className="font-medium text-sm">Thông tin khách hàng</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(false)}>
          <X size={16} />
        </Button>
      </div>

      <div className="overflow-y-auto flex-1 p-3">
        <div className="flex items-center space-x-3 mb-4 p-2 bg-muted/20 rounded-lg">
          <Avatar className="h-12 w-12">
            <AvatarImage src={customer.avatar || "/placeholder.svg"} />
            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{customer.name}</h2>
            <div className="text-sm text-muted-foreground">{customer.email || "Không có email"}</div>
          </div>
        </div>

        <div className="space-y-3">
          {customer.phone && <InfoItem icon={<Phone size={14} />} label="Số điện thoại" value={customer.phone} />}

          {customer.email && <InfoItem icon={<Mail size={14} />} label="Email" value={customer.email} />}

          {customer.address && <InfoItem icon={<MapPin size={14} />} label="Địa chỉ" value={customer.address} />}

          <Separator className="my-4" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Ghi chú</div>
              {!isEditing ? (
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setIsEditing(true)}>
                  <Edit2 size={14} className="mr-1" />
                  Sửa
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleSaveNotes}>
                  <Save size={14} className="mr-1" />
                  Lưu
                </Button>
              )}
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              readOnly={!isEditing}
              className={cn(
                "min-h-[120px] text-sm",
                !isEditing && "bg-muted/20 border-0 focus-visible:ring-0 resize-none",
              )}
              placeholder="Thêm ghi chú về khách hàng..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="text-sm">
      <div className="flex items-center text-muted-foreground mb-1">
        {icon}
        <span className="ml-1">{label}</span>
      </div>
      <div className="pl-5">{value}</div>
    </div>
  )
}

export default CustomerInfo
