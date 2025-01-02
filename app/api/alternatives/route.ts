import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('MONGODB_URI is not defined')
}

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000, // 5 seconds timeout
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const medicine = searchParams.get('medicine')

  if (!medicine) {
    return NextResponse.json({ error: 'Medicine name is required' }, { status: 400 })
  }

  try {
    await client.connect()
    const database = client.db('MedicineDatabase')
    const collection = database.collection('medicines')

    const result = await collection.findOne({ 
      name: { $regex: new RegExp('^' + medicine + '$', 'i') }
    })

    if (result) {
      return NextResponse.json({
        name: result.name,
        alternatives: result.alternatives,
        generic_name: result.generic_name,
        composition: result.composition
      })
    } else {
      // Try a partial match if exact match fails
      const partialMatch = await collection.findOne({
        name: { $regex: new RegExp(medicine, 'i') }
      })

      if (partialMatch) {
        return NextResponse.json({
          name: partialMatch.name,
          alternatives: partialMatch.alternatives,
          generic_name: partialMatch.generic_name,
          composition: partialMatch.composition
        })
      }

      return NextResponse.json({ 
        name: medicine, 
        alternatives: [],
        message: 'No alternatives found for this medicine'
      })
    }
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error)
    if ((error as Error).name === 'MongoServerSelectionError') {
      return NextResponse.json(
        { error: 'Database connection timeout. Please try again later.' }, 
        { status: 504 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch alternatives. Please try again later.' }, 
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

