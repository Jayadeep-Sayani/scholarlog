import { useState } from "react"
import Sidebar from "../components/Sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Button } from "../components/ui/button"
import { useToast } from "../hooks/use-toast"

export default function Settings() {
  const [gpaScale, setGpaScale] = useState("uvic9")
  const { toast } = useToast()

  const handleSaveSettings = () => {
    // In the future, this would save the selected GPA scale to the user's settings
    // For now, we'll just show a toast notification
    toast({
      title: "Settings saved",
      description: "Your GPA scale preference has been saved.",
    })
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
                    <SelectItem value="uvic9">UVic 9.0 Scale</SelectItem>
                    {/* Future scales can be added here */}
                    {/* <SelectItem value="standard4">Standard 4.0 Scale</SelectItem> */}
                    {/* <SelectItem value="scale10">10.0 Scale</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Sidebar>
  )
}