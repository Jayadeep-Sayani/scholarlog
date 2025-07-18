import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { useState } from "react"
import axios from "axios"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [userId, setUserId] = useState<number | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      window.location.href = "/dashboard"
    }
  }, [token])

  const handleRegister = async () => {
    setError("")
    setSuccess("")

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      const res = await axios.post("https://scholarlog-api.onrender.com/api/auth/register", {
        email,
        password,
      })

      setUserId(res.data.userId)
      setIsVerifying(true)
      setSuccess("Verification code sent to your email!")
    } catch (err) {
      setError("Registration failed. Email may already be in use.")
    }
  }

  const handleVerification = async () => {
    setError("")
    setSuccess("")

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
    <div className="min-h-screen bg-white bg-[radial-gradient(circle_at_1px_1px,_#e5e7eb_1px,_transparent_0)] [background-size:16px_16px]">
      <div className="flex flex-col gap-10 justify-center items-center min-h-screen">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
          ScholarLog
        </h1>
        <Card className="w-full max-w-md p-4 bg-white">
          <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold mt-3 mb-5">
              {isVerifying ? "Verify Your Email" : "Register"}
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
                <div>
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}
                <Button className="w-full" onClick={handleRegister}>Register</Button>
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
                {success && <p className="text-green-500 text-sm">{success}</p>}
                <Button className="w-full" onClick={handleVerification}>Verify Email</Button>
              </>
            )}
            
            <div className="text-sm text-center mt-4">
              {!isVerifying ? (
                <>
                  Already have an account?{" "}
                  <a href="/login" className="text-blue-600 hover:underline">
                    Login
                  </a>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Check your email for the verification code
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
