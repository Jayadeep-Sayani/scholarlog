
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { Card, CardContent } from "../components/ui/card"
import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import { useNavigate } from "react-router-dom"
import CourseCard from "../components/CourseCard"
import Sidebar from "../components/Sidebar"

const dummyCourses = [
    { id: 1, name: "Calculus I", isActive: true },
    { id: 2, name: "Intro to Psych", isActive: false },
    { id: 3, name: "Algorithms", isActive: true },
]


type Assignment = {
    id: number
    name: string
    grade: number
    weight: number
    createdAt: string
}

type Course = {
    id: number
    name: string
    isActive: boolean
    createdAt: string
    assignments?: Assignment[] // optional, fetched per course
    grade?: number // 👈 optional GPA from backend
}


export default function Courses() {
    const [courses, setCourses] = useState<Course[]>([])
    const [tab, setTab] = useState("active")
    const { token } = useAuth()
    const [newName, setNewName] = useState("")
    const [newStatus, setNewStatus] = useState("active")
    const [userGpa, setUserGpa] = useState<number | null>(null)
    const [gpaScale, setGpaScale] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)



    const navigate = useNavigate()

    const fetchUserGpa = async () => {
        try {
            const res = await axios.get("http://localhost:4000/api/user/gpa", {
                headers: { Authorization: `Bearer ${token}` },
            })
            setUserGpa(res.data.gpa)
            setGpaScale(res.data.scale)
        } catch (err) {
            console.error("Failed to fetch GPA", err)
        }
    }


    useEffect(() => {
        if (!token) return
        fetchUserGpa()
    }, [token])


    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`http://localhost:4000/api/courses/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setCourses((prev) => prev.filter((c) => c.id !== id))
        } catch (err) {
            console.error("Failed to delete course:", err)
        }
    }


    useEffect(() => {
        if (!token) return
        setIsLoading(true)
        axios
            .get("http://localhost:4000/api/courses/with-grade", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setCourses(res.data))
            .catch((err) => console.error("Failed to fetch courses:", err))
            .finally(() => setIsLoading(false))
    }, [token])



    const handleCreate = async () => {
        if (!newName.trim()) return

        try {
            await axios.post(
                "http://localhost:4000/api/courses",
                {
                    name: newName,
                    isActive: newStatus === "active",
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            setNewName("")
            setNewStatus("active")
            // reload data
            const res = await axios.get("http://localhost:4000/api/courses/with-grade", {
                headers: { Authorization: `Bearer ${token}` },
            })
            setCourses(res.data)


        } catch (err) {
            console.error("Error creating course:", err)
        }
    }

    const filtered = courses.filter((course) => {
        if (tab === "active") return course.isActive
        if (tab === "completed") return !course.isActive
        return true
    })


    if (isLoading) {
        return (
            <div className="w-full text-center py-10 text-muted-foreground">
                Loading your courses...
            </div>
        )
    }

    return (
        <Sidebar>
            <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-10">
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-4">Your Courses</h1>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                        <Input
                            placeholder="Course name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full sm:w-64"
                        />

                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="border rounded-md px-3 py-2 text-sm"
                        >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>

                        <Button onClick={handleCreate} className="w-full sm:w-auto">
                            Add Course
                        </Button>
                    </div>

                    {gpaScale !== null && (
                        <div className="flex items-center gap-2 mb-8">
                            <label className="text-sm text-muted-foreground">GPA Scale:</label>
                            <select
                                value={gpaScale}
                                onChange={(e) => {
                                    const newScale = parseFloat(e.target.value)
                                    axios
                                        .put("http://localhost:4000/api/user/settings/scale", { scale: newScale }, {
                                            headers: { Authorization: `Bearer ${token}` },
                                        })
                                        .then(() => fetchUserGpa())
                                        .catch((err) => console.error("Failed to update scale", err))
                                }}
                                className="border rounded-md px-2 py-1 text-sm"
                            >
                                <option value={4.0}>4.0</option>
                                <option value={10.0}>10.0</option>
                            </select>
                        </div>
                    )}


                    {userGpa !== null && (
                        <div className="mb-6 px-4 py-3 bg-white rounded-xl shadow flex items-center justify-between max-w-md">
                            <p className="text-sm text-muted-foreground">Your Overall GPA</p>
                            <p className="text-xl font-bold text-black">
                                {userGpa.toFixed(2)} / {gpaScale}
                            </p>
                        </div>
                    )}


                    <Tabs value={tab} onValueChange={setTab}>
                        <TabsList>
                            <TabsTrigger value="active">Active</TabsTrigger>
                            <TabsTrigger value="completed">Completed</TabsTrigger>
                            <TabsTrigger value="all">All</TabsTrigger>
                        </TabsList>

                        <TabsContent value={tab}>
                            {filtered.length === 0 ? (
                                <div className="w-full text-center py-10 text-muted-foreground">
                                    No courses found for this tab.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {filtered.map((course) => (
                                        <CourseCard key={course.id} course={course} onDelete={handleDelete} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </Sidebar>
    )
}
