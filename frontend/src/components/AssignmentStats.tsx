import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Button } from "./ui/button"
import { Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface Assignment {
  id: number
  name: string
  courseId: number
  status: 'not_started' | 'in_progress'
  deadline: string
}

export default function AssignmentStats() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) return

    axios
      .get("https://scholarlog-api.onrender.com/api/upcoming-assignments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAssignments(res.data))
      .catch((err) => console.error("Failed to load assignments", err))
  }, [token])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const stats = {
    upcoming: assignments.filter(a => {
      const deadline = new Date(a.deadline)
      deadline.setHours(0, 0, 0, 0)
      return deadline > today && (a.status === 'not_started' || a.status === 'in_progress')
    }).length,
    inProgress: assignments.filter(a => a.status === 'in_progress').length,
    notStarted: assignments.filter(a => a.status === 'not_started').length,
    overdue: assignments.filter(a => {
      const deadline = new Date(a.deadline)
      deadline.setHours(0, 0, 0, 0)
      return deadline < today && (a.status === 'not_started' || a.status === 'in_progress')
    }).length
  }

  const chartData = [
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Not Started', value: stats.notStarted },
    { name: 'Overdue', value: stats.overdue }
  ]

  const totalAssignments = stats.upcoming + stats.inProgress + stats.notStarted + stats.overdue

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm text-muted-foreground">Upcoming</h3>
          <p className="text-2xl font-bold">{stats.upcoming}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm text-muted-foreground">In Progress</h3>
          <p className="text-2xl font-bold">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm text-muted-foreground">Not Started</h3>
          <p className="text-2xl font-bold">{stats.notStarted}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm text-muted-foreground">Overdue</h3>
          <p className="text-2xl font-bold">{stats.overdue}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 relative">
        <h3 className="text-lg font-semibold mb-4">Assignment Status</h3>
        {totalAssignments === 0 ? (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
            <p className="text-muted-foreground mb-4">No assignments yet</p>
            <Button onClick={() => navigate('/assignments')} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Assignment
            </Button>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" stroke="#888" style={{ fontSize: "12px" }} />
                <YAxis stroke="#888" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
                  labelStyle={{ color: "#333", fontWeight: 500 }}
                />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </>
  )
} 