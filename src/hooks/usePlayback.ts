/**
 * usePlayback Hook
 * Manages rehearsal playback state and audio progression
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ============================================================================
// Types (matching backend PlaybackService)
// ============================================================================

export type PlaybackState = 'playing' | 'paused' | 'waiting_for_user'

export interface EnrichedDialogueLine {
  id: string
  type: 'dialogue'
  character: string
  text: string
  sceneNumber?: number
  isAI: boolean
  playerName?: string
  audioUrl?: string
}

export interface PlaybackInfo {
  sessionId: string
  currentLineIndex: number
  playbackState: PlaybackState
  currentLine: EnrichedDialogueLine | null
  nextLine: EnrichedDialogueLine | null
  totalLines: number
  isComplete: boolean
}

interface UsePlaybackOptions {
  sessionId: string
  enabled?: boolean
  pollingInterval?: number
}

// ============================================================================
// Hooks
// ============================================================================

export function usePlayback({ sessionId, enabled = true, pollingInterval = 500 }: UsePlaybackOptions) {
  const queryClient = useQueryClient()

  // Get current playback state (polls every 500ms)
  const { data: playbackInfo, isLoading, error } = useQuery<PlaybackInfo>({
    queryKey: ['playback', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}/playback`)

      // Session ended by host (410 Gone)
      if (response.status === 410) {
        // Redirect to home page
        window.location.href = '/'
        throw new Error('Session ended by host')
      }

      if (!response.ok) {
        throw new Error('Failed to fetch playback state')
      }
      const data = await response.json()
      return data.playback
    },
    enabled,
    refetchInterval: pollingInterval, // Poll for updates
    refetchIntervalInBackground: true,
    staleTime: 0, // Always fetch fresh data
    retry: (failureCount, error: any) => {
      // Don't retry if session ended
      if (error?.message === 'Session ended by host') {
        return false
      }
      return failureCount < 3
    }
  })

  // Start/resume playback
  const playMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}/play`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to start playback')
      }
      const data = await response.json()
      return data.playback
    },
    onSuccess: (data) => {
      // Optimistic update
      queryClient.setQueryData(['playback', sessionId], data)
    },
  })

  // Advance to next line (requires participantId from localStorage)
  const advanceMutation = useMutation({
    mutationFn: async () => {
      // Get participantId from localStorage (set during lobby join)
      const participantId = localStorage.getItem('runthru_participant_id')

      if (!participantId) {
        throw new Error('Participant ID not found. Please rejoin the session.')
      }

      const response = await fetch(`/api/sessions/${sessionId}/advance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId: parseInt(participantId, 10) }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to advance line')
      }

      const data = await response.json()
      return data.playback
    },
    onSuccess: (data) => {
      // Optimistic update
      queryClient.setQueryData(['playback', sessionId], data)
    },
  })

  // Reset playback to beginning (host only)
  const resetMutation = useMutation({
    mutationFn: async () => {
      const participantId = localStorage.getItem('runthru_participant_id')

      if (!participantId) {
        throw new Error('Participant ID not found. Please rejoin the session.')
      }

      const response = await fetch(`/api/sessions/${sessionId}/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId: parseInt(participantId, 10) }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to reset playback')
      }

      const data = await response.json()
      return data.playback
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['playback', sessionId], data)
    },
  })

  // Go back one line (host only)
  const previousMutation = useMutation({
    mutationFn: async () => {
      const participantId = localStorage.getItem('runthru_participant_id')

      if (!participantId) {
        throw new Error('Participant ID not found. Please rejoin the session.')
      }

      const response = await fetch(`/api/sessions/${sessionId}/previous`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId: parseInt(participantId, 10) }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to go to previous line')
      }

      const data = await response.json()
      return data.playback
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['playback', sessionId], data)
    },
  })

  // Pause playback
  const pauseMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}/pause`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to pause playback')
      }
      const data = await response.json()
      return data.playback
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['playback', sessionId], data)
    },
  })

  // End session (host only)
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      const participantId = localStorage.getItem('runthru_participant_id')

      if (!participantId) {
        throw new Error('Participant ID not found. Please rejoin the session.')
      }

      const response = await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId: parseInt(participantId, 10) }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to end session')
      }

      const data = await response.json()
      return data
    },
  })

  return {
    playbackInfo,
    isLoading,
    play: playMutation.mutate,
    pause: pauseMutation.mutate,
    advance: advanceMutation.mutate,
    previous: previousMutation.mutate,
    reset: resetMutation.mutate,
    endSession: endSessionMutation.mutate,
    isPlaying: playbackInfo?.playbackState === 'playing',
    isPaused: playbackInfo?.playbackState === 'paused',
    isComplete: playbackInfo?.isComplete || false,
  }
}
