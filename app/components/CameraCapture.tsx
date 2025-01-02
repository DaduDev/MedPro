'use client'

import { useRef, useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Camera, CameraIcon as FlipCamera, X } from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
  onClose: () => void
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: facingMode }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsStreaming(true)
      }
    } catch (err) {
      console.error("Error accessing the camera", err)
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Unable to access the camera. Please check your permissions.",
      })
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      setIsStreaming(false)
    }
  }, [])

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
        const imageData = canvasRef.current.toDataURL('image/jpeg')
        onCapture(imageData)
        stopCamera()
      }
    }
  }, [onCapture, stopCamera])

  const toggleCamera = useCallback(() => {
    stopCamera()
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user')
  }, [stopCamera])

  const handleClose = useCallback(() => {
    stopCamera()
    onClose()
  }, [stopCamera, onClose])

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-2 right-2 z-10"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="aspect-video relative overflow-hidden rounded-lg">
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover"
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="mt-4 flex justify-center space-x-4">
          {!isStreaming ? (
            <Button onClick={startCamera}>
              <Camera className="mr-2 h-4 w-4" />
              Start Camera
            </Button>
          ) : (
            <>
              <Button onClick={captureImage}>
                <Camera className="mr-2 h-4 w-4" />
                Capture
              </Button>
              <Button onClick={toggleCamera}>
                <FlipCamera className="mr-2 h-4 w-4" />
                Flip Camera
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

