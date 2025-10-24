'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CharacterCard } from '@/components/session/CharacterCard'
import { VoicePresetSelector } from '@/components/session/VoicePresetSelector'
import { VoiceSliders } from '@/components/session/VoiceSliders'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useScript } from '@/hooks/useScripts'
import { useVoices, useCreateSession, useSession, useShuffleVoices, useUpdateVoice } from '@/hooks/useSessions'
import { Shuffle, Sparkles } from 'lucide-react'
import type { Character, VoiceAssignment } from '@/types'

export default function SessionSetupPage() {
  const params = useParams()
  const router = useRouter()
  const scriptId = params.id as string

  // State
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [expandedCharacter, setExpandedCharacter] = useState<string | null>(null)

  // Queries
  const { data: scriptData, isLoading: scriptLoading } = useScript(scriptId)
  const { data: voices, isLoading: voicesLoading } = useVoices()
  const { data: sessionData, isLoading: sessionLoading } = useSession(sessionId)

  // Mutations
  const createSession = useCreateSession()
  const shuffleVoices = useShuffleVoices(sessionId || '')
  const updateVoice = useUpdateVoice(sessionId || '')

  // Derived state
  const characters: Character[] = scriptData?.parsed?.characters || []
  const voiceAssignments: VoiceAssignment[] = sessionData?.session?.voiceAssignments || []
  const assignedCount = voiceAssignments.length
  const totalCharacters = characters.length
  const progress = totalCharacters > 0 ? (assignedCount / totalCharacters) * 100 : 0

  // Handlers
  const handleCharacterSelect = async (characterName: string) => {
    setSelectedCharacter(characterName)

    // Create session with this character
    try {
      const session = await createSession.mutateAsync({
        scriptId,
        selectedCharacter: characterName
      })
      setSessionId(session.id)
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const handleShuffle = async () => {
    if (!sessionId) return

    try {
      await shuffleVoices.mutateAsync()
    } catch (error) {
      console.error('Failed to shuffle voices:', error)
    }
  }

  const handleVoiceChange = async (
    characterId: string,
    param: 'gender' | 'emotion' | 'age',
    value: number
  ) => {
    if (!sessionId) return

    try {
      await updateVoice.mutateAsync({
        characterId,
        [param]: value
      })
    } catch (error) {
      console.error('Failed to update voice:', error)
    }
  }

  const handlePresetChange = async (characterId: string, voicePresetId: string) => {
    if (!sessionId) return

    try {
      const preset = voices?.find(v => v.id === voicePresetId)
      if (!preset) return

      await updateVoice.mutateAsync({
        characterId,
        voicePresetId,
        gender: preset.defaultParams.gender,
        emotion: preset.defaultParams.emotion,
        age: preset.defaultParams.age
      })
    } catch (error) {
      console.error('Failed to update preset:', error)
    }
  }

  const handleResetToPreset = async (characterId: string) => {
    if (!sessionId) return

    const assignment = voiceAssignments.find(va => va.characterId === characterId)
    if (!assignment) return

    const preset = voices?.find(v => v.id === assignment.voicePresetId)
    if (!preset) return

    try {
      await updateVoice.mutateAsync({
        characterId,
        gender: preset.defaultParams.gender,
        emotion: preset.defaultParams.emotion,
        age: preset.defaultParams.age
      })
    } catch (error) {
      console.error('Failed to reset voice:', error)
    }
  }

  const handleStartRehearsal = () => {
    // Navigate to rehearsal page (to be implemented in Sprint 5)
    router.push(`/rehearsal/${sessionId}`)
  }

  // Loading states
  if (scriptLoading || voicesLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    )
  }

  if (!scriptData || !voices) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Script not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{scriptData.title}</h1>
        <p className="text-muted-foreground">Set up your rehearsal session</p>
      </div>

      {/* Step 1: Character Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold">Step 1: Select Your Character</h2>
          {selectedCharacter && (
            <span className="text-sm text-muted-foreground">
              (Playing as: <span className="font-medium text-foreground">{selectedCharacter}</span>)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <CharacterCard
              key={character.name}
              character={{
                id: character.name,
                name: character.name,
                lineCount: character.lineCount,
                firstAppearance: character.firstAppearance
              }}
              isSelected={selectedCharacter === character.name}
              onClick={() => handleCharacterSelect(character.name)}
            />
          ))}
        </div>
      </div>

      {/* Step 2: Voice Assignment (only shown after character selection) */}
      {sessionId && sessionData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">Step 2: Assign Voices</h2>
              <p className="text-sm text-muted-foreground">
                {assignedCount} of {totalCharacters} characters assigned
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleShuffle}
                disabled={shuffleVoices.isPending}
              >
                <Shuffle className="w-4 h-4 mr-2" />
                {shuffleVoices.isPending ? 'Shuffling...' : 'Shuffle Voices'}
              </Button>
            </div>
          </div>

          <Progress value={progress} className="w-full" />

          {/* Voice assignments for each character */}
          <div className="space-y-4">
            {characters.map((character) => {
              const assignment = voiceAssignments.find(va => va.characterId === character.name)
              if (!assignment) return null

              const isExpanded = expandedCharacter === character.name
              const preset = voices.find(v => v.id === assignment.voicePresetId)

              return (
                <Card key={character.name}>
                  <CardHeader
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setExpandedCharacter(isExpanded ? null : character.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{character.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Voice: {preset?.name || 'Unknown'}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="space-y-6 pt-4">
                      {/* Preset Selector */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Voice Preset</label>
                        <VoicePresetSelector
                          presets={voices}
                          selectedPreset={assignment.voicePresetId}
                          onSelect={(presetId) => handlePresetChange(character.name, presetId)}
                        />
                      </div>

                      {/* Voice Sliders */}
                      <VoiceSliders
                        gender={assignment.gender}
                        emotion={assignment.emotion}
                        age={assignment.age}
                        onChange={(param, value) => handleVoiceChange(character.name, param, value)}
                        onReset={() => handleResetToPreset(character.name)}
                      />

                      {/* Preview button (Sprint 4) */}
                      <Button variant="outline" className="w-full" disabled>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Preview Voice (Coming Soon)
                      </Button>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>

          {/* Start Rehearsal Button */}
          <div className="flex justify-center pt-6">
            <Button
              size="lg"
              onClick={handleStartRehearsal}
              disabled={assignedCount < totalCharacters}
              className="min-w-[200px]"
            >
              Start Rehearsal
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
