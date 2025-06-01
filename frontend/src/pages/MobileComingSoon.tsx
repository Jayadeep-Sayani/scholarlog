import { Button } from "../components/ui/button"
import { Link } from "react-router-dom"

export default function MobileComingSoon() {
  return (
    <div className="min-h-screen bg-white bg-[radial-gradient(circle_at_1px_1px,_#e5e7eb_1px,_transparent_0)] [background-size:16px_16px] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
        ScholarLog
      </h1>
      <div className="max-w-sm space-y-6">
        <p className="text-xl text-gray-600">
          Our mobile app is coming soon! For now, please visit us on your desktop for the best experience.
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            We're working hard to bring you the full ScholarLog experience on mobile devices.
          </p>
          <div className="flex flex-col gap-3">
            <a href="https://scholarlog.vercel.app" target="_blank" rel="noopener noreferrer">
              <Button className="w-full">
                Visit Desktop Site
              </Button>
            </a>
            <a href="mailto:support@scholarlog.com">
              <Button className="w-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-100">
                Contact Us
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 