// src/layouts/SidebarLayout.tsx
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useCourses } from "../context/CourseContext"
import { useUser } from "../context/UserContext"
import { Button } from "../components/ui/button"
import { LayoutDashboard, BookOpen, Settings, ClipboardList, LogOut, Heart, Cog } from "lucide-react"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../components/ui/accordion"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "./ui/dialog"

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
    const { pathname } = useLocation()
    const { token, logout } = useAuth()
    const { activeCourses } = useCourses()
    const { userData } = useUser()
    const navigate = useNavigate()
    const [isCoursesOpen, setIsCoursesOpen] = useState(() => {
        const saved = localStorage.getItem('coursesMenuOpen')
        return saved ? JSON.parse(saved) : false
    })
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    // Save isCoursesOpen to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('coursesMenuOpen', JSON.stringify(isCoursesOpen))
    }, [isCoursesOpen])

    const isActive = (path: string) => pathname === path

    return (
        <div className="flex h-screen bg-gray-50">
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4">
                    <Link to="/dashboard" className="text-2xl font-bold text-gray-900">
                        ScholarLog
                    </Link>
                </div>

                <nav className="flex-1 px-2 py-4 space-y-1">
                    <Link
                        to="/dashboard"
                        className={`flex items-center px-3 py-2 rounded-md ${
                            isActive("/dashboard")
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Dashboard
                    </Link>

                    <Accordion
                        type="single"
                        collapsible
                        value={isCoursesOpen ? "courses" : undefined}
                        onValueChange={(value) => setIsCoursesOpen(value === "courses")}
                    >
                        <AccordionItem value="courses" className="border-none">
                            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 rounded-md">
                                <div className="flex items-center">
                                    <BookOpen className="w-5 h-5 mr-3" />
                                    <span>Courses</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pl-8 space-y-1">
                                <Link
                                    to="/courses"
                                    className={`block px-3 py-2 rounded-md ${
                                        isActive("/courses")
                                            ? "bg-gray-100 text-gray-900"
                                            : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    All Courses
                                </Link>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <Link
                        to="/assignments"
                        className={`flex items-center px-3 py-2 rounded-md ${
                            isActive("/assignments")
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        <ClipboardList className="w-5 h-5 mr-3" />
                        Assignments
                    </Link>

                    <Link
                        to="/settings"
                        className={`flex items-center px-3 py-2 rounded-md ${
                            isActive("/settings")
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        <Settings className="w-5 h-5 mr-3" />
                        Settings
                    </Link>

                    <Link
                        to="/tip-jar"
                        className={`flex items-center px-3 py-2 rounded-md ${
                            isActive("/tip-jar")
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        <Heart className="w-5 h-5 mr-3" />
                        Tip Jar
                    </Link>
                </nav>

                {token && (
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center gap-3 p-3 border bg-muted">
                            <Avatar className="h-8 w-8 bg-gray-200 text-center text-sm font-bold">
                                <AvatarFallback>
                                    {userData?.email && userData.email.length > 0 ? userData.email[0].toUpperCase() : "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-sm">
                                <span className="font-semibold text-foreground truncate text-[0.65rem]">
                                    {userData?.email || "User"}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                    {activeCourses.length} active course
                                    {activeCourses.length !== 1 && "s"}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 text-red-600 w-full text-left border border-red-200"
                        >
                            <LogOut className="w-4 h-4 mr-4" />
                            Logout
                        </button>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-gray-50 overflow-y-auto h-screen">{children}</main>

            <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Logout</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to logout?</p>
                    <DialogFooter>
                        <Button 
                            className="bg-gray-100 hover:bg-gray-200 text-gray-900" 
                            onClick={() => setShowLogoutConfirm(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => {
                                logout()
                                setShowLogoutConfirm(false)
                                navigate("/login")
                            }}
                        >
                            Logout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
