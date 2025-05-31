import { useState, useEffect } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { useCourses } from "../context/CourseContext"
import { useToast } from "../hooks/use-toast"

type Props = {
  onCreate: (name: string, isActive: boolean) => void
  trigger: React.ReactNode
  defaultActive?: boolean
}

export default function AddCourseModal({ onCreate, trigger, defaultActive = true }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [isActive, setIsActive] = useState(defaultActive)
  const [grade, setGrade] = useState("")
  const { token } = useAuth()
  const { fetchCourses } = useCourses()
  const { toast } = useToast()

  // Update isActive when modal opens to use current defaultActive value
  useEffect(() => {
    if (open) {
      setIsActive(defaultActive)
    }
  }, [open, defaultActive])

  const handleSubmit = async () => {
    if (!name.trim()) return
    if (!isActive && !grade.trim()) {
      toast({
        title: "Error",
        description: "Final grade is required for completed courses.",
      })
      return
    }

    // Create the course
    try {
      const response = await axios.post(
        "https://scholarlog-api.onrender.com/api/courses",
        { name, isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // If creating a completed course, add the final grade assignment
      if (!isActive && grade.trim()) {
        await axios.post(
          "https://scholarlog-api.onrender.com/api/assignments",
          {
            name: "Final Grade",
            grade: parseFloat(grade),
            weight: 100,
            courseId: response.data.id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      }

      // Refresh courses to update the display
      await fetchCourses()
      
      // Reset form
      setName("")
      setGrade("")
      setIsActive(defaultActive)
      setOpen(false)

      toast({
        title: "Course created",
        description: "The course has been successfully created.",
      })
    } catch (err) {
      console.error("Failed to create course:", err)
      toast({
        title: "Error",
        description: "Failed to create the course. Please try again.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Course</DialogTitle>
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
              <Label htmlFor="grade">Final Grade (%)</Label>
              <Input
                id="grade"
                type="number"
                placeholder="Enter final grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Create Course</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
