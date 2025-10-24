import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// ============================================================================
// Types
// ============================================================================

export interface Participant {
  id: number
  sessionId: string
  playerName: string
  characterName: string | null
  isAI: boolean
  isHost: boolean
  isReady: boolean
  joinedAt: string
}

export interface LobbySession {
  id: string
  scriptId: string
  shareableToken: string
  expiresAt: string
  isActive: boolean
  startedAt: string | null
  createdAt: string
}

export interface SessionConfig {
  sessionId: string
  scriptId: string
  participants: Array<{
    playerName: string
    characterName: string
    isAI: boolean
  }>
  startedAt: string
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Create a new multiplayer lobby
 * Requires PIN in headers
 */
export function useCreateLobby() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      scriptId,
      creatorName,
    }: {
      scriptId: string
      creatorName: string
    }) => {
      const pin = localStorage.getItem('runthru_pin')
      if (!pin) {
        throw new Error('No PIN found. Please log in again.')
      }

      const response = await fetch(`${API_BASE}/api/lobbies/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-pin': pin,
        },
        body: JSON.stringify({ scriptId, creatorName }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create lobby')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lobbies'] })
    },
  })
}

/**
 * Join a lobby as a participant
 */
export function useJoinLobby() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ token, playerName }: { token: string; playerName: string }) => {
      const response = await fetch(`${API_BASE}/api/lobbies/${token}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerName }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to join lobby')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lobby', variables.token] })
      queryClient.invalidateQueries({ queryKey: ['participants', variables.token] })
    },
  })
}

/**
 * Get all participants in a lobby
 * Use this for polling (every 2 seconds)
 */
export function useLobbyParticipants(token: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['participants', token],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/lobbies/${token}/participants`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to get participants')
      }

      const data = await response.json()
      return data.participants as Participant[]
    },
    enabled,
    refetchInterval: 2000, // Poll every 2 seconds
    refetchIntervalInBackground: true,
  })
}

/**
 * Select a character for a participant
 */
export function useSelectCharacter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      token,
      participantId,
      characterName,
    }: {
      token: string
      participantId: number
      characterName: string
    }) => {
      const response = await fetch(`${API_BASE}/api/lobbies/${token}/select`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId, characterName }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to select character')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['participants', variables.token] })
    },
  })
}

/**
 * Start rehearsal (host only)
 * Auto-assigns AI to unselected characters
 */
export function useStartRehearsal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      token,
      hostParticipantId,
    }: {
      token: string
      hostParticipantId: number
    }) => {
      const response = await fetch(`${API_BASE}/api/lobbies/${token}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hostParticipantId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to start rehearsal')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lobby', variables.token] })
      queryClient.invalidateQueries({ queryKey: ['participants', variables.token] })
    },
  })
}

/**
 * Get lobby information
 */
export function useLobbyInfo(token: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['lobby', token],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/lobbies/${token}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to get lobby info')
      }

      const data = await response.json()
      return data.lobby as LobbySession
    },
    enabled,
  })
}

/**
 * Get session config for rehearsal page
 */
export function useSessionConfig(sessionId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['sessionConfig', sessionId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/config`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to get session config')
      }

      const data = await response.json()
      return data.config as SessionConfig
    },
    enabled,
  })
}
