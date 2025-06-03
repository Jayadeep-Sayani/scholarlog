import express from "express"
import prisma from "../utils/prisma"
import { verifyToken, AuthRequest } from "../middleware/authMiddleware"
import { calculateWeightedGPA, calculateOverallGPA, mapGradeToGpa } from "../utils/gpaUtils"

const router = express.Router()

router.get("/gpa", verifyToken, async (req: AuthRequest, res) => {
  // Get the user's preferred GPA scale
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { gpaScale: true }
  })

  // Default to uvic9 if no preference is found
  const scaleType = user?.gpaScale === 4.0 ? 'ubc4' : 'uvic9'
  
  const courses = await prisma.course.findMany({
    where: {
      userId: req.userId,
      isActive: false,
    },
    include: { 
      assignments: true 
    }
  })

  const coursesWithGPA = courses.map((course: any) => {
    const grade = calculateWeightedGPA(course.assignments)
    return {
      grade,
      credits: course.credits
    }
  })

  const gpa = calculateOverallGPA(coursesWithGPA, scaleType)
  const maxScale = scaleType === 'ubc4' ? 4.0 : 9.0
  res.json({ gpa, maxScale, scaleType })
})

router.get("/gpa-history", verifyToken, async (req: AuthRequest, res) => {
  // Get the user's preferred GPA scale
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { gpaScale: true }
  })

  // Default to uvic9 if no preference is found
  const scaleType = user?.gpaScale === 4.0 ? 'ubc4' : 'uvic9'
  
  const courses = await prisma.course.findMany({
    where: {
      userId: req.userId,
      isActive: false,
    },
    include: {
      assignments: true
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  const history = []
  let totalPoints = 0
  let totalCredits = 0

  for (const course of courses) {
    const weighted = calculateWeightedGPA(course.assignments)
    const courseGPA = mapGradeToGpa(weighted, scaleType)
    
    totalPoints += courseGPA * (course as any).credits
    totalCredits += (course as any).credits
    
    const cumulativeGpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0

    history.push({
      course: course.name,
      gpa: cumulativeGpa,
      createdAt: course.createdAt,
    })
  }

  res.json(history)
})

export default router
