import { Check, Sparkles, Star, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CharacterAnalysisWithPortrait } from '@/types'
import Image from 'next/image'

interface CharacterCardProps {
  character: {
    id: string
    name: string
    lineCount: number
    firstAppearance: number
  }
  analysis?: CharacterAnalysisWithPortrait  // OpenAI analysis (Sprint 4)
  isSelected: boolean
  onClick: () => void
}

export function CharacterCard({ character, analysis, isSelected, onClick }: CharacterCardProps) {
  // Role type badge styling
  const getRoleBadge = (roleType: string) => {
    switch (roleType) {
      case 'Lead':
        return { icon: Star, color: 'bg-amber-500 text-black' }
      case 'Featured':
        return { icon: Sparkles, color: 'bg-cyan-400 text-black' }
      case 'Ensemble':
        return { icon: Users, color: 'bg-purple-500 text-white' }
      default:
        return { icon: Users, color: 'bg-muted text-black' }
    }
  }

  const roleBadge = analysis ? getRoleBadge(analysis.roleType) : null
  const RoleIcon = roleBadge?.icon

  // Strip localhost:4000 prefix from image URLs (backend returns absolute URLs, we use proxy)
  const imageUrl = analysis?.portrait?.imageUrl?.replace('http://localhost:4000', '') || null

  return (
    <div
      className={cn(
        "group relative cursor-pointer transition-all duration-300",
        "hover:scale-105",
        isSelected && "scale-105"
      )}
      onClick={onClick}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* Pokemon Card Style */}
      <div className={cn(
        "relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-300",
        "bg-gradient-to-br from-card via-card to-card/80",
        isSelected
          ? "border-4 border-amber-500/50 shadow-[0_0_40px_hsl(24_90%_60%_/_0.4)] ring-4 ring-amber-500/20"
          : "border-2 border-primary/30 hover:shadow-[0_0_40px_hsl(180_80%_60%_/_0.3)] hover:border-cyan-500/50"
      )}>

        {/* Shine effect */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shine_3s_ease-in-out_infinite]" />
        </div>

        {/* Portrait Section */}
        <div className="relative h-80 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={character.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 400px"
              style={{ boxShadow: '0 0 20px hsl(24 90% 60% / 0.3), 0 0 40px hsl(180 80% 60% / 0.2)' }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
              <span className="text-7xl relative z-10" role="img" aria-label="Theater mask">🎭</span>
            </div>
          )}

          {/* Gradient overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent via-30% to-card" />

          {/* Header Text Overlay (Pokemon Style - TOP of card) */}
          <div className="absolute top-0 left-0 right-0 p-4">
            <div className="flex items-start justify-between">
              <div className="relative">
                {/* Extra dark backing for text legibility */}
                <div className="absolute inset-0 -inset-x-2 -inset-y-1 bg-black/40 blur-xl" />
                <h2 className="text-2xl font-black text-white relative drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] uppercase">
                  {character.name}
                </h2>
                <p className="text-base font-black italic relative drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                  {analysis?.tagline || 'Character'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {roleBadge && RoleIcon && (
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-black uppercase shadow-lg flex items-center gap-1",
                    roleBadge.color
                  )}>
                    <RoleIcon className="w-3 h-3" />
                    {analysis?.roleType}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Count Badge (Bottom Right on Image) */}
          <div className="absolute bottom-4 right-4">
            <div className="px-4 py-2 bg-cyan-400/95 backdrop-blur-sm border-2 border-white/30 rounded-xl text-sm font-black text-black shadow-lg">
              {character.lineCount} LINES
            </div>
          </div>

          {/* Selected Checkmark */}
          {isSelected && (
            <div className="absolute top-4 left-4 bg-green-500 rounded-full p-2 shadow-lg z-10">
              <Check className="w-5 h-5 text-black" aria-label="Selected" />
            </div>
          )}
        </div>

        {/* Stats Section - ALL sections always visible */}
        <div className="px-6 py-4 space-y-4">

          {/* Power Stats */}
          <div>
            <div className="text-xs font-black text-white/70 uppercase tracking-wider mb-2">⚡ Power Stats</div>

            {/* Stage Presence */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white">💪 Stage Presence</span>
                <span className="text-sm font-bold text-orange-500">{analysis?.stagePresence ?? 50}%</span>
              </div>
              <div className="h-2.5 bg-border/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-orange-500 rounded-full transition-all duration-700"
                  style={{ width: `${analysis?.stagePresence ?? 50}%` }}
                />
              </div>
            </div>

            {/* Emotional Range */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white">🎭 Emotional Range</span>
                <span className="text-sm font-bold text-blue-400">{analysis?.emotionalRange ?? 50}%</span>
              </div>
              <div className="h-2.5 bg-border/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${analysis?.emotionalRange ?? 50}%` }}
                />
              </div>
            </div>

            {/* Energy Level */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white">⚡ Energy Level</span>
                <span className="text-sm font-bold text-green-500">{analysis?.energyLevel ?? 50}%</span>
              </div>
              <div className="h-2.5 bg-border/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
                  style={{ width: `${analysis?.energyLevel ?? 50}%` }}
                />
              </div>
            </div>

            {/* Star Moments */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white">💫 Star Moments</span>
                <span className="text-sm font-bold text-yellow-400">
                  {analysis?.breakoutScenes?.length ?? 0}
                </span>
              </div>
              <div className="flex gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-2.5 flex-1 rounded-full",
                      i < (analysis?.breakoutScenes?.length ?? 0)
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                        : "bg-border/30"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Character Journey */}
          <div>
            <div className="text-xs font-black text-white/70 uppercase tracking-wider mb-2">🎯 Character Journey</div>
            <div className="flex items-center gap-3 text-base">
              <span className="font-medium text-white/60">
                {analysis?.journeyStart ?? 'Unknown'}
              </span>
              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="font-bold text-primary">
                {analysis?.journeyEnd ?? 'Unknown'}
              </span>
            </div>
          </div>

          {/* Skills Required */}
          <div>
            <div className="text-xs font-black text-white/70 uppercase tracking-wider mb-2">🎪 Skills Required</div>
            <div className="flex flex-wrap gap-2">
              {(analysis?.skillsNeeded && analysis.skillsNeeded.length > 0) ? (
                analysis.skillsNeeded.map((skill, idx) => {
                  const colors = [
                    'bg-cyan-400/20 border-cyan-400/50 text-cyan-400',
                    'bg-orange-500/20 border-orange-500/50 text-orange-500',
                    'bg-green-400/20 border-green-400/50 text-green-400',
                    'bg-purple-400/20 border-purple-400/50 text-purple-400',
                  ]
                  return (
                    <div key={idx} className={cn("px-3 py-1.5 border-2 rounded-lg text-sm font-bold", colors[idx % colors.length])}>
                      {skill}
                    </div>
                  )
                })
              ) : (
                <div className="px-3 py-1.5 border border-white/30 rounded-lg text-sm font-bold text-white/50">
                  Unknown
                </div>
              )}
            </div>
          </div>

          {/* Personality Traits */}
          <div>
            <div className="text-xs font-black text-white/70 uppercase tracking-wider mb-2">✨ Personality</div>
            <div className="flex flex-wrap gap-2">
              {(analysis?.personalityTraits && analysis.personalityTraits.length > 0) ? (
                analysis.personalityTraits.map((trait, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-foreground/5 border border-border rounded-full text-sm font-medium text-white">
                    {trait}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1.5 bg-foreground/5 border border-border rounded-full text-sm font-medium text-white/50">
                  Unknown
                </span>
              )}
            </div>
          </div>

          {/* Breakout Scenes - compact mobile view */}
          <div>
            <div className="text-xs font-black text-white/70 uppercase tracking-wider mb-2">⭐ Breakout Scenes</div>
            {(analysis?.breakoutScenes && analysis.breakoutScenes.length > 0) ? (
              <div className="space-y-1">
                {analysis.breakoutScenes.map((scene, idx) => {
                  const colors = [
                    'text-orange-400',
                    'text-cyan-400',
                    'text-purple-400',
                  ]

                  return (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className={cn("font-black w-8 text-right", colors[idx])}>{scene.lineCount}</span>
                      <span className="text-white/40">→</span>
                      <span className="text-white/80 truncate flex-1">{scene.sceneName}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-sm text-white/50">No breakout scenes</div>
            )}
          </div>

        </div>

        {/* Card Footer */}
        <div className="px-6 py-5 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-t border-border/30">
          <button
            className={cn(
              "w-full py-4 rounded-xl text-base font-black transition-opacity shadow-lg",
              isSelected
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                : "bg-gradient-to-r from-primary to-accent text-black hover:opacity-90"
            )}
          >
            {isSelected ? (
              <span className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                ROLE SELECTED
              </span>
            ) : (
              "SELECT THIS ROLE"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
