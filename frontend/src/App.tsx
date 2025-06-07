import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { CourseProvider } from "./context/CourseContext"
import { UserProvider } from "./context/UserContext"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Courses from "./pages/Courses"
import CourseDetail from "./pages/CourseDetail"
import Assignments from "./pages/UpcomingAssignments"
import TipJar from "./pages/TipJar"
import Settings from "./pages/Settings"
import { PrivateRoute } from "./components/PrivateRoute"
import { Toaster } from "./components/ui/toaster"
import Landing from "./pages/Landing"
import MobileDetector from "./components/MobileDetector"
import { Analytics } from "@vercel/analytics/react"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <CourseProvider>
            <MobileDetector>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Landing />} />

                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/courses"
                  element={
                    <PrivateRoute>
                      <Courses />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/courses/:id"
                  element={
                    <PrivateRoute>
                      <CourseDetail />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/assignments"
                  element={
                    <PrivateRoute>
                      <Assignments />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/tip-jar"
                  element={
                    <PrivateRoute>
                      <TipJar />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  }
                />
              </Routes>
              <Toaster />
            </MobileDetector>
          </CourseProvider>
        </UserProvider>
      </AuthProvider>
      <Analytics />
    </BrowserRouter>
  )
}
