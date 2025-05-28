import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Button } from "../components/ui/button"

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  courseName: string
}

export default function ConfirmDeleteModal({ open, onClose, onConfirm, courseName }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Course</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{courseName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Yes, Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
