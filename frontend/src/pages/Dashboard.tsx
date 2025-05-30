import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { useEffect, useState } from "react"
import axios from "axios"
import GpaTrendChart from "../components/GPATrendChart"
import Sidebar from "../components/Sidebar"

export default function Dashboard() {
  const { logout } = useAuth()
  const [gpaHistory, setGpaHistory] = useState([])
  const { token } = useAuth()
  const [gpaScale, setGpaScale] = useState<number>(4.0)



  useEffect(() => {
    if (!token) return

    axios
      .get("https://scholarlog-api.onrender.com/api/user/gpa-history", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setGpaHistory(res.data))
      .catch((err) => console.error("Failed to load GPA history", err))

    axios
      .get("https://scholarlog-api.onrender.com/api/user/gpa", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setGpaScale(res.data.scale))
      .catch((err) => console.error("Failed to load GPA scale", err))
  }, [token])


  return (
    <Sidebar>
      <div className="p-6 space-y-4">
        {gpaHistory.length > 0 && <GpaTrendChart data={gpaHistory} gpaScale={gpaScale} />
        }
      </div>
    </Sidebar>
  )
}
