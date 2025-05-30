import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"

type Course = {
  id: number
  name: string
  isActive: boolean
  grade?: number
}

type Props = {
  course: Course
  onUpdate: (id: number, name: string, isActive: boolean) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditCourseModal({ course, onUpdate, open, onOpenChange }: Props) {
  const [name, setName] = useState(course.name)
  const [isActive, setIsActive] = useState(course.isActive)

  // Update local state when course prop changes
  useEffect(() => {
    setName(course.name)
    setIsActive(course.isActive)
  }, [course])

  const handleSubmit = () => {
    if (!name.trim()) return
    onUpdate(course.id, name, isActive)
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

          <div className="flex items-center justify-between">
            <Label htmlFor="status">Mark as Active (otherwise it's completed)</Label>
            <Switch
              id="status"
              checked={isActive}
              onCheckedChange={(val) => setIsActive(val)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}