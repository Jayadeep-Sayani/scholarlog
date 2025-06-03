import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { useToast } from "../hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "../lib/utils"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

export default function Settings() {
    const [gpaScale, setGpaScale] = useState<string>("UVic 9.0 Scale")
    const [loading, setLoading] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [open, setOpen] = useState(false)
    const { token } = useAuth()
    const { toast } = useToast()

    const scales = [
        { value: "UVic 9.0 Scale", label: "UVic 9.0 Scale" },
        { value: "Camosun 9.0 Scale", label: "Camosun 9.0 Scale" },
        { value: "UBC 4.33 Scale", label: "UBC 4.33 Scale" },
        { value: "UBCO 4.33 Scale", label: "UBCO 4.33 Scale" },
    ]

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
                                        <Select
                                            value={gpaScale}
                                            onValueChange={setGpaScale}
                                        >
                                            <SelectTrigger id="gpa-scale" className="w-full bg-white border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                                <SelectValue placeholder="Select GPA scale" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border border-gray-200 shadow-lg">
                                                <SelectItem value="UVic 9.0 Scale" className="hover:bg-gray-100 cursor-pointer focus:bg-gray-100">
                                                    UVic 9.0 Scale
                                                </SelectItem>
                                                <SelectItem value="Camosun 9.0 Scale" className="hover:bg-gray-100 cursor-pointer focus:bg-gray-100">
                                                    Camosun 9.0 Scale
                                                </SelectItem>
                                                <SelectItem value="UBC 4.33 Scale" className="hover:bg-gray-100 cursor-pointer focus:bg-gray-100">
                                                    UBC 4.33 Scale
                                                </SelectItem>
                                                <SelectItem value="UBCO 4.33 Scale" className="hover:bg-gray-100 cursor-pointer focus:bg-gray-100">
                                                    UBCO 4.33 Scale
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
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