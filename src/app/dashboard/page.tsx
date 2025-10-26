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
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex gap-2 justify-center">
            <span>Backend: http://localhost:4000</span>
            <span>•</span>
            <span>Frontend: http://localhost:3000</span>
          </div>
          <div className="flex gap-2 justify-center items-center">
            <span className="text-green-500 font-semibold">MVP Phase 1: 78% Complete</span>
            <span>•</span>
            <span>Sprints 1-7: ✅</span>
            <span>•</span>
            <span>Sprint 6B: In Progress</span>
          </div>
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
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Sprint 3: Role Selection & Voice Assignment
                </CardTitle>
                <CardDescription>Character selection, voice presets, customization</CardDescription>
              </div>
              <span className="text-sm font-medium text-green-500">100% Complete</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>✅ CharacterCard component (video game style)</div>
              <div>✅ Voice preset system (8 presets)</div>
              <div>✅ Voice customization sliders (gender/emotion/age)</div>
              <div>✅ SessionSetup page (gaming/quest aesthetic)</div>
              <div>✅ Random voice assignment + shuffle</div>
            </div>
          </CardContent>
        </Card>

        {/* Sprint 4 */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Sprint 4: OpenAI Script Analysis & Character Portraits
                </CardTitle>
                <CardDescription>AI-powered metadata extraction + DALL-E portrait generation</CardDescription>
              </div>
              <span className="text-sm font-medium text-green-500">100% Complete</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>✅ ScriptAnalysisService (GPT-4o-mini, ~$0.009/script)</div>
              <div>✅ CharacterPortraitService (DALL-E, $0.04/portrait)</div>
              <div>✅ Portrait metadata (JSON sidecars for reuse)</div>
              <div>✅ Character cards with AI portraits & taglines</div>
              <div>✅ Role badges (Lead/Featured/Ensemble)</div>
            </div>
          </CardContent>
        </Card>

        {/* Sprint 5 */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Sprint 5: Multiplayer Lobbies & Security
                </CardTitle>
                <CardDescription>PIN authentication + shareable lobby links + multiplayer character selection</CardDescription>
              </div>
              <span className="text-sm font-medium text-green-500">100% Complete</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>✅ 6-digit PIN authentication with rate limiting</div>
              <div>✅ Shareable lobby links (UUID-based, 4-hour expiry)</div>
              <div>✅ Real-time participant sync (polling every 2s)</div>
              <div>✅ Character locking (first-come-first-served)</div>
              <div>✅ Auto-redirect when host starts rehearsal</div>
              <div>✅ Cloudflare Tunnel compatibility (no hardcoded URLs)</div>
            </div>
          </CardContent>
        </Card>

        {/* Sprint 6A */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Sprint 6A: Synchronized Multiplayer Rehearsal
                </CardTitle>
                <CardDescription>Real-time playback sync + character card audio (Chatterbox TTS)</CardDescription>
              </div>
              <span className="text-sm font-medium text-green-500">100% Complete</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>✅ ChatterboxAdapter with voice cloning (GPU-accelerated)</div>
              <div>✅ Character catchphrase audio generation (~1.1s per character)</div>
              <div>✅ PlaybackService (sync all browsers to same line)</div>
              <div>✅ Real-time polling (500ms) for playback state</div>
              <div>✅ Audio auto-play for AI lines + auto-advance</div>
              <div>✅ Visual feedback (gold pulsing when user turn)</div>
            </div>
          </CardContent>
        </Card>

        {/* Sprint 7 */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Sprint 7: Rehearsal Playback UI
                </CardTitle>
                <CardDescription>Scene-based rehearsal with sticky headers and character portraits</CardDescription>
              </div>
              <span className="text-sm font-medium text-green-500">100% Complete</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>✅ Scene-based sticky headers (purple/cyan gradient)</div>
              <div>✅ Character portrait integration (60x60 rounded squares)</div>
              <div>✅ Hidden scrollbars (clean UI while maintaining scroll)</div>
              <div>✅ Scene grouping logic with character badges</div>
              <div>✅ "YOU" badge for selected character highlight</div>
              <div>✅ Mobile-first responsive design</div>
            </div>
          </CardContent>
        </Card>

        {/* Sprint 6B */}
        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="w-5 h-5 text-muted-foreground" />
                  Sprint 6B: Full Dialogue Audio Generation
                </CardTitle>
                <CardDescription>Batch TTS for all lines, voice assignment mapping, audio cache</CardDescription>
              </div>
              <span className="text-sm font-medium text-muted-foreground">Not Started</span>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* API Status */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Backend API Endpoints (Sprint 1-7)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono">
            {/* Scripts */}
            <div className="text-cyan-400">GET /api/scripts</div>
            <div className="text-cyan-400">POST /api/scripts</div>
            <div className="text-cyan-400">GET /api/scripts/:id</div>
            <div className="text-cyan-400">DELETE /api/scripts/:id</div>
            <div className="text-cyan-400">POST /api/scripts/:id/generate-card-audio</div>

            {/* Voice Presets */}
            <div className="text-purple-400">GET /api/voices</div>

            {/* Sessions */}
            <div className="text-green-400">POST /api/sessions</div>
            <div className="text-green-400">GET /api/sessions/:id</div>
            <div className="text-green-400">GET /api/sessions/:id/config</div>
            <div className="text-green-400">GET /api/sessions/:id/playback</div>
            <div className="text-green-400">POST /api/sessions/:id/advance</div>
            <div className="text-green-400">POST /api/sessions/:id/shuffle</div>
            <div className="text-green-400">PUT /api/sessions/:id/voice</div>

            {/* Lobbies (Multiplayer) */}
            <div className="text-amber-400">POST /api/auth/verify</div>
            <div className="text-amber-400">POST /api/lobbies/create</div>
            <div className="text-amber-400">POST /api/lobbies/:token/join</div>
            <div className="text-amber-400">GET /api/lobbies/:token/participants</div>
            <div className="text-amber-400">PUT /api/lobbies/:token/select</div>
            <div className="text-amber-400">POST /api/lobbies/:token/start</div>

            {/* Static Assets */}
            <div className="text-magenta-400">GET /portraits/:scriptId/*.webp</div>
            <div className="text-magenta-400">GET /audio/:sessionId/character-cards/*.wav</div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground space-y-1">
            <div><span className="text-cyan-400">■</span> Scripts &amp; Upload</div>
            <div><span className="text-purple-400">■</span> Voice Presets</div>
            <div><span className="text-green-400">■</span> Sessions &amp; Playback</div>
            <div><span className="text-amber-400">■</span> Lobbies &amp; Auth</div>
            <div><span className="text-magenta-400">■</span> Static Assets</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
