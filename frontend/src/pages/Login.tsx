import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [userId, setUserId] = useState<number | null>(null)
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      window.location.href = "/dashboard"
    }
  }, [token])

  const handleLogin = async () => {
    setError("")
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    try {
      const res = await axios.post("https://scholarlog-api.onrender.com/api/auth/login", {
        email,
        password,
      })
      localStorage.setItem("token", res.data.token)
      
      if (!res.data.isVerified) {
        setUserId(res.data.userId)
        setIsVerifying(true)
        setError("Please verify your email to continue")
      } else {
        window.location.href = "/dashboard"
      }
    } catch (err: any) {
      setError("Invalid credentials")
    }
  }

  const handleVerification = async () => {
    setError("")
    try {
      const res = await axios.post("https://scholarlog-api.onrender.com/api/auth/verify", {
        userId,
        code: verificationCode,
      })
      localStorage.setItem("token", res.data.token)
      navigate("/dashboard")
    } catch (err) {
      setError("Invalid verification code")
    }
  }

  return (
    <div className="flex flex-col gap-10 justify-center items-center min-h-screen bg-white bg-[radial-gradient(circle_at_1px_1px,_#e5e7eb_1px,_transparent_0)] [background-size:16px_16px]">
      <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
        ScholarLog
      </h1>
      <Card className="w-full max-w-md p-4 bg-white">
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold mt-3 mb-5">
            {isVerifying ? "Verify Your Email" : "Login"}
          </h2>
          
          {!isVerifying ? (
            <>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button className="w-full" onClick={handleLogin}>Login</Button>
              <div className="text-sm text-center mt-4">
                New here?{" "}
                <a href="/register" className="text-blue-600 hover:underline">
                  Create Account
                </a>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="code">Verification Code</Label>
                <Input 
                  id="code" 
                  type="text" 
                  placeholder="Enter the 6-digit code sent to your email"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button className="w-full" onClick={handleVerification}>Verify Email</Button>
              <p className="text-muted-foreground text-sm text-center">
                Check your email for the verification code
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
