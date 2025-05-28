import { use, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Link } from "react-router-dom"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

const mockData = [
  { semester: "Fall '22", gpa: 3.2 },
  { semester: "Spring '23", gpa: 2.4 },
  { semester: "Fall '23", gpa: 3.6 },
  { semester: "Spring '24", gpa: 1.2 },
  { semester: "Fall '24", gpa: 3.8 },
]

export default function Landing() {
  const token = localStorage.getItem("token")

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (token) {
      window.location.href = "/dashboard"
    }
  }, [token])

  return (
    <div className="min-h-screen bg-white bg-[radial-gradient(circle_at_1px_1px,_#e5e7eb_1px,_transparent_0)] [background-size:16px_16px] flex items-center justify-center p-6">
      <div className="flex flex-col md:flex-row justify-around items-center gap-12 w-full max-w-6xl">
        {/* Branding + CTA */}
        <div className="text-center md:text-left space-y-6 max-w-md">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            ScholarLog
          </h1>

          <ul className="space-y-2 text-gray-600 text-sm">
            <li>📚 Manage your courses & assignments</li>
            <li>📊 Calculate your GPA in real time</li>
            <li>📈 Visualize progress with trendlines</li>
            <li>🧠 Stay on track with performance insights</li>
          </ul>

          <Link to="/register">
            <Button className="mt-4 text-base px-6 py-2">Register</Button>
          </Link>
        </div>

        {/* Chart Preview Section */}
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-sm text-gray-600 mb-4">
            Track your total GPA across semesters
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="semester" stroke="#888" style={{ fontSize: "12px" }} />
                <YAxis domain={[0, 4.0]} stroke="#888" style={{ fontSize: "12px" }} />
                <Line dataKey="gpa" stroke="#6366f1" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
