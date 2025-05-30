import { useNavigate } from "react-router-dom"
import { MoreVertical, Edit, Trash } from "lucide-react"
import { Button } from "../components/ui/button"
import ConfirmDeleteModal from "./ConfirmDeleteModal"
import EditCourseModal from "./EditCourseModal"
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
    onUpdate?: (id: number, name: string, isActive: boolean) => void
}

export default function CourseCard({ course, onDelete, onUpdate }: Props) {
    const navigate = useNavigate()
    const [showConfirm, setShowConfirm] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)


    const handleCourseClick = (e: React.MouseEvent) => {
        // If we have an onUpdate function, we're using the edit modal approach
        // Otherwise, navigate to the course details page
        if (onUpdate) {
            // Just show the card without navigation
            return;
        } else {
            navigate(`/courses/${course.id}`);
        }
    };

    return (
        <div
            onClick={handleCourseClick}
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
                <PopoverContent className="w-40">
                    <div className="space-y-2">
                        {onUpdate && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowEditModal(true)
                                }}
                                className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                            >
                                <Edit size={16} />
                                <span>Edit</span>
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowConfirm(true)
                            }}
                            className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-red-600"
                        >
                            <Trash size={16} />
                            <span>Delete</span>
                        </button>
                    </div>
                </PopoverContent>
            </Popover>

            <div onClick={(e) => e.stopPropagation()}>
                <ConfirmDeleteModal
                    open={showConfirm}
                    onClose={() => setShowConfirm(false)}
                    onConfirm={() => {
                        onDelete(course.id)
                        setShowConfirm(false)
                    }}
                    courseName={course.name}
                />
                
                {onUpdate && (
                    <EditCourseModal
                        course={course}
                        onUpdate={onUpdate}
                        open={showEditModal}
                        onOpenChange={setShowEditModal}
                    />
                )}
            </div>

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
