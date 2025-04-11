import { ChatDashboard } from "@/components/chat-dashboard"
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <ChatDashboard />
    </ProtectedRoute>
  )
}
