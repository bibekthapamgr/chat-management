"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: number
  name?: string
  email: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        setIsLoading(false)

        // Redirect to login if on protected route
        if (isProtectedRoute(pathname)) {
          router.push("/login")
        }
        return
      }

      try {
        // Verify token with backend
        const response = await fetch("http://154.53.42.207/backend/verify-token.php", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Invalid token")
        }

        const data = await response.json()
        setUser(data.user)

        // Redirect to dashboard if on auth route
        if (isAuthRoute(pathname)) {
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Auth error:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")

        // Redirect to login if on protected route
        if (isProtectedRoute(pathname)) {
          router.push("/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const response = await fetch("http://154.53.42.207/backend/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      setUser(data.user)
      router.push("/dashboard")
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)

    try {
      const response = await fetch("http://154.53.42.207/backend/register.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      setUser(data.user)
      router.push("/dashboard")
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Helper functions
function isProtectedRoute(pathname: string) {
  const publicRoutes = ["/login", "/register", "/forgot-password"]
  return !publicRoutes.includes(pathname)
}

function isAuthRoute(pathname: string) {
  return ["/login", "/register", "/forgot-password"].includes(pathname)
}
