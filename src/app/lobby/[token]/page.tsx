'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sparkles, Users, Loader2, AlertCircle } from 'lucide-react'
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

type Phase = 'name' | 'character-select' | 'waiting'

export default function LobbyJoinPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [phase, setPhase] = useState<Phase>('name')
  const [playerName, setPlayerName] = useState('')
  const [participantId, setParticipantId] = useState<number | null>(null)
  const [error, setError] = useState('')

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
      await selectCharacter.mutateAsync({ token, participantId, characterName })
      setPhase('waiting')
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

      {/* Phase 2: Character Selection */}
      {phase === 'character-select' && parsedScript && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Choose Your Character</h2>
            <p className="text-slate-400">
              Welcome, <span className="text-cyan-400">{playerName}</span>!
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parsedScript.characters.map((character: any) => {
              const isTaken = takenCharacters.has(character.name)
              return (
                <div
                  key={character.name}
                  className={isTaken ? 'opacity-50 cursor-not-allowed' : ''}
                  onClick={() => !isTaken && handleCharacterSelect(character.name)}
                >
                  <CharacterCard
                    character={character}
                    onClick={() => {}}
                    isSelected={false}
                    isDisabled={isTaken || selectCharacter.isPending}
                    showPortrait={true}
                    scriptId={lobbyInfo.data?.scriptId || ''}
                  />
                  {isTaken && (
                    <div className="text-center mt-2 text-sm text-red-400">Taken</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Phase 3: Waiting Room */}
      {phase === 'waiting' && parsedScript && participants.data && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">
              {isHost ? 'Your Lobby' : 'Waiting for Host'}
            </h2>
            <p className="text-slate-400">
              You're playing:{' '}
              <span className="text-cyan-400 font-semibold">{currentParticipant?.characterName}</span>
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="max-w-2xl mx-auto">
            <LobbyStatus
              participants={participants.data}
              totalCharacters={parsedScript.characters.length}
            />
          </div>

          {isHost && (
            <div className="max-w-md mx-auto">
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
            </div>
          )}

          {!isHost && (
            <div className="max-w-md mx-auto text-center">
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Waiting for host to start rehearsal...</span>
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
