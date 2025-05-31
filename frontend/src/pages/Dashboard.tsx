import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { useEffect, useState } from "react"
import axios from "axios"
import GpaTrendChart from "../components/GPATrendChart"
import Sidebar from "../components/Sidebar"
import AssignmentStats from "../components/AssignmentStats"

export default function Dashboard() {
  const { logout } = useAuth()
  const [gpaHistory, setGpaHistory] = useState([])
  const { token } = useAuth()
  const [userGpa, setUserGpa] = useState<number | null>(null)

  const fetchUserGpa = async () => {
    try {
      const res = await axios.get("https://scholarlog-api.onrender.com/api/user/gpa", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUserGpa(res.data.gpa)
    } catch (err) {
      console.error("Failed to fetch GPA", err)
    }
  }

  useEffect(() => {
    if (!token) return

    axios
      .get("https://scholarlog-api.onrender.com/api/user/gpa-history", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setGpaHistory(res.data))
      .catch((err) => console.error("Failed to load GPA history", err))
    
    fetchUserGpa()
  }, [token])

  return (
    <Sidebar>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        {userGpa !== null && (
          <div className="mb-6 px-4 py-3 bg-white rounded-xl shadow flex items-center justify-between max-w-md">
            <p className="text-sm text-muted-foreground">Your Overall GPA</p>
            <p className="text-xl font-bold text-black">
              {userGpa.toFixed(2)} / 9.0
            </p>
          </div>
        )}
        
        <AssignmentStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-4">GPA Trend</h3>
            <GpaTrendChart data={gpaHistory} />
          </div>
        </div>
      </div>
    </Sidebar>
  )
}
