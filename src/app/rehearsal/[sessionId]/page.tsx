'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useScript } from '@/hooks/useScripts'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Home } from 'lucide-react'
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
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false) // Placeholder for future audio
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(legacyCharacter)

  // Debug: Log when selectedCharacter changes
  useEffect(() => {
    console.log('[Rehearsal] Selected character updated to:', selectedCharacter)
  }, [selectedCharacter])

  // Ref for auto-scrolling to current line
  const currentLineRef = useRef<HTMLDivElement>(null)

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

  // Get user's character from session config (multiplayer) or query param (solo)
  useEffect(() => {
    if (sessionConfig && !legacyCharacter) {
      // Find this user's character by matching player name from localStorage
      const savedPlayerName = localStorage.getItem('runthru_player_name')
      console.log('[Rehearsal] Looking for perspective:', {
        savedPlayerName,
        participants: sessionConfig.participants,
        sessionId
      })

      if (savedPlayerName && sessionConfig.participants) {
        const userParticipant = sessionConfig.participants.find(
          (p: any) => p.playerName === savedPlayerName && !p.isAI
        )

        if (userParticipant) {
          console.log('[Rehearsal] Found user participant:', userParticipant)
          setSelectedCharacter(userParticipant.characterName)
        } else {
          console.warn('[Rehearsal] No matching participant found for:', savedPlayerName)
          console.warn('[Rehearsal] Available participants:', sessionConfig.participants)
        }
      }
    }
  }, [sessionConfig, legacyCharacter, sessionId])

  // Auto-scroll to current line
  useEffect(() => {
    if (currentLineRef.current) {
      currentLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [currentLineIndex])

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

  // Derived state
  const currentLine = dialogueLines[currentLineIndex]
  const totalLines = dialogueLines.length
  const progress = totalLines > 0 ? Math.round(((currentLineIndex + 1) / totalLines) * 100) : 0

  // Navigation handlers
  const handlePrevious = () => {
    if (currentLineIndex > 0) {
      setCurrentLineIndex(currentLineIndex - 1)
      setIsPlaying(false)
    }
  }

  const handleNext = () => {
    if (currentLineIndex < totalLines - 1) {
      setCurrentLineIndex(currentLineIndex + 1)
      setIsPlaying(false)
    }
  }

  const handleReplay = () => {
    // For now, just a visual indicator
    // Later: replay audio for current line
    setIsPlaying(false)
  }

  const handleTogglePlay = () => {
    // Placeholder for future audio playback
    setIsPlaying(!isPlaying)
  }

  const handleExit = () => {
    router.push('/scripts')
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
      {/* User Perspective Banner - Show which character they're playing */}
      {selectedCharacter && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-center">
          <span className="text-sm font-bold text-amber-400">
            Playing as: <span className="text-lg">{selectedCharacter}</span>
          </span>
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
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={currentLineIndex === 0}
              className="h-10 w-10 rounded-lg disabled:opacity-30"
              aria-label="Previous line"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleReplay}
              className="h-10 w-10 rounded-lg"
              aria-label="Replay current line"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              onClick={handleTogglePlay}
              className="h-12 w-12 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentLineIndex === totalLines - 1}
              className="h-10 w-10 rounded-lg disabled:opacity-30"
              aria-label="Next line"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleExit}
              className="h-10 w-10 rounded-lg"
              aria-label="Exit to scripts"
            >
              <Home className="h-4 w-4" />
            </Button>
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
