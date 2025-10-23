import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CharacterCardProps {
  character: {
    id: string
    name: string
    lineCount: number
    firstAppearance: number
  }
  isSelected: boolean
  onClick: () => void
}

export function CharacterCard({ character, isSelected, onClick }: CharacterCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200",
        "hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 hover:border-cyan-500/50",
        isSelected && "border-4 border-amber-500 shadow-xl shadow-amber-500/40 animate-pulse"
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
      <CardHeader className="space-y-4">
        <div className="flex justify-between items-start">
          <span className="text-4xl" role="img" aria-label="Theater mask">🎭</span>
          {isSelected && (
            <Check className="w-8 h-8 text-amber-500" aria-label="Selected" />
          )}
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">{character.name}</CardTitle>
          <CardDescription className="text-sm mt-2">
            {character.lineCount} lines · First appears in Scene {character.firstAppearance}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  )
}
