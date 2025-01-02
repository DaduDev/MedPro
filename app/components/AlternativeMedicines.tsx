'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'

interface Medicine {
  name: string
  alternatives: string[]
  generic_name?: string
  composition?: string
}

interface AlternativeMedicinesProps {
  medicine: string
}

export default function AlternativeMedicines({ medicine }: AlternativeMedicinesProps) {
  const [alternativeData, setAlternativeData] = useState<Medicine | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAlternatives = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/alternatives?medicine=${encodeURIComponent(medicine)}`)
        if (!response.ok) {
          throw new Error(`Error fetching alternatives for ${medicine}`)
        }
        const data = await response.json()
        setAlternativeData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch alternatives')
        console.error('Error fetching alternatives:', err)
      } finally {
        setLoading(false)
      }
    }

    if (medicine) {
      fetchAlternatives()
    }
  }, [medicine])

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Finding alternatives...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!alternativeData) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{alternativeData.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {alternativeData.generic_name && (
          <p className="mb-2"><strong>Generic Name:</strong> {alternativeData.generic_name}</p>
        )}
        {alternativeData.composition && (
          <p className="mb-2"><strong>Composition:</strong> {alternativeData.composition}</p>
        )}
        <h3 className="font-semibold mb-2">Alternatives:</h3>
        {alternativeData.alternatives.length > 0 ? (
          <ul className="list-disc pl-5">
            {alternativeData.alternatives.map((alt, i) => (
              <li key={i}>{alt}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No alternatives found</p>
        )}
      </CardContent>
    </Card>
  )
}

