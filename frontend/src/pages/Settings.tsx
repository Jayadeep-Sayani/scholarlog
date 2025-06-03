import { useState } from "react"
import Sidebar from "../components/Sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { useToast } from "../hooks/use-toast"
import { SelectWithSearch } from "../components/ui/select-with-search"

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
                <SelectWithSearch
                  options={[
                    { label: "UVic 9.0 Scale", value: "uvic9" },
                    // Future scales can be uncommented when ready
                    // { label: "Standard 4.0 Scale", value: "standard4" },
                    // { label: "10.0 Scale", value: "scale10" },
                  ]}
                  value={gpaScale}
                  onValueChange={setGpaScale}
                  placeholder="Select GPA scale"
                  searchPlaceholder="Search GPA scales..."
                  triggerClassName="mt-2"
                />
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