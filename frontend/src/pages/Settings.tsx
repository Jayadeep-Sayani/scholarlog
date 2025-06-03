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
            <div className="p-6 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Settings</h1>
                        <p className="text-muted-foreground mt-1">Customize your ScholarLog experience</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card className="border-2 border-border/50 hover:border-primary/50 transition-colors duration-200">
                        <CardHeader className="space-y-3">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                    <path d="M12 20v-6M6 20V10M18 20V4"/>
                                </svg>
                                GPA Scale
                            </CardTitle>
                            <CardDescription className="text-base">
                                Choose your preferred GPA scale for calculations and display. This will affect how your grades are calculated and displayed throughout the application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                    <span className="ml-3 text-muted-foreground">Loading settings...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="gpa-scale" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                Select Your Institution's GPA Scale
                                            </label>
                                            <Select
                                                value={gpaScale}
                                                onValueChange={setGpaScale}
                                            >
                                                <SelectTrigger id="gpa-scale" className="w-full h-12">
                                                    <SelectValue placeholder="Select GPA scale" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="UVic 9.0 Scale">UVic 9.0 Scale</SelectItem>
                                                    <SelectItem value="Camosun 9.0 Scale">Camosun 9.0 Scale</SelectItem>
                                                    <SelectItem value="UBC 4.33 Scale">UBC 4.33 Scale</SelectItem>
                                                    <SelectItem value="UBCO 4.33 Scale">UBCO 4.33 Scale</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t">
                                        <Button 
                                            onClick={handleSaveSettings} 
                                            disabled={loading}
                                            className="min-w-[120px] h-10 bg-primary hover:bg-primary/90"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2"></div>
                                                    Saving...
                                                </>
                                            ) : (
                                                "Save Changes"
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Sidebar>
    )
}