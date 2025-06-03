import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { useEffect, useState } from "react"
import axios from "axios"
import GpaTrendChart from "../components/GPATrendChart"
import Sidebar from "../components/Sidebar"
import AssignmentStats from "../components/AssignmentStats"
import { Link } from "react-router-dom"
import { Settings } from "lucide-react"

export default function Dashboard() {
  const { logout } = useAuth()
  const [gpaHistory, setGpaHistory] = useState([])
  const { token } = useAuth()
  const [userGpa, setUserGpa] = useState<number | null>(null)
  const [maxScale, setMaxScale] = useState<number>(9.0)
  const [scaleType, setScaleType] = useState<string>('uvic9')

  const fetchUserGpa = async () => {
    try {
      const res = await axios.get("https://scholarlog-api.onrender.com/api/user/gpa", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUserGpa(res.data.gpa)
      setMaxScale(res.data.maxScale || 9.0)
      setScaleType(res.data.scaleType || 'uvic9')
    } catch (err) {
      console.error("Failed to fetch GPA", err)
    }
  }

  const fetchGpaHistory = async () => {
    try {
      const res = await axios.get(
        "https://scholarlog-api.onrender.com/api/user/gpa-history",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setGpaHistory(res.data)
      // Note: We're already getting the scale type from fetchUserGpa
      // This is just a fallback in case we need it in the future
    } catch (err) {
      console.error("Failed to fetch GPA history", err)
    }
  }

  useEffect(() => {
    if (!token) return
    fetchGpaHistory()
    fetchUserGpa()
  }, [token])

  return (
    <Sidebar>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        {userGpa !== null && (
          <div className="mb-6 px-4 py-3 bg-white rounded-xl shadow flex items-center justify-between max-w-md">
            <div>
              <p className="text-sm text-muted-foreground">Your Overall GPA</p>
              <p className="text-xl font-bold text-black">
                {userGpa.toFixed(2)} / {maxScale.toFixed(2)}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2 mb-6">
          <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">
              {scaleType === 'ubc4' ? 'UBC 4.33 Scale' : 
               scaleType === 'ubco4' ? 'UBCO 4.33 Scale' :
               scaleType === 'camosun9' ? 'Camosun 9.0 Scale' : 'UVic 9.0 Scale'}
            </span>
          </div>
          <Link to="/settings" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
            Change in Settings
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-lg font-semibold mb-4">GPA Trend</h3>
          <GpaTrendChart data={gpaHistory} scaleType={scaleType} />
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Assignment Status Overview</h3>
          <AssignmentStats />
        </div>
      </div>
    </Sidebar>
  )
}
