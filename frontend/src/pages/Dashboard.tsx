import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { useEffect, useState } from "react"
import axios from "axios"
import GpaTrendChart from "../components/GPATrendChart"
import Sidebar from "../components/Sidebar"
import { Helmet } from "react-helmet-async"

export default function Dashboard() {
  const { logout } = useAuth()
  const [gpaHistory, setGpaHistory] = useState([])
  const { token } = useAuth()
  const [gpaScale, setGpaScale] = useState<number>(4.0)
  const [userGpa, setUserGpa] = useState<number | null>(null)

  const fetchUserGpa = async () => {
    try {
      const res = await axios.get("https://scholarlog-api.onrender.com/api/user/gpa", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUserGpa(res.data.gpa)
      setGpaScale(res.data.scale)
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
    <>
      <Helmet>
        <title>Dashboard | ScholarLog</title>
        <meta name="description" content="View your academic progress, GPA trends, and overall performance at a glance with ScholarLog's comprehensive dashboard." />
        <meta property="og:title" content="Dashboard | ScholarLog" />
        <meta property="og:description" content="View your academic progress, GPA trends, and overall performance at a glance with ScholarLog's comprehensive dashboard." />
      </Helmet>
      <Sidebar>
        <div className="p-6 space-y-4">
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          
          {userGpa !== null && (
            <div className="mb-6 px-4 py-3 bg-white rounded-xl shadow flex items-center justify-between max-w-md">
              <p className="text-sm text-muted-foreground">Your Overall GPA</p>
              <p className="text-xl font-bold text-black">
                {userGpa.toFixed(2)} / {gpaScale}
              </p>
            </div>
          )}
          
          <GpaTrendChart data={gpaHistory} gpaScale={gpaScale} />
        </div>
      </Sidebar>
    </>
  )
}
