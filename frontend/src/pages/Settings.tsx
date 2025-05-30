import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"

export default function Settings() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [gpaScale, setGpaScale] = useState<number | null>(null)

  useEffect(() => {
    if (!token) return
    fetchUserGpa()
  }, [token])

  const fetchUserGpa = async () => {
    try {
      const res = await axios.get("https://scholarlog-api.onrender.com/api/user/gpa", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setGpaScale(res.data.scale)
    } catch (err) {
      console.error("Failed to fetch GPA scale", err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-10">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>

          <div className="space-y-8">
            {/* GPA Scale Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">GPA Scale</h2>
              {gpaScale !== null && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">Scale:</Label>
                  <select
                    value={gpaScale}
                    onChange={(e) => {
                      const newScale = parseFloat(e.target.value)
                      axios
                        .put(
                          "https://scholarlog-api.onrender.com/api/user/settings/scale",
                          { scale: newScale },
                          { headers: { Authorization: `Bearer ${token}` } }
                        )
                        .then(() => fetchUserGpa())
                        .catch((err) => console.error("Failed to update scale", err))
                    }}
                    className="border rounded-md px-2 py-1 text-sm"
                  >
                    <option value={4.0}>4.0</option>
                    <option value={10.0}>10.0</option>
                  </select>
                </div>
              )}
            </div>

            {/* Logout Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Account</h2>
              <Button 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  )
} 