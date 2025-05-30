import { useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"

type Props = {
  onCreate: (name: string, isActive: boolean) => void
  trigger: React.ReactNode
  defaultActive?: boolean
}

export default function AddCourseModal({ onCreate, trigger, defaultActive = true }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [isActive, setIsActive] = useState(defaultActive)

  const handleSubmit = () => {
    if (!name.trim()) return
    onCreate(name, isActive)
    setName("")
    setIsActive(true)
    setOpen(false)
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
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Create Course</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
