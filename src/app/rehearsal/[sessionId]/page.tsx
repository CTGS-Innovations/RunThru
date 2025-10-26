'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useScript } from '@/hooks/useScripts'
import { useQuery } from '@tanstack/react-query'
import { usePlayback } from '@/hooks/usePlayback'
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

// Type for extracted dialogue lines
interface DialogueLine {
  character: string
  text: string
  stageDirection?: string
  sceneNumber: number
  lineIndex: number
  isUserLine: boolean
}

export default function RehearsalPlayerPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const sessionId = params.sessionId as string
  const legacyCharacter = searchParams.get('character') // For backwards compat with MVP solo mode

  // State
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(legacyCharacter)
  const [isHost, setIsHost] = useState<boolean>(true) // Default to host controls until session config loads

  // Refs
  const currentLineRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Server-synced playback state (polls every 500ms)
  const { playbackInfo, isLoading: playbackLoading, advance, previous, play, pause, reset, endSession } = usePlayback({
    sessionId,
    enabled: true,
    pollingInterval: 500
  })

  // Debug: Log when selectedCharacter changes
  useEffect(() => {
    console.log('[Rehearsal] Selected character updated to:', selectedCharacter)
  }, [selectedCharacter])

  // Load session config (for multiplayer)
  const { data: sessionConfig, isLoading: sessionLoading } = useQuery({
    queryKey: ['session-config', sessionId],
    queryFn: async () => {
      try {
        console.log('[Rehearsal] Fetching session config for:', sessionId)
        const response = await fetch(`/api/sessions/${sessionId}/config`)
        if (response.status === 404) {
          // Legacy MVP mode - use sessionId as scriptId
          console.log('[Rehearsal] Session config not found (404) - using legacy MVP mode')
          return null
        }
        if (!response.ok) {
          throw new Error('Failed to fetch session config')
        }
        const data = await response.json()
        console.log('[Rehearsal] Session config loaded:', data.config)
        return data.config
      } catch (error: any) {
        // If network error or other issue, return null for backward compat
        if (error.message?.includes('fetch')) {
          console.log('[Rehearsal] Network error fetching session config - using legacy mode')
          return null
        }
        throw error
      }
    }
  })

  // Determine scriptId: from session config (multiplayer) or use sessionId directly (MVP solo)
  const scriptId = sessionConfig?.scriptId || sessionId

  // Queries
  const { data: scriptData, isLoading: scriptLoading } = useScript(scriptId)

  // Helper: Get character portrait URL
  const getCharacterPortrait = (characterName: string) => {
    if (!scriptData?.analysis?.characters) return null
    // Case-insensitive character name matching
    const charAnalysis = scriptData.analysis.characters.find(
      (c: any) => c.characterName.toLowerCase() === characterName.toLowerCase()
    )

    // Debug: log if character not found
    if (!charAnalysis) {
      console.log(`Character "${characterName}" not found in analysis. Available:`,
        scriptData.analysis.characters.map((c: any) => c.characterName))
      return null
    }

    if (!charAnalysis?.portrait?.imageUrl) {
      console.log(`No portrait for "${characterName}"`)
      return null
    }

    // Portrait URLs from backend are like: /portraits/{scriptId}/{filename}
    // Use the dedicated portrait proxy route at /portraits (not /api/portraits)
    return charAnalysis.portrait.imageUrl
  }

  // Determine host status and character from session config
  useEffect(() => {
    // Check if user has the PIN (only the host has access to the PIN)
    const hasPin = !!localStorage.getItem('runthru_pin')
    setIsHost(hasPin)
    console.log('[Rehearsal] Host status determined by PIN presence:', hasPin)

    // Find user's character from session config (multiplayer) or query param (solo)
    if (sessionConfig && !legacyCharacter) {
      const savedPlayerName = localStorage.getItem('runthru_player_name')
      console.log('[Rehearsal] Looking for character:', {
        savedPlayerName,
        participants: sessionConfig.participants,
        sessionId
      })

      if (savedPlayerName && sessionConfig.participants) {
        const userParticipant = sessionConfig.participants.find(
          (p: any) => p.playerName === savedPlayerName && !p.isAI
        )

        if (userParticipant) {
          console.log('[Rehearsal] Found user character:', userParticipant.characterName)
          setSelectedCharacter(userParticipant.characterName)
        } else {
          console.warn('[Rehearsal] No matching participant found for:', savedPlayerName)
          console.warn('[Rehearsal] Available participants:', sessionConfig.participants)
        }
      }
    } else if (legacyCharacter) {
      // Legacy solo mode - character from URL param
      console.log('[Rehearsal] Legacy mode - using character from URL:', legacyCharacter)
    }
  }, [sessionConfig, legacyCharacter, sessionId])

  // Auto-scroll to current line (using server state)
  useEffect(() => {
    if (currentLineRef.current && playbackInfo) {
      currentLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [playbackInfo])

  // Audio auto-play for AI lines ONLY (skip human characters, respect pause state)
  useEffect(() => {
    if (!playbackInfo?.currentLine || !audioRef.current) return

    const currentLine = playbackInfo.currentLine
    const isPaused = playbackInfo.playbackState === 'paused'

    // Only auto-play audio for AI characters (not human players) and only if not paused
    if (currentLine.isAI && currentLine.audioUrl && !isPaused) {
      console.log('[Rehearsal] Auto-playing AI line:', currentLine.character, currentLine.audioUrl)

      audioRef.current.src = currentLine.audioUrl
      audioRef.current.play().catch(err => {
        console.error('[Rehearsal] Audio playback error:', err)
      })
    } else if (!currentLine.isAI) {
      // Human character's turn - stop any playing audio
      audioRef.current.pause()
      audioRef.current.src = ''
      console.log('[Rehearsal] Human character turn:', currentLine.character, '- waiting for player input')
    } else if (isPaused && currentLine.isAI) {
      // Paused state - stop audio if playing
      audioRef.current.pause()
      console.log('[Rehearsal] Playback paused - stopping audio')
    }
  }, [playbackInfo]) // Trigger when playback info changes

  // Auto-advance when audio ends (AI lines only, and only if playing)
  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement || !playbackInfo?.currentLine) return

    const handleAudioEnded = () => {
      // Only auto-advance if playback is active (not paused)
      if (playbackInfo.currentLine?.isAI && playbackInfo.playbackState === 'playing') {
        console.log('[Rehearsal] AI audio finished - auto-advancing')
        advance() // Auto-advance to next line
      } else if (playbackInfo.playbackState === 'paused') {
        console.log('[Rehearsal] Playback paused - not auto-advancing')
      }
    }

    audioElement.addEventListener('ended', handleAudioEnded)

    return () => {
      audioElement.removeEventListener('ended', handleAudioEnded)
    }
  }, [playbackInfo?.currentLine, playbackInfo?.playbackState, advance])

  // Group dialogue lines by scene with scene headings
  const sceneGroups = useMemo(() => {
    if (!scriptData?.parsed?.content) return []

    const groups: Array<{
      sceneNumber: number
      sceneHeading: string
      characters: string[]
      lines: DialogueLine[]
    }> = []

    let currentSceneNumber = 0
    let currentSceneHeading = ''
    let currentLines: DialogueLine[] = []
    let lineIndex = 0

    scriptData.parsed.content.forEach((element: any, idx: number) => {
      if (element.type === 'scene') {
        // Save previous scene if it has lines
        if (currentLines.length > 0) {
          const uniqueChars = Array.from(new Set(currentLines.map(l => l.character)))
          groups.push({
            sceneNumber: currentSceneNumber,
            sceneHeading: currentSceneHeading,
            characters: uniqueChars,
            lines: currentLines
          })
        }

        // Start new scene
        currentSceneNumber++
        // Try multiple possible fields for scene heading
        const rawHeading = element.text || element.heading || element.content || ''
        // Use "Intro" for first scene if no heading, otherwise "Scene X"
        currentSceneHeading = rawHeading || (currentSceneNumber === 1 ? 'Intro' : `Scene ${currentSceneNumber}`)
        currentLines = []
      } else if (element.type === 'dialogue') {
        currentLines.push({
          character: element.character,
          text: element.text,
          stageDirection: element.stageDirection,
          sceneNumber: currentSceneNumber,
          lineIndex: lineIndex++,
          isUserLine: element.character === selectedCharacter
        })
      }
    })

    // Save final scene
    if (currentLines.length > 0) {
      const uniqueChars = Array.from(new Set(currentLines.map(l => l.character)))
      groups.push({
        sceneNumber: currentSceneNumber,
        sceneHeading: currentSceneHeading,
        characters: uniqueChars,
        lines: currentLines
      })
    }

    return groups
  }, [scriptData, selectedCharacter])

  // Flatten for progress calculation
  const dialogueLines = useMemo(() => {
    return sceneGroups.flatMap(group => group.lines)
  }, [sceneGroups])

  // Derived state (from server or fallback to local)
  const currentLineIndex = playbackInfo?.currentLineIndex ?? 0
  const currentLine = dialogueLines[currentLineIndex]
  const totalLines = playbackInfo?.totalLines ?? dialogueLines.length
  const progress = totalLines > 0 ? Math.round(((currentLineIndex + 1) / totalLines) * 100) : 0
  const isPlaying = playbackInfo?.playbackState === 'playing'

  // Navigation handlers
  const handlePrevious = () => {
    // Go back one line (host only)
    console.log('[Rehearsal] Going to previous line')
    previous()
  }

  const handleNext = () => {
    // Skip forward one line (host only)
    if (!playbackInfo?.isComplete) {
      console.log('[Rehearsal] Skipping to next line via API')
      advance()
    }
  }

  const handleReplay = () => {
    // Reset to beginning of entire script
    console.log('[Rehearsal] Resetting to beginning')
    reset()
  }

  const handleTogglePlay = () => {
    // Play button behavior:
    // - If it's the host's turn (orange): advance forward
    // - If it's NOT the host's turn:
    //   - If PAUSED: resume (play)
    //   - If PLAYING: pause
    const isHostTurn = currentLine?.character === selectedCharacter

    if (isHostTurn) {
      console.log('[Rehearsal] Host turn - advancing')
      advance()
    } else {
      // Toggle play/pause state
      if (playbackInfo?.playbackState === 'paused') {
        console.log('[Rehearsal] Resuming playback')
        play()
      } else {
        console.log('[Rehearsal] Pausing playback')
        // Stop any playing audio
        if (audioRef.current) {
          audioRef.current.pause()
        }
        pause()
      }
    }
  }

  const handleExit = () => {
    // If host, end the session for everyone
    if (isHost) {
      console.log('[Rehearsal] Host exiting - ending session for all participants')
      endSession()
      // Wait a moment for the API call, then redirect
      setTimeout(() => {
        router.push('/')
      }, 100)
    } else {
      // Non-host just exits to home
      console.log('[Rehearsal] Non-host exiting')
      router.push('/')
    }
  }

  // Loading state
  if (sessionLoading || scriptLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-4xl px-4">
          <Skeleton className="h-16 w-3/4 mx-auto" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (!scriptData || !currentLine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Script or dialogue not found</p>
            <Button onClick={handleExit}>Back to Scripts</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Hidden audio player for TTS playback */}
      <audio ref={audioRef} className="hidden" />

      {/* User Perspective Banner - Show which character they're playing */}
      {selectedCharacter && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm font-bold text-amber-400">
              Playing as: <span className="text-lg">{selectedCharacter}</span>
            </span>
            {/* Playback State Indicator (visible to all, controlled by host only) */}
            {playbackInfo && (
              <span className={cn(
                "text-xs font-black uppercase px-3 py-1 rounded-full border-2",
                playbackInfo.playbackState === 'paused'
                  ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                  : "bg-green-500/20 border-green-500/50 text-green-400"
              )}>
                {playbackInfo.playbackState === 'paused' ? '⏸ PAUSED' : '▶ PLAYING'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Script Display - Scenes with sticky headers */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {sceneGroups.map((scene, idx) => (
          <div key={scene.sceneNumber} className="relative">
            {/* Sticky Scene Header - each one stacks on top of previous */}
            <div
              className="sticky top-0 bg-card/95 backdrop-blur border-b border-primary/20"
              style={{ zIndex: 10 + idx }}
            >
              {/* Scene/Method Bar - Full Width */}
              <div className="px-3 py-2 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-purple-500/10 border-b border-cyan-500/20">
                <div className="text-sm font-black text-cyan-400 text-center tracking-wide">
                  {scene.sceneHeading}
                </div>
              </div>

              {/* Characters Row */}
              <div className="px-3 py-2 flex items-center gap-2 flex-wrap justify-center">
                {scene.characters.map((char) => (
                  <span
                    key={char}
                    className={cn(
                      "text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap",
                      char === selectedCharacter
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : "text-cyan-400/70 bg-cyan-500/5"
                    )}
                  >
                    {char === selectedCharacter ? `YOU (${char})` : char}
                  </span>
                ))}
              </div>
            </div>

            {/* Scene Dialogue */}
            <div className="px-2 py-4 space-y-2 pb-32">
              {scene.lines.map((line) => {
                const isCurrent = line.lineIndex === currentLineIndex
                const isPast = line.lineIndex < currentLineIndex
                const isFuture = line.lineIndex > currentLineIndex

                return (
                  <div
                    key={line.lineIndex}
                    ref={isCurrent ? currentLineRef : null}
                    className={cn(
                      "px-3 py-2 transition-all",
                      isCurrent && "py-4 rounded-lg",
                      isCurrent && line.isUserLine && "bg-amber-500/15 border-l-4 border-amber-500",
                      isCurrent && !line.isUserLine && "bg-cyan-500/15 border-l-4 border-cyan-500",
                      isPast && "opacity-40",
                      isFuture && "opacity-25"
                    )}
                  >
                    <div className="flex gap-3 items-start">
                      {/* Character Portrait - 60x60 rounded square */}
                      {getCharacterPortrait(line.character) && (
                        <Image
                          src={getCharacterPortrait(line.character)!}
                          alt={line.character}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover flex-shrink-0"
                          unoptimized
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex gap-2 items-baseline mb-1">
                          <span className={cn(
                            "font-bold flex-shrink-0",
                            isCurrent ? "text-base font-black" : "text-sm",
                            line.isUserLine ? "text-amber-400" : "text-cyan-400"
                          )}>
                            {line.character}:
                          </span>
                          {isCurrent && line.isUserLine && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-400 font-bold">
                              YOUR LINE
                            </span>
                          )}
                        </div>
                        {line.stageDirection && isCurrent && (
                          <div className="text-sm italic text-muted-foreground mb-2">
                            ({line.stageDirection})
                          </div>
                        )}
                        <div className={cn(
                          "leading-snug",
                          isCurrent ? "text-2xl md:text-3xl lg:text-4xl font-bold text-foreground" : "text-sm text-foreground/80",
                          isFuture && "truncate text-xs text-foreground/60"
                        )}>
                          {line.stageDirection && !isCurrent && <span className="italic text-muted-foreground">({line.stageDirection}) </span>}
                          {line.text}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </main>

      {/* Controls Footer - Compact - Always on top */}
      <footer className="sticky bottom-0 z-[9999] bg-gradient-to-br from-card via-card to-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-t border-primary/20">
        <div className="px-2 py-3 space-y-3">
          {/* Show "The End" message if at final line */}
          {currentLineIndex === totalLines - 1 && (
            <div className="text-center py-2">
              <p className="text-xs text-muted-foreground">🎬 Final line reached</p>
            </div>
          )}

          {/* Playback Controls - Compact */}
          <div className="flex items-center justify-center gap-2">
            {/* Host controls: full navigation */}
            {isHost ? (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  disabled={currentLineIndex === 0}
                  className="h-10 w-10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous line"
                  title={currentLineIndex === 0 ? "Already at beginning" : "Go back one line"}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleReplay}
                  className="h-10 w-10 rounded-lg"
                  aria-label="Reset to beginning"
                  title="Reset to beginning of script"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>

                <Button
                  size="lg"
                  onClick={handleTogglePlay}
                  className={cn(
                    "h-16 w-16 rounded-full transition-all duration-300",
                    currentLine?.isUserLine
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 shadow-lg shadow-amber-500/50 animate-pulse"
                      : playbackInfo?.playbackState === 'paused'
                        ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30"
                        : "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg"
                  )}
                  aria-label={
                    currentLine?.isUserLine
                      ? "Continue (Your Turn)"
                      : playbackInfo?.playbackState === 'paused'
                        ? "Resume playback"
                        : "Pause playback"
                  }
                  title={
                    currentLine?.isUserLine
                      ? "Continue (Your Turn)"
                      : playbackInfo?.playbackState === 'paused'
                        ? "Resume playback"
                        : "Pause playback"
                  }
                >
                  {currentLine?.isUserLine ? (
                    <Play className="h-8 w-8" />
                  ) : playbackInfo?.playbackState === 'paused' ? (
                    <Play className="h-8 w-8" />
                  ) : (
                    <Pause className="h-8 w-8" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  disabled={currentLineIndex === totalLines - 1}
                  className="h-10 w-10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Skip forward"
                  title={currentLineIndex === totalLines - 1 ? "Already at end" : "Skip forward one line"}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleExit}
                  className="h-10 w-10 rounded-lg"
                  aria-label="Exit to scripts"
                  title="Exit rehearsal"
                >
                  <Home className="h-4 w-4" />
                </Button>
              </>
            ) : (
              /* Non-host controls: only Play button */
              <Button
                size="lg"
                onClick={handleNext}
                disabled={!currentLine?.isUserLine}
                className={cn(
                  "h-16 w-16 rounded-full transition-all duration-300",
                  currentLine?.isUserLine
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 shadow-lg shadow-amber-500/50 animate-pulse"
                    : "bg-muted/30 opacity-40 cursor-not-allowed"
                )}
                aria-label={currentLine?.isUserLine ? "Your Turn - Continue" : "Waiting..."}
              >
                <Play className="h-8 w-8" />
              </Button>
            )}
          </div>

          {/* Progress Bar - Compact */}
          <div className="px-4">
            <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-primary to-cyan-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
