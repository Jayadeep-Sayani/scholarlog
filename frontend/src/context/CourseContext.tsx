import { createContext, useContext, useEffect, useState, useMemo } from "react"
import axios from "axios"
import { useAuth } from "./AuthContext"

type Course = {
  id: number
  name: string
  isActive: boolean
  credits: number
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
  isLoading: boolean
  error: Error | null
}

const CourseContext = createContext<CourseContextType | undefined>(undefined)

export const CourseProvider = ({ children }: { children: React.ReactNode }) => {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { token } = useAuth()

  // Cache for API responses
  const [cache, setCache] = useState<{
    data: Course[] | null,
    timestamp: number | null
  }>({
    data: null,
    timestamp: null
  })

  // Cache expiration time (5 minutes)
  const CACHE_EXPIRATION = 5 * 60 * 1000

  const fetchCourses = async () => {
    if (!token) return
    
    // Check if we have valid cached data
    const now = Date.now()
    if (cache.data && cache.timestamp && (now - cache.timestamp < CACHE_EXPIRATION)) {
      setCourses(cache.data)
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await axios.get("https://scholarlog-api.onrender.com/api/courses/with-grade", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCourses(res.data)
      
      // Update cache
      setCache({
        data: res.data,
        timestamp: Date.now()
      })
    } catch (err) {
      console.error("Failed to fetch courses:", err)
      setError(err instanceof Error ? err : new Error('Failed to fetch courses'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [token])

  // Memoize derived state to prevent unnecessary recalculations
  const activeCourses = useMemo(() => 
    courses.filter(course => course.isActive),
    [courses]
  )
  
  const completedCourses = useMemo(() => 
    courses.filter(course => !course.isActive),
    [courses]
  )

  return (
    <CourseContext.Provider value={{ 
      courses, 
      setCourses, 
      fetchCourses,
      activeCourses,
      completedCourses,
      isLoading,
      error
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