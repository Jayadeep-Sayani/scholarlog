import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { CourseProvider } from "./context/CourseContext"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Courses from "./pages/Courses"
import CourseDetail from "./pages/CourseDetail"
import Assignments from "./pages/UpcomingAssignments"
import { PrivateRoute } from "./components/PrivateRoute"
import { Toaster } from "./components/ui/toaster"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CourseProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />

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
          </Routes>
          <Toaster />
        </CourseProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
