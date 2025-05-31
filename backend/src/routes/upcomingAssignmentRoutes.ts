import { Router, Response } from "express"
import prisma from "../utils/prisma"
import { verifyToken, AuthRequest } from "../middleware/authMiddleware"

const router = Router()

// Get all upcoming assignments for a user
router.get("/", verifyToken, async (req: AuthRequest, res: Response) => {
  const assignments = await prisma.upcomingAssignment.findMany({
    where: {
      course: { userId: req.userId },
    },
    orderBy: { deadline: "asc" },
  })

  res.json(assignments)
})

// Create new upcoming assignment
router.post("/", verifyToken, async (req: AuthRequest, res: Response) => {
  const { name, status, deadline, courseId } = req.body

  if (!name || !status || !deadline || !courseId) {
    res.status(400).json({ error: "All fields required" })
    return
  }

  // Verify the course belongs to the user
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      userId: req.userId,
    },
  })

  if (!course) {
    res.status(404).json({ error: "Course not found" })
    return
  }

  const assignment = await prisma.upcomingAssignment.create({
    data: {
      name,
      status,
      deadline: new Date(deadline),
      courseId,
    },
  })

  res.status(201).json(assignment)
})

// Update an upcoming assignment
router.put("/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  const assignmentId = parseInt(req.params.id, 10)
  const { name, status, deadline } = req.body

  if (!name || !status || !deadline) {
    res.status(400).json({ error: "All fields required" })
    return
  }

  const updated = await prisma.upcomingAssignment.update({
    where: {
      id: assignmentId,
      course: { userId: req.userId },
    },
    data: {
      name,
      status,
      deadline: new Date(deadline),
    },
  })

  res.json(updated)
})

// Delete an upcoming assignment
router.delete("/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id)

  const deleted = await prisma.upcomingAssignment.deleteMany({
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

export default router 