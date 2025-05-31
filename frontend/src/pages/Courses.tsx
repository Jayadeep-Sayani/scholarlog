import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { useCourses } from "../context/CourseContext"
import { Button } from "../components/ui/button"
import { useNavigate } from "react-router-dom"
import CourseCard from "../components/CourseCard"
import Sidebar from "../components/Sidebar"
import AddCourseModal from "../components/AddCourseModal"
import { Plus } from "lucide-react"
import { useToast } from "../hooks/use-toast"

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
  const [tab, setTab] = useState("active")
  const { token } = useAuth()
  const { courses, setCourses, fetchCourses, activeCourses, completedCourses } = useCourses()
  const [userGpa, setUserGpa] = useState<number | null>(null)
  const [gpaScale, setGpaScale] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

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
      // Update courses in context
      setCourses((prev) => prev.filter((c) => c.id !== id))
      toast({
        title: "Course deleted",
        description: "The course has been successfully deleted.",
      })
    } catch (err) {
      console.error("Failed to delete course:", err)
      toast({
        title: "Error",
        description: "Failed to delete the course. Please try again.",
      })
    }
  }

  const handleCreate = async (name: string, isActive: boolean) => {
    try {
      await axios.post(
        "https://scholarlog-api.onrender.com/api/courses",
        { name, isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // Fetch updated courses using the context method
      await fetchCourses()
      toast({
        title: "Course created",
        description: "The course has been successfully created.",
      })
    } catch (err) {
      console.error("Error creating course:", err)
      toast({
        title: "Error",
        description: "Failed to create the course. Please try again.",
      })
    }
  }

  const handleUpdate = async (id: number, name: string, isActive: boolean) => {
    try {
      await axios.put(
        `https://scholarlog-api.onrender.com/api/courses/${id}`,
        { name, isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // Update courses in context
      setCourses((prev) => 
        prev.map((c) => (c.id === id ? { ...c, name, isActive } : c))
      )
      toast({
        title: "Course updated",
        description: "The course has been successfully updated.",
      })
    } catch (err) {
      console.error("Failed to update course:", err)
      toast({
        title: "Error",
        description: "Failed to update the course. Please try again.",
      })
    }
  }

  useEffect(() => {
    if (!token) return
    setIsLoading(true)
    fetchCourses()
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false))
  }, [token])

  const filtered = tab === "active" ? activeCourses : completedCourses

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

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={tab}>
              {filtered.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                  <p className="text-lg">No {tab} courses found.</p>
                  <p className="text-sm">Click the button below to add your first course.</p>
                  <AddCourseModal
                    onCreate={handleCreate}
                    trigger={<Button className="mt-4">Add Course</Button>}
                    defaultActive={tab === "active"}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filtered.map((course) => (
                    <CourseCard 
                      key={course.id} 
                      course={course} 
                      onDelete={handleDelete} 
                      onUpdate={handleUpdate}
                    />
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
                    defaultActive={tab === "active"}
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
