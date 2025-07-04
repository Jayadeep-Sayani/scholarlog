import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { useCourses } from "../context/CourseContext"

type Course = {
  id: number
  name: string
  isActive: boolean
  credits: number
  grade?: number
}

type Props = {
  course: Course
  onUpdate: (id: number, name: string, isActive: boolean, credits: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditCourseModal({ course, onUpdate, open, onOpenChange }: Props) {
  const [name, setName] = useState(course.name)
  const [isActive, setIsActive] = useState(course.isActive)
  const [finalGrade, setFinalGrade] = useState("")
  const [credits, setCredits] = useState(course.credits.toString())
  const { token } = useAuth()
  const { fetchCourses } = useCourses()

  // Update local state when course prop changes
  useEffect(() => {
    setName(course.name)
    setIsActive(course.isActive)
    setFinalGrade("")
    setCredits(course.credits.toString())
  }, [course])

  const handleSubmit = async () => {
    if (!name.trim()) return
    if (!isActive && !finalGrade.trim()) {
      alert("Please enter a final grade when marking a course as completed")
      return
    }

    // First update the course status
    onUpdate(course.id, name, isActive, parseFloat(credits))

    // If marking as completed, add the final grade assignment
    if (!isActive && finalGrade.trim()) {
      try {
        // First delete all existing assignments
        const assignments = await axios.get(
          `https://scholarlog-api.onrender.com/api/assignments/${course.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        // Delete each assignment
        for (const assignment of assignments.data) {
          await axios.delete(
            `https://scholarlog-api.onrender.com/api/assignments/${assignment.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        }

        // Delete all upcoming assignments for this course
        const upcomingAssignments = await axios.get(
          "https://scholarlog-api.onrender.com/api/upcoming-assignments",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        // Delete each upcoming assignment for this course
        for (const assignment of upcomingAssignments.data) {
          if (assignment.courseId === course.id) {
            await axios.delete(
              `https://scholarlog-api.onrender.com/api/upcoming-assignments/${assignment.id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            )
          }
        }

        // Add the final grade assignment
        await axios.post(
          "https://scholarlog-api.onrender.com/api/assignments",
          {
            name: "Final Grade",
            grade: parseFloat(finalGrade),
            weight: 100,
            courseId: course.id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        
        // Refresh courses to update the grade display
        await fetchCourses()
      } catch (err) {
        console.error("Failed to add final grade assignment:", err)
      }
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Course Name</Label>
            <Input
              id="name"
              placeholder="e.g. Calculus I"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="credits">Credits</Label>
            <Input
              id="credits"
              type="number"
              step="0.5"
              placeholder="Enter number of credits"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              min="0"
              max="6"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="status">Mark as Active (otherwise it's completed)</Label>
            <Switch
              id="status"
              checked={isActive}
              onCheckedChange={(val) => setIsActive(val)}
            />
          </div>

          {!isActive && (
            <div>
              <Label htmlFor="finalGrade">Final Grade (%)</Label>
              <Input
                id="finalGrade"
                type="number"
                placeholder="Enter final grade"
                value={finalGrade}
                onChange={(e) => setFinalGrade(e.target.value)}
                min="0"
                max="100"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}