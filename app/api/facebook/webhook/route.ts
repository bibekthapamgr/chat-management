import { type NextRequest, NextResponse } from "next/server"

// This endpoint will receive webhook events from Facebook
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  // Verify webhook subscription
  // The token should match the one you set in the Facebook Developer Portal
  const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified")
    return new NextResponse(challenge)
  } else {
    return new NextResponse("Verification failed", { status: 403 })
  }
}

// Handle incoming webhook events
export async function POST(req: NextRequest) {
  const body = await req.json()

  try {
    // Process the webhook payload
    if (body.object === "page" || body.object === "instagram") {
      // Process each entry (there might be multiple)
      for (const entry of body.entry) {
        // Handle messaging events
        if (entry.messaging) {
          for (const event of entry.messaging) {
            await processMessagingEvent(event)
          }
        }
      }
      return NextResponse.json({ status: "ok" })
    }

    return NextResponse.json({ status: "not relevant" })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 })
  }
}

async function processMessagingEvent(event: any) {
  // Extract the sender PSID
  const senderId = event.sender.id

  // Check if this is a message event
  if (event.message) {
    // Handle text messages
    if (event.message.text) {
      console.log(`Received message from ${senderId}: ${event.message.text}`)
      // Here you would store the message in your database
      // and update your UI accordingly
    }

    // Handle attachments (images, files, etc.)
    if (event.message.attachments) {
      for (const attachment of event.message.attachments) {
        console.log(`Received attachment from ${senderId}, type: ${attachment.type}`)
        // Process different attachment types
      }
    }
  }

  // Handle message delivery confirmations
  if (event.delivery) {
    console.log(`Message delivered to ${senderId}`)
  }

  // Handle message read events
  if (event.read) {
    console.log(`Message read by ${senderId}`)
  }
}
