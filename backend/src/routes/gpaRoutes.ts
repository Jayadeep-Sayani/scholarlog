import express from "express"
import prisma from "../utils/prisma"
import { verifyToken, AuthRequest } from "../middleware/authMiddleware"
import { calculateWeightedGPA, calculateOverallGPA, mapGradeToGpa } from "../utils/gpaUtils"

const router = express.Router()

router.get("/gpa", verifyToken, async (req: AuthRequest, res) => {
  const courses = await prisma.course.findMany({
    where: {
      userId: req.userId,
      isActive: false,
    },
    include: { assignments: true },
  })

  const courseGpas = courses.map((course) => {
    const grade = calculateWeightedGPA(course.assignments)
    return mapGradeToGpa(grade)
  })

  const gpa = courseGpas.length
    ? parseFloat((courseGpas.reduce((a, b) => a + b, 0) / courseGpas.length).toFixed(2))
    : 0

  res.json({ gpa })
})

router.get("/gpa-history", verifyToken, async (req: AuthRequest, res) => {
  const courses = await prisma.course.findMany({
    where: {
      userId: req.userId,
      isActive: false,
    },
    include: {
      assignments: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  const history = []
  let totalGpa = 0
  let count = 0

  for (const course of courses) {
    const weighted = calculateWeightedGPA(course.assignments)
    const gpa = mapGradeToGpa(weighted)

    count += 1
    totalGpa += gpa
    const cumulativeGpa = parseFloat((totalGpa / count).toFixed(2))

    history.push({
      course: course.name,
      gpa: cumulativeGpa,
      createdAt: course.createdAt,
    })
  }

  res.json(history)
})

export default router
