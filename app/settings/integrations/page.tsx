"use client"

import { useState } from "react"
import { FacebookAuth } from "@/components/facebook-auth"
import type { FacebookPage } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Facebook, Instagram, Check, AlertCircle } from "lucide-react"

export default function IntegrationsPage() {
  const [connectedPages, setConnectedPages] = useState<FacebookPage[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handlePagesSelected = async (pages: FacebookPage[]) => {
    setIsConnecting(true)
    setError(null)

    try {
      // Here you would send the pages to your backend to store the access tokens
      const response = await fetch("/api/facebook/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pages }),
      })

      if (!response.ok) {
        throw new Error("Failed to connect pages")
      }

      setConnectedPages(pages)
      setSuccess("Facebook Pages connected successfully!")
    } catch (err) {
      setError("Failed to connect Facebook Pages. Please try again.")
      console.error(err)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Platform Integrations</h1>

      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-6 flex items-start">
          <AlertCircle className="text-red-500 mr-2 mt-0.5" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 p-4 rounded-md mb-6 flex items-start">
          <Check className="text-green-500 mr-2 mt-0.5" size={20} />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Facebook & Instagram Integration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="flex space-x-2">
                <Facebook className="text-blue-600" size={24} />
                <Instagram className="text-pink-600" size={24} />
              </div>
              <span className="ml-2">Facebook & Instagram</span>
            </CardTitle>
            <CardDescription>Connect your Facebook Pages and Instagram accounts to manage messages</CardDescription>
          </CardHeader>
          <CardContent>
            {connectedPages.length > 0 ? (
              <div>
                <h3 className="font-medium mb-2">Connected Pages:</h3>
                <ul className="space-y-2">
                  {connectedPages.map((page) => (
                    <li key={page.id} className="flex items-center">
                      <Check className="text-green-500 mr-2" size={16} />
                      <span>{page.name}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="mt-4" onClick={() => setConnectedPages([])}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <FacebookAuth onPagesSelected={handlePagesSelected} />
            )}
          </CardContent>
        </Card>

        {/* Other integration cards can be added here */}
      </div>
    </div>
  )
}
