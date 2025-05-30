import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { useNavigate } from "react-router-dom"
import CourseCard from "../components/CourseCard"
import Sidebar from "../components/Sidebar"
import AddCourseModal from "../components/AddCourseModal"
import { Plus } from "lucide-react"

type Assignment = {
  id: number
  name: string
  grade: number
  weight: number
  createdAt: string
}

type Course = {
  id: number
  name: string
  isActive: boolean
  createdAt: string
  assignments?: Assignment[]
  grade?: number
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [tab, setTab] = useState("active")
  const { token } = useAuth()
  const [userGpa, setUserGpa] = useState<number | null>(null)
  const [gpaScale, setGpaScale] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const navigate = useNavigate()

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
    fetchUserGpa()
  }, [token])

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`https://scholarlog-api.onrender.com/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCourses((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error("Failed to delete course:", err)
    }
  }

  const handleCreate = async (name: string, isActive: boolean) => {
    try {
      await axios.post(
        "https://scholarlog-api.onrender.com/api/courses",
        { name, isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const res = await axios.get("https://scholarlog-api.onrender.com/api/courses/with-grade", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCourses(res.data)
    } catch (err) {
      console.error("Error creating course:", err)
    }
  }

  useEffect(() => {
    if (!token) return
    setIsLoading(true)
    axios
      .get("https://scholarlog-api.onrender.com/api/courses/with-grade", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourses(res.data))
      .catch((err) => console.error("Failed to fetch courses:", err))
      .finally(() => setIsLoading(false))
  }, [token])

  const filtered = courses.filter((course) => {
    if (tab === "active") return course.isActive
    if (tab === "completed") return !course.isActive
    return true
  })

  if (isLoading) {
    return (
      <div className="w-full text-center py-10 text-muted-foreground">
        Loading your courses...
      </div>
    )
  }

  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-10">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">Your Courses</h1>

          {gpaScale !== null && (
            <div className="flex items-center gap-2 mb-8">
              <label className="text-sm text-muted-foreground">GPA Scale:</label>
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

          {userGpa !== null && (
            <div className="mb-6 px-4 py-3 bg-white rounded-xl shadow flex items-center justify-between max-w-md">
              <p className="text-sm text-muted-foreground">Your Overall GPA</p>
              <p className="text-xl font-bold text-black">
                {userGpa.toFixed(2)} / {gpaScale}
              </p>
            </div>
          )}

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={tab}>
              {filtered.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                  <p className="text-lg">No {tab} courses found.</p>
                  <p className="text-sm">Click the button below to add your first course.</p>
                  <AddCourseModal
                    onCreate={handleCreate}
                    trigger={<Button className="mt-4">Add Course</Button>}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filtered.map((course) => (
                    <CourseCard key={course.id} course={course} onDelete={handleDelete} />
                  ))}

                  <AddCourseModal
                    onCreate={handleCreate}
                    trigger={
                      <button
                        className="aspect-square w-full border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-gray-400 hover:bg-gray-100 transition"
                      >
                        <Plus className="w-8 h-8" />
                        <span className="text-sm mt-1">Add Course</span>
                      </button>
                    }
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Sidebar>
  )
}
