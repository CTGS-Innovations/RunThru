/**
 * Dialogue Audio Proxy Route
 * Proxies dialogue audio requests to the backend server
 * Dialogue audio is stored at script-level (not session-level)
 * Enables Cloudflare Tunnel compatibility (no hardcoded localhost URLs)
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ scriptId: string; filename: string }> }
) {
  const { scriptId, filename } = await params;

  try {
    // Fetch audio from backend (script-level path)
    const backendUrl = `${BACKEND_URL}/audio/${scriptId}/dialogue/${filename}`;
    const response = await fetch(backendUrl);

    if (!response.ok) {
      console.error(`Failed to fetch dialogue audio: ${backendUrl} (${response.status})`);
      return new NextResponse('Audio file not found', { status: 404 });
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer();

    // Return with appropriate headers
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'public, max-age=3600, must-revalidate',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Error proxying dialogue audio:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
