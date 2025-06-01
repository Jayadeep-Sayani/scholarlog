import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function Verify() {
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleVerification = async () => {
    setError("")
    try {
      const res = await axios.post("https://scholarlog-api.onrender.com/api/auth/verify", {
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
            Verify Your Email
          </h2>
          
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
        </CardContent>
      </Card>
    </div>
  )
} 