import { Button } from "../components/ui/button"
import Sidebar from "../components/Sidebar"
import { Coffee, Heart, Star, Sparkles } from "lucide-react"

export default function TipJar() {
  const donationOptions = [
    {
      title: "Buy me a coffee",
      description: "Support my work with a small donation",
      icon: <Coffee className="w-6 h-6" />,
      amount: 5,
      link: "coff.ee/jayadeeps10"
    },
    {
      title: "Show some love",
      description: "A medium-sized donation to keep me motivated",
      icon: <Heart className="w-6 h-6" />,
      amount: 10,
      link: "coff.ee/jayadeeps10"
    },
    {
      title: "Super supporter",
      description: "A generous donation that makes a big difference",
      icon: <Star className="w-6 h-6" />,
      amount: 25,
      link: "coff.ee/jayadeeps10"
    },
    {
      title: "Premium patron",
      description: "The ultimate show of support for my work",
      icon: <Sparkles className="w-6 h-6" />,
      amount: 50,
      link: "coff.ee/jayadeeps10"
    }
  ]

  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Tip Jar</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              If you find ScholarLog helpful and want to support its development, consider buying me a coffee or making a donation. Every contribution helps keep the project going!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {donationOptions.map((option, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">${option.amount}</span>
                  <Button
                    onClick={() => window.open(option.link, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Donate
                  </Button>
                </div>
              </div>
            ))}
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