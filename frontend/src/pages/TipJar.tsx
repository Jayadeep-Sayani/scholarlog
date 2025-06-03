import { Button } from "../components/ui/button"
import Sidebar from "../components/Sidebar"
import { Coffee } from "lucide-react"

export default function TipJar() {
  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Tip Jar</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              If you find ScholarLog helpful and want to support its development, consider buying me a coffee. Every contribution helps keep the project going!
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg text-blue-600">
                <Coffee className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold">Buy me a coffee</h3>
                <p className="text-muted-foreground">Support my work with a small donation</p>
              </div>
            </div>
            <Button
              onClick={() => window.open("https://coff.ee/jayadeeps10", '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
            >
              Donate
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold mb-4">Why Support ScholarLog?</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                ScholarLog is a passion project created to help students better manage their academic journey. Your support helps me:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Maintain and improve the existing features</li>
                <li>Add new features and functionality</li>
                <li>Keep the service running smoothly</li>
                <li>Cover hosting and development costs</li>
              </ul>
              <p className="mt-4">
                Every donation, no matter the size, makes a difference and is greatly appreciated!
              </p>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  )
} 