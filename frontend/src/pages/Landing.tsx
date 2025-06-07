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
import { motion } from "framer-motion"
import { BookOpen, LineChart as LineChartIcon, Brain, Calendar } from "lucide-react"

const mockData = [
  { semester: "Fall '22", gpa: 3.2 },
  { semester: "Spring '23", gpa: 2.4 },
  { semester: "Fall '23", gpa: 3.6 },
  { semester: "Spring '24", gpa: 1.2 },
  { semester: "Fall '24", gpa: 3.8 },
]

const features = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Course Management",
    description: "Organize your courses and track assignments with ease"
  },
  {
    icon: <LineChartIcon className="w-6 h-6" />,
    title: "GPA Tracking",
    description: "Calculate and visualize your academic performance"
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Smart Insights",
    description: "Get personalized recommendations to improve your grades"
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Assignment Planning",
    description: "Stay on top of deadlines and never miss an assignment"
  }
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
    <div className="min-h-screen bg-white bg-[radial-gradient(circle_at_1px_1px,_#e5e7eb_1px,_transparent_0)] [background-size:16px_16px]">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 space-y-8"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
              ScholarLog
            </h1>
            <p className="text-xl text-gray-600">
              Your all-in-one academic companion for tracking grades, managing courses, and achieving academic success.
            </p>
            <div className="flex gap-4">
              <Link to="/register">
                <Button className="text-base px-8 py-6">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button  className="text-base px-8 py-6">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Content - Chart */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 w-full max-w-xl bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Track Your Academic Journey
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="semester" stroke="#888" style={{ fontSize: "12px" }} />
                  <YAxis domain={[0, 4.0]} stroke="#888" style={{ fontSize: "12px" }} />
                  <Tooltip />
                  <Line 
                    dataKey="gpa" 
                    stroke="#6366f2" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Everything You Need to Succeed
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-indigo-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Academic Journey?</h2>
          <p className="text-gray-600 mb-8">
            Join thousands of students who are already using ScholarLog to achieve their academic goals.
          </p>
          <Link to="/register">
            <Button  className="text-base px-8 py-6">
              Start Free Today
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
