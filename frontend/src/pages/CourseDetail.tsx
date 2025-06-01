import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCourses } from "../context/CourseContext"
import axios from "axios"
import SidebarLayout from "../components/Sidebar"
import { Button } from "../components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"

interface Assignment {
  id: number
  name: string
  grade: number
  weight: number
}

export default function CourseDetail() {
  const { id } = useParams()
  const courseId = Number(id)
  const { token } = useAuth()
  const { activeCourses, fetchCourses } = useCourses()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Assignment | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    weight: "",
  })
  const { toast } = useToast()

  const course = activeCourses.find((c) => c.id === courseId)
  const courseName = course?.name || "Course"

  useEffect(() => {
    if (!token || !courseId) return

    axios
      .get(`https://scholarlog-api.onrender.com/api/assignments/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAssignments(res.data))
      .catch((err) => console.error("Failed to load assignments", err))
  }, [token, courseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        "https://scholarlog-api.onrender.com/api/assignments",
        {
          name: formData.name,
          grade: parseFloat(formData.grade),
          weight: parseFloat(formData.weight),
          courseId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setAssignments((prev) => [...prev, response.data])
      setFormData({ name: "", grade: "", weight: "" })
      setIsAddDialogOpen(false)

      toast({
        title: "Assignment added",
        description: "The assignment has been successfully added.",
      })
    } catch (err) {
      console.error("Failed to add assignment:", err)
      toast({
        title: "Error",
        description: "Failed to add the assignment. Please try again.",
      })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(
        `https://scholarlog-api.onrender.com/api/assignments/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setAssignments((prev) => prev.filter((a) => a.id !== id))
      await fetchCourses()

      toast({
        title: "Assignment deleted",
        description: "The assignment has been successfully deleted.",
      })
    } catch (err) {
      console.error("Failed to delete assignment:", err)
      toast({
        title: "Error",
        description: "Failed to delete the assignment. Please try again.",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const calculateCurrentGrade = () => {
    if (assignments.length === 0) return 0

    const totalWeight = assignments.reduce((sum, a) => sum + a.weight, 0)
    if (totalWeight === 0) return 0

    const weightedSum = assignments.reduce(
      (sum, a) => sum + (a.grade * a.weight) / 100,
      0
    )
    return (weightedSum / totalWeight) * 100
  }

  const currentGrade = calculateCurrentGrade()

  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{courseName}</h1>
          <Button
            className="flex items-center gap-2"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Assignment
          </Button>
        </div>

        {/* Add Assignment Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Assignment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Assignment Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                  Grade (%)
                </label>
                <input
                  type="number"
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (%)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button type="submit" className="w-full">
                Add Assignment
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Assignment Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Assignment</DialogTitle>
            </DialogHeader>
            {editTarget && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Assignment Name
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={editTarget.name}
                    onChange={(e) =>
                      setEditTarget({ ...editTarget, name: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="edit-grade" className="block text-sm font-medium text-gray-700 mb-1">
                    Grade (%)
                  </label>
                  <input
                    type="number"
                    id="edit-grade"
                    name="grade"
                    value={editTarget.grade}
                    onChange={(e) =>
                      setEditTarget({
                        ...editTarget,
                        grade: parseFloat(e.target.value),
                      })
                    }
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="edit-weight" className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (%)
                  </label>
                  <input
                    type="number"
                    id="edit-weight"
                    name="weight"
                    value={editTarget.weight}
                    onChange={(e) =>
                      setEditTarget({
                        ...editTarget,
                        weight: parseFloat(e.target.value),
                      })
                    }
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  onClick={async () => {
                    if (!editTarget) return

                    try {
                      await axios.put(
                        `https://scholarlog-api.onrender.com/api/assignments/${editTarget.id}`,
                        {
                          name: editTarget.name,
                          grade: editTarget.grade,
                          weight: editTarget.weight,
                        },
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      )

                      const res = await axios.get(
                        `https://scholarlog-api.onrender.com/api/assignments/${courseId}`,
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      )
                      setAssignments(res.data)
                      
                      // Refresh courses to update sidebar
                      await fetchCourses()
                      
                      setEditTarget(null)
                      setIsEditDialogOpen(false)

                      toast({
                        title: "Assignment updated",
                        description: "The assignment has been successfully updated.",
                      })
                    } catch (err) {
                      console.error("Failed to update assignment:", err)
                      toast({
                        title: "Error",
                        description: "Failed to update the assignment. Please try again.",
                      })
                    }
                  }}
                >
                  Save Changes
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Assignments List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Assignments</h2>
            {assignments.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                <p className="text-lg">No assignments found.</p>
                <p className="text-sm">Click the button above to add your first assignment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{assignment.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>Grade: {assignment.grade.toFixed(1)}%</span>
                        <span>Weight: {assignment.weight.toFixed(1)}%</span>
                        <span>Contribution: {((assignment.grade * assignment.weight) / 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        className="p-2 hover:bg-gray-100"
                        onClick={() => {
                          setEditTarget(assignment)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        className="p-2 hover:bg-gray-100"
                        onClick={() => handleDelete(assignment.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current Grade Display */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Current Grade</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Based on {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {currentGrade.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
