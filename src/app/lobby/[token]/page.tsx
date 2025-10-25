'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sparkles, Users, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CharacterCard } from '@/components/session/CharacterCard'
import { LobbyStatus } from '@/components/session/LobbyStatus'
import {
  useJoinLobby,
  useLobbyParticipants,
  useSelectCharacter,
  useStartRehearsal,
  useLobbyInfo,
} from '@/hooks/useLobbies'
import { useScript } from '@/hooks/useScripts'
import { cn } from '@/lib/utils'

type Phase = 'name' | 'character-select' | 'waiting'

export default function LobbyJoinPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [phase, setPhase] = useState<Phase>('name')
  const [playerName, setPlayerName] = useState('')
  const [participantId, setParticipantId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // API hooks
  const lobbyInfo = useLobbyInfo(token)
  const participants = useLobbyParticipants(token, phase !== 'name')
  const script = useScript(lobbyInfo.data?.scriptId || '')
  const joinLobby = useJoinLobby()
  const selectCharacter = useSelectCharacter()
  const startRehearsal = useStartRehearsal()

  // Load saved player info from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('runthru_player_name')
    const savedToken = localStorage.getItem('runthru_lobby_token')
    const savedParticipantId = localStorage.getItem('runthru_participant_id')

    if (savedName && savedToken === token && savedParticipantId) {
      setPlayerName(savedName)
      setParticipantId(parseInt(savedParticipantId, 10))
      setPhase('character-select')
    }
  }, [token])

  // Auto-redirect when rehearsal starts
  useEffect(() => {
    if (lobbyInfo.data?.isActive && lobbyInfo.data?.id) {
      router.push(`/rehearsal/${lobbyInfo.data.id}`)
    }
  }, [lobbyInfo.data, router])

  // Handle name submission
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!playerName.trim()) {
      setError('Please enter your name')
      return
    }

    try {
      const result = await joinLobby.mutateAsync({ token, playerName: playerName.trim() })

      localStorage.setItem('runthru_player_name', playerName.trim())
      localStorage.setItem('runthru_lobby_token', token)
      localStorage.setItem('runthru_participant_id', result.participant.participantId.toString())

      setParticipantId(result.participant.participantId)
      setPhase('character-select')
    } catch (err: any) {
      setError(err.message || 'Failed to join lobby')
    }
  }

  // Handle character selection
  const handleCharacterSelect = async (characterName: string) => {
    if (!participantId) return

    try {
      setError('') // Clear any previous errors
      await selectCharacter.mutateAsync({ token, participantId, characterName })
      // Stay in character-select phase to allow re-selection
      // User will see their selection highlighted and can change it
    } catch (err: any) {
      if (err.message.includes('already taken')) {
        setError('Character already selected by another player')
      } else {
        setError(err.message || 'Failed to select character')
      }
    }
  }

  // Handle start rehearsal (host only)
  const handleStartRehearsal = async () => {
    if (!participantId) return

    try {
      const result = await startRehearsal.mutateAsync({ token, hostParticipantId: participantId })
      router.push(result.rehearsal.rehearsalUrl)
    } catch (err: any) {
      setError(err.message || 'Failed to start rehearsal')
    }
  }

  // Helper: Sanitize character name for audio filename (matches backend logic)
  const sanitizeCharacterName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // Helper: Get character card audio URL
  const getCharacterAudioUrl = (characterName: string): string => {
    const sanitizedName = sanitizeCharacterName(characterName)
    // Add version param to bust Cloudflare cache (increment when regenerating audio)
    return `/audio/${lobbyInfo.data?.scriptId}/character-cards/${sanitizedName}-catchphrase.wav?v=3`
  }

  // Scroll navigation for desktop
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.offsetWidth * 0.8
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  // Loading states
  if (lobbyInfo.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    )
  }

  if (lobbyInfo.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {lobbyInfo.error.message || 'Lobby not found or expired'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const parsedScript = script.data?.parsed ?? null
  const currentParticipant = participants.data?.find((p) => p.id === participantId)
  const isHost = currentParticipant?.isHost || false
  const takenCharacters = new Set(
    participants.data?.filter((p) => p.characterName).map((p) => p.characterName!) || []
  )

  // Helper: Get character analysis by name (same as SessionSetup)
  const getCharacterAnalysis = (characterName: string) => {
    return script.data?.analysis?.characters?.find(
      (c: any) => c.characterName === characterName
    )
  }

  // Sort characters by role: Lead → Featured → Ensemble (same as SessionSetup)
  const characters = parsedScript?.characters || []
  const sortedCharacters = [...characters].sort((a: any, b: any) => {
    const analysisA = getCharacterAnalysis(a.name)
    const analysisB = getCharacterAnalysis(b.name)
    if (!analysisA || !analysisB) return 0
    const roleOrder: Record<string, number> = { Lead: 0, Featured: 1, Ensemble: 2 }
    const orderA = roleOrder[analysisA.roleType] ?? 3
    const orderB = roleOrder[analysisB.roleType] ?? 3
    return orderA - orderB
  })

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-cyan-400 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-slate-900" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent">
          {parsedScript?.title || 'Multiplayer Rehearsal'}
        </h1>
        <p className="text-lg text-slate-400">Join the rehearsal session</p>
      </div>

      {/* Phase 1: Name Entry */}
      {phase === 'name' && (
        <Card className="max-w-md mx-auto border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              What's your name?
            </CardTitle>
            <CardDescription>Enter your first name to join the session</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <Input
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value)
                  setError('')
                }}
                placeholder="Enter your name"
                className="text-lg h-12"
                autoFocus
                disabled={joinLobby.isPending}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500"
                disabled={joinLobby.isPending || !playerName.trim()}
              >
                {joinLobby.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Lobby'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Phase 2 & 3: Character Selection + Lobby (Same as SessionSetup) */}
      {(phase === 'character-select' || phase === 'waiting') && parsedScript && (
        <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
          {/* Header - Same as SessionSetup */}
          <div className="text-center space-y-2 md:space-y-4">
            <div className="flex items-center justify-center gap-2 md:gap-3">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-amber-500 flex-shrink-0" />
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                Choose Character
              </h1>
            </div>
            <p className="text-base md:text-lg text-muted-foreground font-semibold">
              Welcome, <span className="text-cyan-400">{playerName}</span>!
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Character Carousel - Same as SessionSetup with navigation arrows */}
          <div className="relative">
            {/* Navigation Arrows - Desktop/Tablet Only */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-14 w-14 rounded-full bg-card/95 backdrop-blur border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 shadow-2xl"
              aria-label="Previous character"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-14 w-14 rounded-full bg-card/95 backdrop-blur border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 shadow-2xl"
              aria-label="Next character"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>

            {/* Horizontal scroll container */}
            <div
              ref={scrollRef}
              className="flex gap-4 lg:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:px-16"
            >
              {sortedCharacters.map((character: any) => {
                const isTakenByOther = takenCharacters.has(character.name) && currentParticipant?.characterName !== character.name
                const takenBy = participants.data?.find((p) => p.characterName === character.name)

                return (
                  <div key={character.name} className="flex-none w-[85vw] sm:w-[45vw] lg:w-[400px] snap-center">
                    <CharacterCard
                      character={{
                        id: character.name,
                        name: character.name,
                        lineCount: character.lineCount,
                        firstAppearance: character.firstAppearance
                      }}
                      analysis={getCharacterAnalysis(character.name)}
                      onClick={() => !isTakenByOther && handleCharacterSelect(character.name)}
                      isSelected={currentParticipant?.characterName === character.name}
                      isTakenByOther={isTakenByOther}
                      takenByPlayerName={takenBy?.playerName}
                      catchphraseAudioUrl={getCharacterAudioUrl(character.name)}
                    />
                  </div>
                )
              })}
            </div>

            {/* Scroll indicators (dots) */}
            <div className="flex justify-center gap-2 mt-4">
              {sortedCharacters.map((character: any, idx: number) => (
                <div
                  key={idx}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all",
                    currentParticipant?.characterName === character.name
                      ? "bg-amber-400 w-6"
                      : "bg-primary/30"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Rehearsal Lobby - Exact copy from SessionSetup */}
          {participants.data && (
            <div className="relative overflow-hidden rounded-3xl border-2 border-cyan-500/30 bg-gradient-to-br from-card via-card to-card/80 shadow-2xl">
              {/* Header */}
              <div className="relative h-24 overflow-hidden bg-gradient-to-br from-cyan-500/20 via-primary/20 to-cyan-500/20">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/60 via-black/40 to-transparent">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
                    <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                      Rehearsal Lobby
                    </h3>
                  </div>
                </div>
              </div>

              {/* Content - Show LobbyStatus component */}
              <div className="px-4 md:px-6 py-4 md:py-5">
                <LobbyStatus
                  participants={participants.data}
                  totalCharacters={sortedCharacters.length}
                />
              </div>

              {/* Footer - Start button (host only) OR waiting message */}
              <div className="border-t border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 via-primary/5 to-cyan-500/5 px-6 py-4">
                {isHost && currentParticipant?.characterName ? (
                  <>
                    <Button
                      onClick={handleStartRehearsal}
                      className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-bold"
                      disabled={startRehearsal.isPending}
                    >
                      {startRehearsal.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          LAUNCH REHEARSAL
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-slate-500 mt-2">
                      AI will be auto-assigned to unselected characters
                    </p>
                  </>
                ) : currentParticipant?.characterName ? (
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Waiting for host to start rehearsal...</span>
                  </div>
                ) : (
                  <div className="text-center text-xs text-slate-500">
                    Select your character above
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}


      {/* Lobby Info */}
      {lobbyInfo.data && (
        <div className="mt-12 text-center text-sm text-slate-500">
          <p>Session expires: {new Date(lobbyInfo.data.expiresAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}
