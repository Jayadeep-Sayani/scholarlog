import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { useToast } from "../hooks/use-toast"
import { Input } from "../components/ui/input"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import { ChevronDown, X } from "lucide-react"

export default function Settings() {
    const [gpaScale, setGpaScale] = useState<string>("UVic 9.0 Scale")
    const [loading, setLoading] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [searchQuery, setSearchQuery] = useState<string>("")
    const { token } = useAuth()
    const { toast } = useToast()

    const scales = [
        "UVic 9.0 Scale",
        "Camosun 9.0 Scale",
        "UBC 4.33 Scale",
        "UBCO 4.33 Scale"
    ]

    const filteredScales = scales.filter(scale => 
        scale.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (!target.closest('.custom-select')) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Fetch user settings when component mounts
    useEffect(() => {
        if (!token) return

        const fetchUserSettings = async () => {
            try {
                setIsLoading(true)
                const response = await axios.get(
                    "https://scholarlog-api.onrender.com/api/user/settings",
                    { headers: { Authorization: `Bearer ${token}` } }
                )

                // Set the GPA scale based on the user's preference
                if (response.data.user && response.data.user.gpaScale) {
                    const scaleValue = response.data.user.gpaScale
                    setGpaScale(scaleValue === 4.0 ? "UBC 4.33 Scale" : "UVic 9.0 Scale")
                }
            } catch (error) {
                console.error("Failed to fetch user settings:", error)
                toast({
                    title: "Error",
                    description: "Failed to load your settings. Using defaults.",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchUserSettings()
    }, [token, toast])

    const handleSaveSettings = async () => {
        try {
            setLoading(true)

            // Determine the numeric scale value based on the selected option
            const scaleValue = gpaScale === "UBC 4.33 Scale" || gpaScale === "UBCO 4.33 Scale" ? 4.0 : 9.0

            // Make API call to update user settings
            await axios.post(
                "https://scholarlog-api.onrender.com/api/user/settings",
                { gpaScale: scaleValue },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            toast({
                title: "Settings saved",
                description: "Your GPA scale preference has been updated successfully.",
            })
        } catch (error) {
            console.error("Failed to save settings:", error)
            toast({
                title: "Error",
                description: "Failed to save settings. Please try again.",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Sidebar>
            <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

                <Card className="bg-white shadow-md">
                    <CardHeader className="border-b border-gray-200">
                        <CardTitle className="text-xl text-gray-900">GPA Scale</CardTitle>
                        <CardDescription className="text-gray-600">
                            Choose your preferred GPA scale for calculations and display.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-900 border-t-transparent"></div>
                                <span className="ml-3 text-gray-700">Loading settings...</span>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="col-span-4 sm:col-span-2">
                                        <label htmlFor="gpa-scale" className="text-sm font-medium text-gray-700 block mb-2">
                                            GPA Scale
                                        </label>
                                        <div className="custom-select relative">
                                            <div 
                                                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 flex items-center justify-between cursor-pointer hover:border-gray-400"
                                                onClick={() => setIsOpen(!isOpen)}
                                            >
                                                <span>{gpaScale}</span>
                                                <ChevronDown className="h-4 w-4 text-gray-500" />
                                            </div>
                                            
                                            {isOpen && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                                    <div className="p-2 border-b border-gray-200">
                                                        <Input
                                                            type="text"
                                                            placeholder="Search scales..."
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            className="w-full"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                    <div className="max-h-60 overflow-auto">
                                                        {filteredScales.length > 0 ? (
                                                            filteredScales.map((scale) => (
                                                                <div
                                                                    key={scale}
                                                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                                    onClick={() => {
                                                                        setGpaScale(scale)
                                                                        setIsOpen(false)
                                                                        setSearchQuery("")
                                                                    }}
                                                                >
                                                                    {scale}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="px-3 py-2 text-gray-500">
                                                                No scales found
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button 
                                        onClick={handleSaveSettings} 
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                                    >
                                        {loading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Sidebar>
    )
}