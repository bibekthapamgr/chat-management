"use client"
import { FacebookConnection } from "@/components/facebook-connection"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function FacebookSettingsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft size={16} className="mr-1" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Facebook Integration</h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <FacebookConnection />
        </div>
      </div>
    </ProtectedRoute>
  )
}
