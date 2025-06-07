import { createContext, useContext, useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "./AuthContext"

interface UserData {
  email: string;
  gpaScale: number;
  gpa: number | null;
  scaleType: string;
}

interface UserContextType {
  userData: UserData | null;
  isLoading: boolean;
  error: Error | null;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { token } = useAuth()

  const fetchUserData = async () => {
    if (!token) return

    setIsLoading(true)
    setError(null)

    try {
      // Fetch user profile
      const profileRes = await axios.get("https://scholarlog-api.onrender.com/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Fetch user settings
      const settingsRes = await axios.get("https://scholarlog-api.onrender.com/api/user/settings", {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Fetch user GPA
      const gpaRes = await axios.get("https://scholarlog-api.onrender.com/api/user/gpa", {
        headers: { Authorization: `Bearer ${token}` }
      })

      setUserData({
        email: profileRes.data.user.email,
        gpaScale: settingsRes.data.user.gpaScale,
        gpa: gpaRes.data.gpa,
        scaleType: gpaRes.data.scaleType || 'uvic9'
      })
    } catch (err) {
      console.error("Failed to fetch user data:", err)
      setError(err instanceof Error ? err : new Error('Failed to fetch user data'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [token])

  return (
    <UserContext.Provider value={{ userData, isLoading, error, refreshUserData: fetchUserData }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error("useUser must be used within UserProvider")
  return context
} 