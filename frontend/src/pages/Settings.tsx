import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import { Button } from "../components/ui/button"
import { useToast } from "../hooks/use-toast"

export default function Settings() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-10">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Account</h2>
              <Button onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  )
} 