import { Router, Response } from "express"
import prisma from "../utils/prisma"
import { verifyToken, AuthRequest } from "../middleware/authMiddleware"

const router = Router()

// Get assignments for a specific course
router.get("/:courseId", verifyToken, async (req: AuthRequest, res: Response) => {
  const courseId = Number(req.params.courseId)

  const assignments = await prisma.assignment.findMany({
    where: {
      courseId,
      course: { userId: req.userId },
    },
    orderBy: { createdAt: "desc" },
  })

  res.json(assignments)
})

// Create new assignment
router.post("/", verifyToken, async (req: AuthRequest, res: Response) => {
  const { name, grade, weight, courseId } = req.body

  const assignment = await prisma.assignment.create({
    data: {
      name,
      grade,
      weight,
      courseId,
    },
  })

  res.status(201).json(assignment)
})


router.put("/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  const assignmentId = parseInt(req.params.id, 10)
  const { name, grade, weight } = req.body

  if (!name || grade === undefined || weight === undefined) {
    res.status(400).json({ error: "All fields required" })
    return
  }

  const updated = await prisma.assignment.update({
    where: { id: assignmentId },
    data: { name, grade, weight },
  })

  res.json(updated)
})


// Delete an assignment
router.delete("/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id)

  const deleted = await prisma.assignment.deleteMany({
    where: {
      id,
      course: { userId: req.userId },
    },
  })

  if (deleted.count === 0) {
    res.status(404).json({ error: "Not found" })
    return
  }

  res.status(204).end()
})

export default router;