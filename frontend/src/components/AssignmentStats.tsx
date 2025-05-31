import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Assignment Status</h3>
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
      </div>
    </div>
  )
} 