import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { JSX } from "react"

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return null; // or a loading spinner

  return isLoggedIn ? children : <Navigate to="/login" />;
}
