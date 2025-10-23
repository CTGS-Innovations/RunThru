'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Construction, Home } from 'lucide-react'

export default function RehearsalPage() {
  const params = useParams()
  const sessionId = params.sessionId as string

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Card className="border-amber-500/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Construction className="w-16 h-16 text-amber-500" />
          </div>
          <CardTitle className="text-3xl">Sprint 5: Coming Soon</CardTitle>
          <CardDescription className="text-base mt-4">
            Rehearsal Playback (Line-by-Line Audio Player)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">What's Next:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ <strong>Sprint 1</strong>: Infrastructure Setup - Complete</li>
              <li>✅ <strong>Sprint 2</strong>: Script Upload & Parsing - Complete</li>
              <li>✅ <strong>Sprint 3</strong>: Role Selection & Voice Assignment - Complete</li>
              <li>🔄 <strong>Sprint 4</strong>: Audio Generation & Caching - Not Started</li>
              <li>⏸️ <strong>Sprint 5</strong>: Rehearsal Playback - Not Started</li>
            </ul>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <p className="text-sm text-center text-muted-foreground">
              Session ID: <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{sessionId}</code>
            </p>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Your voice assignments are saved and ready for Sprint 4!
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/scripts" className="flex-1">
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black">
                Try Another Script
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Sprint 3 Testing Complete! ✅</p>
        <p className="mt-2">You successfully:</p>
        <ul className="mt-2 space-y-1">
          <li>✓ Selected a character</li>
          <li>✓ Created a session with random voice assignments</li>
          <li>✓ Customized voices (if you tried the sliders)</li>
        </ul>
      </div>
    </div>
  )
}
