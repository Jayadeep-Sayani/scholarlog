// src/layouts/SidebarLayout.tsx
import { Link, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useCourses } from "../context/CourseContext"
import axios from "axios"
import { Button } from "../components/ui/button"
import { LayoutDashboard, BookOpen, Settings } from "lucide-react" // Optional icon
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../components/ui/accordion"

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
    const { pathname } = useLocation()
    const { token } = useAuth()
    const { activeCourses } = useCourses()
    const [user, setUser] = useState("")
    const [showDropdown, setShowDropdown] = useState(false)

    useEffect(() => {
        if (!token) return
        axios
            .get("https://scholarlog-api.onrender.com/api/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                console.log("User data:", res.data)
                setUser(res.data.user.email)
            })
    }, [token])

    const isActive = (path: string) => pathname === path

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r px-4 py-6 flex flex-col">
                <div className="flex-grow space-y-4">
                    <div className="text-2xl font-extrabold mb-4 ml-4">ScholarLog</div>

                    <nav className="space-y-2 text-sm">
                        <Link
                            to="/dashboard"
                            className={`flex items-center gap-2 px-3 py-2 rounded-md ${isActive("/dashboard") ? "bg-gray-200" : "hover:bg-gray-100"
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4 mr-4" />
                            Dashboard
                        </Link>

                        <Accordion type="single" collapsible defaultValue={activeCourses.length ? "courses" : undefined}>
                            <AccordionItem value="courses">
                                <AccordionTrigger className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
                                    <BookOpen className="w-4 h-4 mr-4" />
                                    Courses
                                </AccordionTrigger>
                                <AccordionContent className="pl-3">
                                    <Link
                                        to="/courses"
                                        className={`block px-3 py-2 ${isActive("/courses") ? "bg-gray-100" : "hover:bg-gray-100"
                                            }`}
                                    >
                                        All Courses
                                    </Link>
                                    {activeCourses.map((c) => (
                                        <Link
                                            key={c.id}
                                            to={`/courses/${c.id}`}
                                            className={`block px-3 py-2 text-muted-foreground hover:bg-gray-100 ${pathname.includes(`/courses/${c.id}`)
                                                ? "bg-gray-100 text-foreground"
                                                : "hover:bg-gray-10"
                                                }`}
                                        >
                                            {c.name}
                                        </Link>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <Link
                            to="/settings"
                            className={`flex items-center gap-2 px-3 py-2 rounded-md ${isActive("/settings") ? "bg-gray-200" : "hover:bg-gray-100"
                                }`}
                        >
                            <Settings className="w-4 h-4 mr-4" />
                            Settings
                        </Link>
                    </nav>
                </div>

                {/* Avatar Section Stuck to Bottom */}
                {token && (
                    <div className="mt-6">
                        <div className="flex items-center gap-3 p-3 border bg-muted">
                            <Avatar className="h-8 w-8 bg-gray-200 text-center text-sm font-bold">
                                <AvatarFallback>
                                    {user && user.length > 0 ? user[0].toUpperCase() : "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-sm">
                                <span className="font-semibold text-foreground truncate text-[0.65rem]">
                                    {user || "User"}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                    {activeCourses.length} active course
                                    {activeCourses.length !== 1 && "s"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-gray-50">{children}</main>
        </div>
    )
}
