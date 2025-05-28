import { useNavigate } from "react-router-dom"
import { MoreVertical } from "lucide-react"
import { Button } from "../components/ui/button"
import ConfirmDeleteModal from "./ConfirmDeleteModal"
import { useState } from "react"

import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"

type Props = {
    course: {
        id: number
        name: string
        isActive: boolean
        grade?: number // optional GPA from backend
    }
    onDelete: (id: number) => void
}

export default function CourseCard({ course, onDelete }: Props) {
    const navigate = useNavigate()
    const [showConfirm, setShowConfirm] = useState(false)


    return (
        <div
            onClick={() => navigate(`/courses/${course.id}`)}
            className="relative border rounded-xl p-4 bg-white shadow-sm hover:shadow-md cursor-pointer aspect-square flex flex-col justify-between"
        >
            {/* 3-dots menu */}
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-5 right-5 text-muted-foreground hover:text-black"
                    >
                        <MoreVertical size={25} />
                    </button>
                </PopoverTrigger>
                <PopoverContent>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowConfirm(true)
                        }}
                        className="text-red-600 hover:underline"
                    >
                        Delete
                    </button>
                </PopoverContent>
            </Popover>

            <ConfirmDeleteModal
                open={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={() => {
                    onDelete(course.id)
                    setShowConfirm(false)
                }}
                courseName={course.name}
            />

            <div className="space-y-1">
                <h2 className="text-xl font-semibold">{course.name}</h2>
                <p className="text-sm text-gray-500">
                    {course.isActive ? "Active" : "Completed"}
                </p>
                <p className="text-sm">
                    Grade: <span className="font-bold">{course.grade?.toFixed(2) ?? "N/A"}%</span>
                </p>
            </div>
        </div>
    )
}
