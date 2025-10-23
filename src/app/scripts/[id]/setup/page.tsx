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
import { Shuffle, Sparkles, Zap, CheckCircle2, Play } from 'lucide-react'
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
  const isReady = assignedCount === totalCharacters && totalCharacters > 0

  // Handlers
  const handleCharacterSelect = async (characterName: string) => {
    setSelectedCharacter(characterName)
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
    router.push(`/rehearsal/${sessionId}`)
  }

  // Loading states
  if (scriptLoading || voicesLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className="h-32" />
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
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Zap className="w-8 h-8 text-amber-500" />
            {scriptData.title}
          </h1>
          <p className="text-muted-foreground mt-1">Assemble your cast</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-500">
            {assignedCount}/{totalCharacters}
          </div>
          <div className="text-sm text-muted-foreground">Team Ready</div>
        </div>
      </div>

      {!selectedCharacter ? (
        /* STEP 1: Character Selection - Hero Picker */
        <div className="space-y-6">
          <Card className="border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Step 1: Choose Your Role</h2>
                  <p className="text-muted-foreground">Pick the character you want to play</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {characters.map((character) => (
              <CharacterCard
                key={character.name}
                character={{
                  id: character.name,
                  name: character.name,
                  lineCount: character.lineCount,
                  firstAppearance: character.firstAppearance
                }}
                isSelected={false}
                onClick={() => handleCharacterSelect(character.name)}
              />
            ))}
          </div>
        </div>
      ) : (
        /* STEP 2: Voice Assignment - Team Builder */
        <div className="space-y-6">
          {/* Your Character Badge */}
          <Card className="border-2 border-cyan-500/50 bg-gradient-to-r from-cyan-500/10 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center text-3xl">
                    🎭
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">You're playing</div>
                    <div className="text-2xl font-bold text-cyan-400">{selectedCharacter}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCharacter(null)
                    setSessionId(null)
                  }}
                >
                  Change Character
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Cast Assembly</div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShuffle}
                  disabled={shuffleVoices.isPending}
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  {shuffleVoices.isPending ? 'Shuffling...' : 'Shuffle All'}
                </Button>
              </div>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Voice Assignment Cards - Compact */}
          <div className="grid gap-3">
            {characters.map((character) => {
              const assignment = voiceAssignments.find(va => va.characterId === character.name)
              if (!assignment) return null

              const isExpanded = expandedCharacter === character.name
              const preset = voices.find(v => v.id === assignment.voicePresetId)

              return (
                <Card
                  key={character.name}
                  className={isExpanded ? 'border-amber-500/50' : ''}
                >
                  <CardContent className="p-4">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedCharacter(isExpanded ? null : character.name)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-xl">
                          🎭
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold">{character.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {preset?.name || 'Unknown Voice'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-muted-foreground">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-4">
                        <div>
                          <div className="text-sm font-medium mb-2">Voice Preset</div>
                          <VoicePresetSelector
                            presets={voices}
                            selectedPreset={assignment.voicePresetId}
                            onSelect={(presetId) => handlePresetChange(character.name, presetId)}
                          />
                        </div>

                        <VoiceSliders
                          gender={assignment.gender}
                          emotion={assignment.emotion}
                          age={assignment.age}
                          onChange={(param, value) => handleVoiceChange(character.name, param, value)}
                          onReset={() => handleResetToPreset(character.name)}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Launch Button */}
          <Button
            size="lg"
            onClick={handleStartRehearsal}
            disabled={!isReady}
            className="w-full h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-xl shadow-lg shadow-green-500/30 disabled:opacity-50"
          >
            <Play className="w-6 h-6 mr-3" />
            {isReady ? 'LAUNCH REHEARSAL' : `Assign ${totalCharacters - assignedCount} more voices`}
            <Play className="w-6 h-6 ml-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
