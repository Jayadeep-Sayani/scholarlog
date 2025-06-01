import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { JSX, useEffect, useState } from "react"
import axios from "axios"

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoggedIn, loading } = useAuth();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const res = await axios.get("https://scholarlog-api.onrender.com/api/auth/me");
        setIsVerified(res.data.user.isVerified);
      } catch (error) {
        console.error("Error checking verification status:", error);
      }
    };

    if (isLoggedIn) {
      checkVerification();
    }
  }, [isLoggedIn]);

  if (loading || isVerified === null) return null;

  if (!isLoggedIn) return <Navigate to="/login" />;
  if (!isVerified) return <Navigate to="/verify" />;

  return children;
};
