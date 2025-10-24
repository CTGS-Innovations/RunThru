import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ scriptId: string; filename: string }> }
) {
  const resolvedParams = await params
  const { scriptId, filename } = resolvedParams
  const url = `${BACKEND_URL}/audio/${scriptId}/character-cards/${filename}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      return new NextResponse('Audio not found', { status: 404 })
    }

    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'audio/wav',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Audio Proxy Error:', error)
    return new NextResponse('Failed to fetch audio', { status: 500 })
  }
}
