import { Router, Response } from "express"
import prisma from "../utils/prisma"
import { verifyToken, AuthRequest } from "../middleware/authMiddleware"
import { calculateWeightedGPA } from "../utils/gpaUtils"
import { Prisma } from "@prisma/client"

const router = Router()

// GET /courses
router.get("/", verifyToken, async (req: AuthRequest, res) => {
  const courses = await prisma.course.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
  })
  res.json(courses)
})

// POST /courses
router.post("/", verifyToken, async (req: AuthRequest, res: Response) => {
  const { name, isActive, credits } = req.body

  const course = await prisma.course.create({
    data: {
      name,
      isActive: isActive ?? true,
      credits: credits ?? 3,
      userId: req.userId!,
    } as Prisma.CourseUncheckedCreateInput,
  })

  res.status(201).json(course)
})

router.delete("/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  const courseId = Number(req.params.id)

  const deleted = await prisma.course.deleteMany({
    where: {
      id: courseId,
      userId: req.userId,
    },
  })

  if (deleted.count === 0) {
    res.status(404).json({ error: "Course not found" })
    return
  }

  res.status(204).end()
})

router.put("/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  const courseId = Number(req.params.id)
  const { name, isActive, credits } = req.body

  if (!name || isActive === undefined) {
    res.status(400).json({ error: "Name and status are required" })
    return  
  }

  const updated = await prisma.course.update({
    where: {
      id: courseId,
      userId: req.userId,
    },
    data: {
      name,
      isActive,
      credits: credits ?? 3,
    } as Prisma.CourseUncheckedUpdateInput,
  })

  res.json(updated)
})


router.get("/with-grade", verifyToken, async (req: AuthRequest, res) => {
  const courses = await prisma.course.findMany({
    where: { userId: req.userId },
    include: { assignments: true },
    orderBy: { createdAt: "desc" },
  })

  const coursesWithGPA = courses.map((course: any) => {
    const grade = calculateWeightedGPA(course.assignments)
    return {
      id: course.id,
      name: course.name,
      isActive: course.isActive,
      credits: course.credits,
      createdAt: course.createdAt,
      grade,
    }
  })

  res.json(coursesWithGPA)
})

export default router
