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
  const { data: playbackInfo, isLoading } = useQuery<PlaybackInfo>({
    queryKey: ['playback', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}/playback`)
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

  // Reset playback to beginning
  const resetMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}/reset`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to reset playback')
      }
      const data = await response.json()
      return data.playback
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['playback', sessionId], data)
    },
  })

  return {
    playbackInfo,
    isLoading,
    play: playMutation.mutate,
    advance: advanceMutation.mutate,
    reset: resetMutation.mutate,
    isPlaying: playbackInfo?.playbackState === 'playing',
    isPaused: playbackInfo?.playbackState === 'paused',
    isComplete: playbackInfo?.isComplete || false,
  }
}
