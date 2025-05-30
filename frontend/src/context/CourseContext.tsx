import { createContext, useContext, useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "./AuthContext"

type Course = {
  id: number
  name: string
  isActive: boolean
  createdAt: string
  assignments?: Assignment[]
  grade?: number
}

type Assignment = {
  id: number
  name: string
  grade: number
  weight: number
  createdAt: string
}

interface CourseContextType {
  courses: Course[]
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>
  fetchCourses: () => Promise<void>
  activeCourses: Course[]
  completedCourses: Course[]
}

const CourseContext = createContext<CourseContextType | undefined>(undefined)

export const CourseProvider = ({ children }: { children: React.ReactNode }) => {
  const [courses, setCourses] = useState<Course[]>([])
  const { token } = useAuth()

  const fetchCourses = async () => {
    if (!token) return
    
    try {
      const res = await axios.get("https://scholarlog-api.onrender.com/api/courses/with-grade", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCourses(res.data)
    } catch (err) {
      console.error("Failed to fetch courses:", err)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [token])

  // Derived state for active and completed courses
  const activeCourses = courses.filter(course => course.isActive)
  const completedCourses = courses.filter(course => !course.isActive)

  return (
    <CourseContext.Provider value={{ 
      courses, 
      setCourses, 
      fetchCourses,
      activeCourses,
      completedCourses
    }}>
      {children}
    </CourseContext.Provider>
  )
}

export const useCourses = () => {
  const context = useContext(CourseContext)
  if (context === undefined) {
    throw new Error("useCourses must be used within a CourseProvider")
  }
  return context
}