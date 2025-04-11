export async function sendFacebookMessage(recipientId: string, text: string, pageAccessToken: string) {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/me/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text },
        access_token: pageAccessToken,
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error sending Facebook message:", error)
    throw error
  }
}

export async function sendInstagramMessage(recipientId: string, text: string, pageAccessToken: string) {
  // Instagram messaging uses the same endpoint as Facebook
  return sendFacebookMessage(recipientId, text, pageAccessToken)
}

export async function getConversations(pageId: string, pageAccessToken: string, platform: "facebook" | "instagram") {
  try {
    const endpoint =
      platform === "facebook"
        ? `https://graph.facebook.com/v18.0/${pageId}/conversations`
        : `https://graph.facebook.com/v18.0/${pageId}/conversations`

    const response = await fetch(
      `${endpoint}?access_token=${pageAccessToken}&fields=participants,updated_time,messages{message,from,to,created_time}`,
    )
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching ${platform} conversations:`, error)
    throw error
  }
}
