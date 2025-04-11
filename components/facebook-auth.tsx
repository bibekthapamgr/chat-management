"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Facebook, AlertCircle } from "lucide-react"
import type { FacebookAuthResponse, FacebookPage } from "@/lib/types"

declare global {
  interface Window {
    FB: any
  }
}

interface FacebookAuthProps {
  onPagesSelected: (pages: FacebookPage[]) => void
}

export function FacebookAuth({ onPagesSelected }: FacebookAuthProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [pages, setPages] = useState<FacebookPage[]>([])
  const [selectedPages, setSelectedPages] = useState<FacebookPage[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load Facebook SDK
  useEffect(() => {
    // Load the Facebook SDK asynchronously
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
  }, [])

  const handleLogin = () => {
    if (!isSDKLoaded) return

    window.FB.login(
      (response: { authResponse: FacebookAuthResponse; status: string }) => {
        if (response.authResponse) {
          setIsLoggedIn(true)
          fetchPages(response.authResponse.accessToken)
        } else {
          setError("Facebook login was cancelled or failed")
        }
      },
      { scope: "pages_messaging,pages_show_list,instagram_basic,instagram_manage_messages" },
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

  const togglePageSelection = (page: FacebookPage) => {
    if (selectedPages.some((p) => p.id === page.id)) {
      setSelectedPages(selectedPages.filter((p) => p.id !== page.id))
    } else {
      setSelectedPages([...selectedPages, page])
    }
  }

  const handleConfirmSelection = () => {
    onPagesSelected(selectedPages)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Facebook className="mr-2 text-blue-600" size={24} />
          <span>Facebook & Instagram Integration</span>
        </CardTitle>
        <CardDescription>Connect your Facebook Pages and Instagram accounts to manage messages</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 p-3 rounded-md mb-4 flex items-start">
            <AlertCircle className="text-red-500 mr-2 mt-0.5" size={16} />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {!isLoggedIn ? (
          <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700" disabled={!isSDKLoaded}>
            <Facebook className="mr-2" size={18} />
            Connect with Facebook
          </Button>
        ) : (
          <div>
            <h3 className="font-medium mb-2">Select Pages to Connect:</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {pages.length > 0 ? (
                pages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => togglePageSelection(page)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPages.some((p) => p.id === page.id)}
                      onChange={() => {}}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">{page.name}</div>
                      <div className="text-xs text-gray-500">{page.category}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">No Facebook Pages found</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Cancel
        </Button>
        <Button onClick={handleConfirmSelection} disabled={selectedPages.length === 0}>
          Connect Selected Pages
        </Button>
      </CardFooter>
    </Card>
  )
}
