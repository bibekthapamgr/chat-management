import { type NextRequest, NextResponse } from "next/server"
import type { FacebookPage } from "@/lib/types"

export async function POST(req: NextRequest) {
  try {
    const { pages } = (await req.json()) as { pages: FacebookPage[] }

    // In a real application, you would:
    // 1. Store the page access tokens securely in your database
    // 2. Subscribe to webhooks for each page
    // 3. Set up Instagram messaging if the page has a connected Instagram account

    // For demonstration purposes, we'll just return success
    // In a real app, you would store these tokens in a database
    const connectedPages = pages.map((page) => ({
      id: page.id,
      name: page.name,
      accessToken: page.access_token,
      // You would also check for Instagram accounts here
    }))

    // Subscribe to webhooks for each page
    for (const page of pages) {
      await subscribeToWebhooks(page.id, page.access_token)
    }

    return NextResponse.json({ success: true, connectedPages })
  } catch (error) {
    console.error("Error connecting Facebook pages:", error)
    return NextResponse.json({ success: false, error: "Failed to connect Facebook pages" }, { status: 500 })
  }
}

async function subscribeToWebhooks(pageId: string, accessToken: string) {
  try {
    // Subscribe to page messaging webhooks
    const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/subscribed_apps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscribed_fields: "messages,messaging_postbacks,message_deliveries,message_reads",
        access_token: accessToken,
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error subscribing to webhooks:", error)
    throw error
  }
}
