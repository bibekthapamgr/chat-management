"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Facebook, Check, AlertCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"

declare global {
  interface Window {
    FB: any
  }
}

interface FacebookPage {
  id: string
  name: string
  access_token: string
}

interface ConnectedPage {
  id: string
  page_id: string
  page_name: string
  access_token: string
  created_at: string
}

export function FacebookConnection() {
  const { user } = useAuth()
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [pages, setPages] = useState<FacebookPage[]>([])
  const [connectedPages, setConnectedPages] = useState<ConnectedPage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Load Facebook SDK
  useEffect(() => {
    const loadFacebookSDK = () => {
      window.fbAsyncInit = () => {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: "v18.0",
        })

        // Check login status
        window.FB.getLoginStatus((response: any) => {
          if (response.status === "connected") {
            setIsLoggedIn(true)
            fetchPages(response.authResponse.accessToken)
          }
        })

        setIsSDKLoaded(true)
      }

      // Load the SDK
      ;((d, s, id) => {
        var js,
          fjs = d.getElementsByTagName(s)[0]
        if (d.getElementById(id)) return
        js = d.createElement(s) as HTMLScriptElement
        js.id = id
        js.src = "https://connect.facebook.net/en_US/sdk.js"
        fjs.parentNode?.insertBefore(js, fjs)
      })(document, "script", "facebook-jssdk")
    }

    loadFacebookSDK()
    fetchConnectedPages()
  }, [])

  const fetchConnectedPages = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("http://154.53.42.207/backend/get-facebook-pages.php", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setConnectedPages(data.pages)
      }
    } catch (error) {
      console.error("Error fetching connected pages:", error)
    }
  }

  const handleLogin = () => {
    if (!isSDKLoaded) return

    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          setIsLoggedIn(true)
          fetchPages(response.authResponse.accessToken)
        } else {
          setError("Facebook login was cancelled or failed")
        }
      },
      { scope: "pages_messaging,pages_show_list,pages_manage_metadata" },
    )
  }

  const fetchPages = (accessToken: string) => {
    window.FB.api("/me/accounts", { access_token: accessToken }, (response: any) => {
      if (response && !response.error) {
        setPages(response.data)
      } else {
        setError("Failed to fetch Facebook pages")
      }
    })
  }

  const connectPage = async (page: FacebookPage) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Not authenticated")

      const response = await fetch("http://154.53.42.207/backend/connect-facebook.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pageId: page.id,
          pageName: page.name,
          accessToken: page.access_token,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to connect page")
      }

      setSuccess(`Successfully connected ${page.name}`)
      fetchConnectedPages()
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectPage = async (pageId: string) => {
    if (!confirm("Are you sure you want to disconnect this page?")) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Not authenticated")

      const response = await fetch(`http://154.53.42.207/backend/disconnect-facebook.php?pageId=${pageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to disconnect page")
      }

      setSuccess("Successfully disconnected page")
      setConnectedPages(connectedPages.filter((page) => page.page_id !== pageId))
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Facebook className="mr-2 text-blue-600" size={24} />
          <span>Facebook Page Connection</span>
        </CardTitle>
        <CardDescription>Connect your Facebook Pages to receive and reply to messages</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {connectedPages.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-2">Connected Pages:</h3>
            <div className="space-y-2">
              {connectedPages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-3 border rounded-md bg-blue-50 border-blue-200"
                >
                  <div className="flex items-center">
                    <Facebook className="mr-2 text-blue-600" size={18} />
                    <span className="font-medium">{page.page_name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => disconnectPage(page.page_id)}
                    disabled={isLoading}
                  >
                    <Trash2 size={16} className="mr-1" />
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoggedIn ? (
          <Button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!isSDKLoaded || isLoading}
          >
            <Facebook className="mr-2" size={18} />
            Connect with Facebook
          </Button>
        ) : (
          <div>
            <h3 className="font-medium mb-2">Available Pages:</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {pages.length > 0 ? (
                pages.map((page) => {
                  const isConnected = connectedPages.some((p) => p.page_id === page.id)
                  return (
                    <div
                      key={page.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-medium">{page.name}</div>
                      </div>
                      <Button
                        onClick={() => connectPage(page)}
                        disabled={isLoading || isConnected}
                        variant={isConnected ? "outline" : "default"}
                        size="sm"
                      >
                        {isConnected ? (
                          <>
                            <Check size={16} className="mr-1 text-green-500" />
                            Connected
                          </>
                        ) : (
                          "Connect"
                        )}
                      </Button>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-gray-500 py-4">No Facebook Pages found</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          {isLoggedIn
            ? "Select a page to connect and start receiving messages"
            : "Login with Facebook to see your available pages"}
        </div>
      </CardFooter>
    </Card>
  )
}
