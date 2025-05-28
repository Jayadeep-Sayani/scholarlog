import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { useEffect, useState } from "react"
import axios from "axios"


export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const token = localStorage.getItem("token")
  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (token) {
      window.location.href = "/dashboard"
    }
  }, [token])

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        email,
        password,
      })
      localStorage.setItem("token", res.data.token)
      window.location.href = "/dashboard" // Redirect to dashboard on success
    } catch (err) {
      setError("Invalid credentials")
    }
  }

  return (
    <div className="flex flex-col gap-10 justify-center items-center min-h-screen  bg-white bg-[radial-gradient(circle_at_1px_1px,_#e5e7eb_1px,_transparent_0)] [background-size:16px_16px]">
      <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
          ScholarLog
        </h1>
      <Card className="w-full max-w-md p-4 bg-white">
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold mt-3 mb-5">Login</h2>
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
        </CardContent>
      </Card>
    </div>
  )
}
