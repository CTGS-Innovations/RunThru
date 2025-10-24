'use client'

import { useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CharacterCard } from '@/components/session/CharacterCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useScript } from '@/hooks/useScripts'
import { Sparkles, Zap, Users, ArrowRight, Check, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Character } from '@/types'

export default function CharacterSelectionPage() {
  const params = useParams()
  const router = useRouter()
  const scriptId = params.id as string

  // State
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Queries
  const { data: scriptData, isLoading: scriptLoading } = useScript(scriptId)

  // Derived state
  const characters: Character[] = scriptData?.parsed?.characters || []

  // Helper: Get character analysis by name
  const getCharacterAnalysis = (characterName: string) => {
    return scriptData?.analysis?.characters?.find(
      (c) => c.characterName === characterName
    )
  }

  // Sort characters by role: Lead → Featured → Ensemble
  const sortedCharacters = [...characters].sort((a, b) => {
    const analysisA = getCharacterAnalysis(a.name)
    const analysisB = getCharacterAnalysis(b.name)

    // If no analysis, keep original order
    if (!analysisA || !analysisB) return 0

    const roleOrder = { Lead: 0, Featured: 1, Ensemble: 2 }
    const orderA = roleOrder[analysisA.roleType] ?? 3
    const orderB = roleOrder[analysisB.roleType] ?? 3

    return orderA - orderB
  })

  // Handlers
  const handleCharacterSelect = (characterName: string) => {
    // Allow unselect by clicking selected character again
    if (selectedCharacter === characterName) {
      setSelectedCharacter(null)
    } else {
      setSelectedCharacter(characterName)
    }
  }

  const handleStartRehearsal = () => {
    if (!selectedCharacter) return

    // For MVP: Go directly to rehearsal with selected character
    // Session will be created on rehearsal page
    router.push(`/rehearsal/${scriptId}?character=${encodeURIComponent(selectedCharacter)}`)
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

  // Loading state
  if (scriptLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  if (!scriptData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Script not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/scripts')}
        className="group -ml-2 hover:bg-primary/10 transition-all"
      >
        <ArrowLeft className="h-5 w-5 mr-2 text-amber-500 transition-transform group-hover:-translate-x-1" />
        <span className="font-bold text-base">Back to Scripts</span>
      </Button>

      {/* Header - Compact for Mobile */}
      <div className="text-center space-y-2 md:space-y-4">
        <div className="flex items-center justify-center gap-2 md:gap-3">
          <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-amber-500 flex-shrink-0" />
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
            Choose Character
          </h1>
        </div>
        <p className="text-base md:text-lg text-muted-foreground font-semibold line-clamp-1">
          {scriptData.title}
        </p>
      </div>

      {/* Character Carousel - All Screen Sizes */}
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
          {sortedCharacters.map((character) => (
            <div key={character.name} className="flex-none w-[85vw] sm:w-[45vw] lg:w-[400px] snap-center">
              <CharacterCard
                character={{
                  id: character.name,
                  name: character.name,
                  lineCount: character.lineCount,
                  firstAppearance: character.firstAppearance
                }}
                analysis={getCharacterAnalysis(character.name)}
                isSelected={selectedCharacter === character.name}
                onClick={() => handleCharacterSelect(character.name)}
              />
            </div>
          ))}
        </div>

        {/* Scroll indicators (dots) */}
        <div className="flex justify-center gap-2 mt-4">
          {sortedCharacters.map((character, idx) => (
            <div
              key={idx}
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                selectedCharacter === character.name
                  ? "bg-amber-400 w-6"
                  : "bg-primary/30"
              )}
            />
          ))}
        </div>
      </div>

      {/* Lobby Waiting Area */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-cyan-500/30 bg-gradient-to-br from-card via-card to-card/80 shadow-2xl">
        {/* Header */}
        <div className="relative h-24 overflow-hidden bg-gradient-to-br from-cyan-500/20 via-primary/20 to-cyan-500/20">
          {/* Decorative pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

          {/* Title overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/60 via-black/40 to-transparent">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
              <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                Rehearsal Lobby
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <div className="text-xs font-black uppercase tracking-wider text-muted mb-3">
            👥 Players Ready
          </div>

          {selectedCharacter ? (
            <div className="space-y-3">
              {/* Your Character */}
              <div className="group relative overflow-hidden rounded-2xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent shadow-lg transition-all hover:scale-102">
                <div className="flex items-center gap-4 p-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/30 flex items-center justify-center text-3xl border-2 border-amber-500/50 shadow-lg">
                      🎭
                    </div>
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 shadow-lg">
                      <Check className="w-3 h-3 text-black" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-muted-foreground mb-1">YOU</div>
                    <div className="text-xl md:text-2xl font-black text-amber-400">{selectedCharacter}</div>
                    {getCharacterAnalysis(selectedCharacter)?.tagline && (
                      <div className="text-sm text-cyan-400 font-semibold">
                        {getCharacterAnalysis(selectedCharacter)?.tagline}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/50">
                      <span className="text-sm font-black text-green-400">✓ READY</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Characters Placeholder */}
              <div className="text-center py-4 px-6 rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-500/5">
                <div className="text-sm text-cyan-400 font-semibold mb-1">🤖 AI Scene Partners</div>
                <div className="text-xs text-muted-foreground">
                  {characters.length - 1} AI character{characters.length - 1 !== 1 ? 's' : ''} will perform with you
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 px-6">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-lg font-bold text-muted-foreground mb-2">
                Select Your Character
              </p>
              <p className="text-sm text-muted-foreground">
                Swipe through the characters above and tap to select your role
              </p>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="border-t border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 via-primary/5 to-cyan-500/5 px-6 py-3">
          <div className="text-xs text-muted-foreground text-center">
            Solo Mode • Multiplayer Coming Soon
          </div>
        </div>
      </div>

      {/* Start Rehearsal Button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={handleStartRehearsal}
          disabled={!selectedCharacter}
          className="h-16 md:h-20 px-8 md:px-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-black text-xl md:text-2xl shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          <Zap className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
          START REHEARSAL
          <ArrowRight className="w-6 h-6 md:w-8 md:h-8 ml-2 md:ml-3" />
        </Button>
      </div>
    </div>
  )
}
