'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Circle, Upload, Users, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent">
          RunThru
        </h1>
        <p className="text-xl text-muted-foreground">
          Development Testing Dashboard
        </p>
        <div className="flex gap-2 justify-center text-sm text-muted-foreground">
          <span>Backend: http://localhost:4000</span>
          <span>•</span>
          <span>Frontend: http://localhost:3000</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <Link href="/scripts">
          <Button size="lg" className="w-full h-20 text-lg" variant="default">
            <Users className="w-6 h-6 mr-2" />
            Script Library
          </Button>
        </Link>
        <Link href="/scripts">
          <Button size="lg" className="w-full h-20 text-lg" variant="outline">
            <Upload className="w-6 h-6 mr-2" />
            Upload Script
          </Button>
        </Link>
      </div>

      {/* Sprint Status */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-6">Sprint Progress</h2>

        {/* Sprint 1 */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Sprint 1: Infrastructure Setup
                </CardTitle>
                <CardDescription>Git worktrees, scaffolding, TTS validation</CardDescription>
              </div>
              <span className="text-sm font-medium text-green-500">100% Complete</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>✅ Backend API scaffold (Node.js + TypeScript)</div>
              <div>✅ Frontend scaffold (Next.js 15 + shadcn/ui)</div>
              <div>✅ TTS service scaffold (Python + FastAPI)</div>
              <div>✅ GPU validation (RTX 3090 operational)</div>
            </div>
          </CardContent>
        </Card>

        {/* Sprint 2 */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Sprint 2: Script Upload
                </CardTitle>
                <CardDescription>Upload markdown scripts, parse to JSON, store in SQLite</CardDescription>
              </div>
              <span className="text-sm font-medium text-green-500">100% Complete</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>✅ ScriptUploader component (drag-and-drop)</div>
              <div>✅ Script parser (428 lines, 11 characters detected)</div>
              <div>✅ Script library page</div>
              <div>✅ Script detail page</div>
            </div>
            <div className="mt-4">
              <Link href="/scripts">
                <Button variant="outline" size="sm">View Script Library →</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Sprint 3 */}
        <Card className="border-amber-500/50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Sprint 3: Role Selection & Voice Assignment
                </CardTitle>
                <CardDescription>Character selection, voice presets, customization</CardDescription>
              </div>
              <span className="text-sm font-medium text-amber-500">🔍 Testing Now</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1 mb-4">
              <div>✅ CharacterCard component (video game style)</div>
              <div>✅ Voice preset system (8 presets)</div>
              <div>✅ Voice customization sliders (gender/emotion/age)</div>
              <div>✅ SessionSetup page</div>
              <div>✅ Random voice assignment + shuffle</div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 space-y-3">
              <p className="font-medium text-amber-500">Test Instructions:</p>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Go to Script Library and select a script</li>
                <li>Click "Select Your Character" button</li>
                <li>Click a character card to create a session</li>
                <li>Customize voices with sliders</li>
                <li>Try the "Shuffle Voices" button</li>
              </ol>
              <Link href="/scripts">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold mt-2">
                  Start Testing Sprint 3 →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Sprint 4 */}
        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="w-5 h-5 text-muted-foreground" />
                  Sprint 4: Audio Generation & Caching
                </CardTitle>
                <CardDescription>Batch TTS generation, audio cache, progress UI</CardDescription>
              </div>
              <span className="text-sm font-medium text-muted-foreground">Not Started</span>
            </div>
          </CardHeader>
        </Card>

        {/* Sprint 5 */}
        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="w-5 h-5 text-muted-foreground" />
                  Sprint 5: Rehearsal Playback
                </CardTitle>
                <CardDescription>Line-by-line playback, audio player, navigation</CardDescription>
              </div>
              <span className="text-sm font-medium text-muted-foreground">Not Started</span>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* API Status */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Backend API Endpoints (Sprint 3)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono">
            <div>GET /api/voices</div>
            <div>POST /api/sessions</div>
            <div>GET /api/sessions/:id</div>
            <div>POST /api/sessions/:id/shuffle</div>
            <div>PUT /api/sessions/:id/voice</div>
            <div>GET /api/scripts</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
