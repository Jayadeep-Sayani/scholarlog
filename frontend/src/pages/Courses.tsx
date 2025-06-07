import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { useEffect, useState, useMemo } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { useCourses } from "../context/CourseContext"
import { Button } from "../components/ui/button"
import { useNavigate } from "react-router-dom"
import CourseCard from "../components/CourseCard"
import Sidebar from "../components/Sidebar"
import AddCourseModal from "../components/AddCourseModal"
import EditCourseModal from "../components/EditCourseModal"
import { Plus, Pencil, Trash2, BookOpen, Loader2 } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import { Link } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"

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
  credits: number
}

export default function Courses() {
  const [tab, setTab] = useState("active")
  const { token } = useAuth()
  const { courses, setCourses, fetchCourses, activeCourses, completedCourses, isLoading, error } = useCourses()
  const [userGpa, setUserGpa] = useState<number | null>(null)
  const [isGpaLoading, setIsGpaLoading] = useState(false)
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Course | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const navigate = useNavigate()

  const fetchUserGpa = async () => {
    if (!token) return
    
    setIsGpaLoading(true)
    try {
      const res = await axios.get("https://scholarlog-api.onrender.com/api/user/gpa", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUserGpa(res.data.gpa)
    } catch (err) {
      console.error("Failed to fetch GPA", err)
      toast({
        title: "Error",
        description: "Failed to load your GPA. Please try again later.",
      })
    } finally {
      setIsGpaLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
    fetchUserGpa()
  }, [token, courses]) // Re-fetch GPA when courses change

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

  const handleUpdate = async (id: number, name: string, isActive: boolean, credits: number) => {
    try {
      await axios.put(
        `https://scholarlog-api.onrender.com/api/courses/${id}`,
        { name, isActive, credits },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // Update courses in context
      setCourses((prev) => 
        prev.map((c) => (c.id === id ? { ...c, name, isActive, credits } : c))
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

  // Memoize filtered courses based on tab and search query
  const filtered = useMemo(() => {
    const coursesToFilter = tab === "active" ? activeCourses : completedCourses;
    if (!searchQuery.trim()) return coursesToFilter;
    
    const query = searchQuery.toLowerCase();
    return coursesToFilter.filter(course => 
      course.name.toLowerCase().includes(query)
    );
  }, [tab, activeCourses, completedCourses, searchQuery]);

  // Render loading state
  if (isLoading) {
    return (
      <Sidebar>
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-10">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Your Courses</h1>
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading your courses...</p>
              </div>
            </div>
          </div>
        </div>
      </Sidebar>
    )
  }

  // Render error state
  if (error) {
    return (
      <Sidebar>
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-10">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Your Courses</h1>
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center text-center">
                <p className="text-red-500 font-medium">Error loading courses</p>
                <p className="mt-2 text-muted-foreground max-w-md">We couldn't load your courses. Please try again later.</p>
                <Button 
                  className="mt-4" 
                  onClick={() => fetchCourses()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-10">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">Your Courses</h1>

          <div className="flex justify-between items-center mb-6">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  {/* Search input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search courses..."
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <AddCourseModal
                    onCreate={handleCreate}
                    trigger={
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Course
                      </Button>
                    }
                    defaultActive={tab === "active"}
                  />
                </div>
              </div>

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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((course) => (
                      <div
                        key={course.id}
                        onClick={() => tab === "active" && navigate(`/courses/${course.id}`)}
                        className={`bg-white rounded-xl shadow-sm overflow-hidden border ${
                          tab === "completed" ? "border-green-100" : "border-gray-100"
                        } ${tab === "active" ? "hover:shadow-md cursor-pointer group" : ""} transition-shadow`}
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className={`text-xl font-semibold text-gray-900 ${tab === "active" ? "group-hover:underline" : ""}`}>{course.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {course.credits} Credit{course.credits !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                className="p-2 hover:bg-gray-100"
                                onClick={() => {
                                  setEditTarget(course)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <EditCourseModal
                                course={course}
                                onUpdate={handleUpdate}
                                open={isEditDialogOpen && editTarget?.id === course.id}
                                onOpenChange={setIsEditDialogOpen}
                              />
                              <Button
                                className="p-2 hover:bg-gray-100"
                                onClick={() => handleDelete(course.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {tab === "completed" ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-green-600">
                                Final Grade: {course.grade?.toFixed(1) || 'N/A'}%
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {course.assignments?.length || 0} Assignment{course.assignments?.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}
