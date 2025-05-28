import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import { PrivateRoute } from "./components/PrivateRoute"
import Courses from "./pages/Courses"
import CourseDetail from "./pages/CourseDetail"
import Landing from "./pages/Landing"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        <Route path="/courses" element={
          <PrivateRoute>
            <Courses />
          </PrivateRoute>
        } />

        <Route path="/courses/:id" element={
          <PrivateRoute>
            <CourseDetail />
          </PrivateRoute>
        } />
      </Routes>

    </BrowserRouter>
  )
}

export default App
