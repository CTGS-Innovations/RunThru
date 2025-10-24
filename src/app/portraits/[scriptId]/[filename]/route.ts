import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000'

export async function GET(
  request: NextRequest,
  { params }: { params: { scriptId: string; filename: string } }
) {
  const { scriptId, filename } = params
  const url = `${BACKEND_URL}/portraits/${scriptId}/${filename}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 })
    }

    const imageBuffer = await response.arrayBuffer()

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Portrait Proxy Error:', error)
    return new NextResponse('Failed to fetch portrait', { status: 500 })
  }
}
