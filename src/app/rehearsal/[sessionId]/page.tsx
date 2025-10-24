'use client'

import { useState, useMemo } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useScript } from '@/hooks/useScripts'
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

  // For MVP: sessionId is actually scriptId, character comes from query params
  const scriptId = params.sessionId as string
  const selectedCharacter = searchParams.get('character')

  // State
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false) // Placeholder for future audio

  // Queries
  const { data: scriptData, isLoading: scriptLoading } = useScript(scriptId)

  // Extract all dialogue lines from script content
  const dialogueLines = useMemo(() => {
    if (!scriptData?.parsed?.content) return []

    const lines: DialogueLine[] = []
    let sceneNumber = 0
    let lineIndex = 0

    scriptData.parsed.content.forEach((element: any) => {
      if (element.type === 'scene') {
        sceneNumber++
      } else if (element.type === 'dialogue') {
        lines.push({
          character: element.character,
          text: element.text,
          stageDirection: element.stageDirection,
          sceneNumber,
          lineIndex: lineIndex++,
          isUserLine: element.character === selectedCharacter
        })
      }
    })

    return lines
  }, [scriptData, selectedCharacter])

  // Derived state
  const currentLine = dialogueLines[currentLineIndex]
  const totalLines = dialogueLines.length
  const upcomingLines = dialogueLines.slice(currentLineIndex + 1, currentLineIndex + 5)
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
  if (scriptLoading) {
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - Sticky */}
      <header className="sticky top-0 z-10 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b-2 border-primary/30 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-lg md:text-xl lg:text-2xl font-black bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                {scriptData.title}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-muted-foreground">Playing as:</span>
                <span className="text-xs md:text-sm text-amber-400 font-black px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  {selectedCharacter}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm md:text-base font-black text-cyan-400">
                {currentLineIndex + 1} / {totalLines}
              </div>
              <div className="text-xs text-muted-foreground">
                {progress}% Complete
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dialogue Display - 60-70% of screen */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 min-h-[60vh]">
        <div className="text-center max-w-5xl w-full space-y-8">
          {/* Current Line Card */}
          <div className={cn(
            "relative overflow-hidden rounded-3xl border-2 shadow-2xl transition-all duration-300 p-8 md:p-12",
            currentLine.isUserLine
              ? "bg-gradient-to-br from-amber-500/10 via-card to-card border-amber-500/50 shadow-[0_0_40px_hsl(24_90%_60%_/_0.2)]"
              : "bg-gradient-to-br from-cyan-500/10 via-card to-card border-cyan-500/50 shadow-[0_0_40px_hsl(180_80%_60%_/_0.2)]"
          )}>
            {/* Decorative pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

            {/* Content */}
            <div className="relative z-10 space-y-6">
              {/* Current Speaker */}
              <div className="space-y-2">
                <div className={cn(
                  "text-3xl md:text-4xl font-black",
                  currentLine.isUserLine ? 'text-amber-400' : 'text-cyan-400'
                )}>
                  {currentLine.character}
                </div>
                {currentLine.stageDirection && (
                  <div className="text-base md:text-lg text-muted-foreground italic">
                    ({currentLine.stageDirection})
                  </div>
                )}
              </div>

              {/* Current Dialogue - Large and Centered */}
              <div className={cn(
                "text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight",
                currentLine.isUserLine ? 'text-foreground drop-shadow-[0_2px_8px_hsl(24_90%_60%_/_0.3)]' : 'text-foreground drop-shadow-[0_2px_8px_hsl(180_80%_60%_/_0.3)]'
              )}>
                {currentLine.text}
              </div>

              {/* Visual indicator if it's user's line */}
              {currentLine.isUserLine && (
                <div className="inline-block px-6 py-3 bg-amber-500/20 border-2 border-amber-500/50 rounded-2xl text-amber-400 text-base md:text-lg font-black shadow-lg">
                  🎭 YOUR LINE
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Script Preview Panel - Sticky Bottom */}
      <footer className="sticky bottom-0 z-10 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-t-2 border-primary/30 shadow-2xl">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Coming Up Section */}
          <div className="max-w-4xl mx-auto">
            <div className="text-xs font-black text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>⚡</span>
              <span>Coming Up</span>
            </div>
            <div className="space-y-2">
              {upcomingLines.length > 0 ? (
                upcomingLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "text-sm p-4 rounded-2xl border-2 transition-all shadow-lg",
                      line.isUserLine
                        ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30'
                        : 'bg-gradient-to-r from-cyan-500/5 via-card to-transparent border-border/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "font-black min-w-[80px] md:min-w-[100px] text-sm md:text-base",
                        line.isUserLine ? 'text-amber-400' : 'text-cyan-400'
                      )}>
                        {line.character}
                      </div>
                      <div className="flex-1 text-foreground/90">
                        {line.stageDirection && (
                          <span className="italic text-xs opacity-70">({line.stageDirection}) </span>
                        )}
                        {line.text}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-6 rounded-3xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                  <p className="text-4xl mb-3">🎬</p>
                  <p className="text-xl font-black text-foreground mb-2">The End</p>
                  <p className="text-sm text-muted-foreground">You've reached the final line!</p>
                </div>
              )}
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-3 md:gap-4 pb-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={currentLineIndex === 0}
              className="h-12 w-12 md:h-14 md:w-14 rounded-2xl border-2 hover:border-primary/50 hover:bg-primary/10 transition-all disabled:opacity-30"
              aria-label="Previous line"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleReplay}
              className="h-12 w-12 md:h-14 md:w-14 rounded-2xl border-2 hover:border-accent/50 hover:bg-accent/10 transition-all"
              aria-label="Replay current line"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              onClick={handleTogglePlay}
              className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg shadow-cyan-500/30 transition-all"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentLineIndex === totalLines - 1}
              className="h-12 w-12 md:h-14 md:w-14 rounded-2xl border-2 hover:border-primary/50 hover:bg-primary/10 transition-all disabled:opacity-30"
              aria-label="Next line"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleExit}
              className="h-12 w-12 md:h-14 md:w-14 rounded-2xl hover:bg-muted/50 transition-all"
              aria-label="Exit to scripts"
            >
              <Home className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="h-3 bg-muted/50 rounded-full overflow-hidden border border-border/50 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-primary to-cyan-500 transition-all duration-300 shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
