'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Camera } from 'lucide-react'
import CameraCapture from './components/CameraCapture'
import AlternativeMedicines from './components/AlternativeMedicines'

export default function Home() {
  const [currentMedicine, setCurrentMedicine] = useState<string | null>(null)
  const [inputMedicine, setInputMedicine] = useState('')
  const [showCamera, setShowCamera] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleCameraCapture = async (imageData: string) => {
    setShowCamera(false)
    toast({
      title: "Image captured",
      description: "Processing prescription image...",
    })
    
    // In a real application, you would send this image to your backend for processing
    // For now, we'll simulate the response
    setTimeout(() => {
      const simulatedMedicine = 'Paracetamol'
      setCurrentMedicine(simulatedMedicine)
      toast({
        title: "Image Processed",
        description: `Detected medicine: ${simulatedMedicine}`,
      })
    }, 2000) // Simulate a 2-second processing time
  }

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMedicine.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a medicine name",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/alternatives?medicine=${encodeURIComponent(inputMedicine)}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 504) {
          throw new Error("Database connection timeout. Please try again later.")
        }
        throw new Error(data.error || "Failed to fetch alternatives")
      }

      setCurrentMedicine(inputMedicine)
      setInputMedicine('')
      toast({
        title: "Success",
        description: "Medicine added successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add medicine",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Medicine Alternatives Finder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Button onClick={() => setShowCamera(true)}>
              <Camera className="mr-2 h-4 w-4" />
              Open Camera
            </Button>
            {showCamera && (
              <CameraCapture 
                onCapture={handleCameraCapture} 
                onClose={() => setShowCamera(false)}
              />
            )}
            <form onSubmit={handleInputSubmit} className="flex space-x-2">
              <Input
                type="text"
                value={inputMedicine}
                onChange={(e) => setInputMedicine(e.target.value)}
                placeholder="Enter medicine name"
                disabled={isSubmitting}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add'
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
      {currentMedicine && <AlternativeMedicines medicine={currentMedicine} />}
    </main>
  )
}

