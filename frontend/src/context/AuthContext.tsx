import { createContext, useContext, useEffect, useState } from "react"
import axios, { AxiosError, AxiosResponse } from "axios"

interface ErrorResponse {
  error: string;
}

interface AuthContextType {
  token: string | null
  isLoggedIn: boolean
  login: (token: string) => void
  logout: () => void
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
    setLoading(false); // mark as ready after checking localStorage
  }, []);

  // Add axios interceptor to handle token expiration
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError<ErrorResponse>) => {
        if (error.response?.status === 403 && error.response?.data?.error === 'Invalid or expired token') {
          // Clear token and redirect to login
          localStorage.removeItem("token");
          setToken(null);
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, isLoggedIn: !!token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
