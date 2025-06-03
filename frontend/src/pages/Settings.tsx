import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { useToast } from "../hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

export default function Settings() {
    const [gpaScale, setGpaScale] = useState<string>("UVic 9.0 Scale")
    const [loading, setLoading] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const { token } = useAuth()
    const { toast } = useToast()

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
            const scaleValue = gpaScale === "UBC 4.33 Scale" ? 4.0 : 9.0

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
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Settings</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>GPA Scale</CardTitle>
                        <CardDescription>
                            Choose your preferred GPA scale for calculations and display.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
                                <span className="ml-2">Loading settings...</span>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="col-span-4 sm:col-span-2">
                                        <label htmlFor="gpa-scale" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            GPA Scale
                                        </label>
                                        <Select
                                            value={gpaScale}
                                            onValueChange={setGpaScale}
                                        >
                                            <SelectTrigger id="gpa-scale" className="mt-2">
                                                <SelectValue placeholder="Select GPA scale" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UVic 9.0 Scale">UVic 9.0 Scale</SelectItem>
                                                <SelectItem value="UBC 4.33 Scale">UBC 4.33 Scale</SelectItem>
                                                {/* Future scales can be added here */}
                                                {/* <SelectItem value="standard4">Standard 4.0 Scale</SelectItem> */}
                                                {/* <SelectItem value="scale10">10.0 Scale</SelectItem> */}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={handleSaveSettings} disabled={loading}>
                                        {loading ? "Saving..." : "Save"}
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