import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { useCourses } from "../context/CourseContext"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import Sidebar from "../components/Sidebar"


type Assignment = {
  id: number
  name: string
  grade: number
  weight: number
  createdAt: string
}

export default function CourseDetail() {
  const { id } = useParams()
  const courseId = Number(id)
  const { token } = useAuth()
  const { fetchCourses } = useCourses()
  const navigate = useNavigate()

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [courseName, setCourseName] = useState("")
  const [name, setName] = useState("")
  const [grade, setGrade] = useState("")
  const [weight, setWeight] = useState("")
  const [editTarget, setEditTarget] = useState<Assignment | null>(null)



  useEffect(() => {
    if (!courseId || !token) return

    // fetch course name
    axios.get("https://scholarlog-api.onrender.com/api/courses", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      const course = res.data.find((c: any) => c.id === courseId)
      if (!course) return navigate("/courses")
      setCourseName(course.name)
    })

    // fetch assignments
    axios
      .get(`https://scholarlog-api.onrender.com/api/assignments/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAssignments(res.data))
  }, [courseId, token, navigate])

  const handleAdd = async () => {
    try {
      await axios.post(
        "https://scholarlog-api.onrender.com/api/assignments",
        {
          name,
          grade: parseFloat(grade),
          weight: parseFloat(weight),
          courseId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setName("")
      setGrade("")
      setWeight("")
      const res = await axios.get(`https://scholarlog-api.onrender.com/api/assignments/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAssignments(res.data)
      
      // Refresh courses to update sidebar
      await fetchCourses()
    } catch (err) {
      console.error("Failed to add assignment:", err)
    }
  }


  return (
    <Sidebar>
    <div className="p-6 space-y-4">
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Name"
            value={editTarget?.name ?? ""}
            onChange={(e) =>
              setEditTarget((prev) => prev && { ...prev, name: e.target.value })
            }
          />
          <Input
            type="number"
            placeholder="Grade"
            value={editTarget?.grade ?? ""}
            onChange={(e) =>
              setEditTarget((prev) => prev && { ...prev, grade: +e.target.value })
            }
          />
          <Input
            type="number"
            placeholder="Weight"
            value={editTarget?.weight ?? ""}
            onChange={(e) =>
              setEditTarget((prev) => prev && { ...prev, weight: +e.target.value })
            }
          />

          <Button
            onClick={async () => {
              if (!editTarget) return

              try {
                await axios.put(
                  `https://scholarlog-api.onrender.com/api/assignments/${editTarget.id}`,
                  {
                    name: editTarget.name,
                    grade: editTarget.grade,
                    weight: editTarget.weight,
                  },
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                )

                const res = await axios.get(
                  `https://scholarlog-api.onrender.com/api/assignments/${courseId}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                )
                setAssignments(res.data)
                
                // Refresh courses to update sidebar
                await fetchCourses()
                
                setEditTarget(null)
              } catch (err) {
                console.error("Failed to update assignment:", err)
              }
            }}
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{courseName}</h1>
      </div>


      {assignments.length === 0 ? (
        <p className="text-muted-foreground text-sm">No assignments yet.</p>
      ) : (
        <ul className="space-y-1">
          {assignments.map((a) => (
            <li key={a.id} className="flex justify-between items-center">
              <div>
                <span className="font-medium">{a.name}</span>{" "}
                <span className="text-muted-foreground">
                  {a.grade}% ({a.weight}%)
                </span>

              </div>
              <div className="buttons">
                <Button
                  onClick={async () => {
                    try {
                      await axios.delete(`https://scholarlog-api.onrender.com/api/assignments/${a.id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      })
                      setAssignments((prev) => prev.filter((x) => x.id !== a.id))
                      
                      // Refresh courses to update sidebar
                      await fetchCourses()
                    } catch (err) {
                      console.error("Failed to delete:", err)
                    }
                  }}
                >
                  Delete
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditTarget(a)
                  }}
                >
                  Edit
                </Button>
              </div>

            </li>
          ))}
        </ul>
      )}



      <div className="pt-4 space-y-2">
        <h2 className="text-lg font-semibold">Add Assignment</h2>
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input type="number" placeholder="Grade %" value={grade} onChange={(e) => setGrade(e.target.value)} />
        <Input type="number" placeholder="Weight %" value={weight} onChange={(e) => setWeight(e.target.value)} />
        <Button onClick={handleAdd}>Add</Button>
      </div>
    </div>
    </Sidebar>
  )
}
