/**
 * Custom hooks for session and voice assignment operations
 * Uses React Query for server state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiConfig } from '@/lib/api';
import type { VoicePreset, VoiceAssignment, Session, Character } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface CreateSessionInput {
  scriptId: string;
  selectedCharacter: string;
}

interface CreateSessionResponse {
  session: Session;
}

interface SessionResponse {
  session: Session;
  script: {
    id: string;
    title: string;
    characters: Character[];
    scenes: any[];
  } | null;
}

interface VoicesResponse {
  presets: VoicePreset[];
}

interface ShuffleVoicesResponse {
  voiceAssignments: VoiceAssignment[];
}

interface UpdateVoiceInput {
  characterId: string;
  voicePresetId?: string;
  gender?: number;
  emotion?: number;
  age?: number;
}

interface UpdateVoiceResponse {
  voiceAssignment: VoiceAssignment;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Fetch all voice presets
 * Cached for 1 hour (presets rarely change)
 */
export function useVoices() {
  return useQuery<VoicePreset[]>({
    queryKey: ['voices'],
    queryFn: async () => {
      const response = await fetch(`${apiConfig.baseURL}/api/voices`);
      if (!response.ok) {
        throw new Error('Failed to fetch voice presets');
      }
      const data: VoicesResponse = await response.json();
      return data.presets;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Create new rehearsal session with random voice assignments
 * Invalidates sessions cache on success
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation<Session, Error, CreateSessionInput>({
    mutationFn: async (input: CreateSessionInput) => {
      const response = await fetch(`${apiConfig.baseURL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create session');
      }

      const data: CreateSessionResponse = await response.json();
      return data.session;
    },
    onSuccess: () => {
      // Invalidate sessions cache
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

/**
 * Fetch session by ID with script metadata
 */
export function useSession(sessionId: string | null) {
  return useQuery<SessionResponse>({
    queryKey: ['sessions', sessionId],
    queryFn: async () => {
      const response = await fetch(`${apiConfig.baseURL}/api/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }
      return response.json();
    },
    enabled: !!sessionId,
  });
}

/**
 * Shuffle all voice assignments for a session
 * Invalidates session cache on success
 */
export function useShuffleVoices(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation<VoiceAssignment[], Error>({
    mutationFn: async () => {
      const response = await fetch(`${apiConfig.baseURL}/api/sessions/${sessionId}/shuffle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to shuffle voices');
      }

      const data: ShuffleVoicesResponse = await response.json();
      return data.voiceAssignments;
    },
    onSuccess: () => {
      // Invalidate this session's cache
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] });
    },
  });
}

/**
 * Update voice assignment for a single character
 * Invalidates session cache on success
 */
export function useUpdateVoice(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation<VoiceAssignment, Error, UpdateVoiceInput>({
    mutationFn: async (input: UpdateVoiceInput) => {
      const response = await fetch(`${apiConfig.baseURL}/api/sessions/${sessionId}/voice`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update voice assignment');
      }

      const data: UpdateVoiceResponse = await response.json();
      return data.voiceAssignment;
    },
    onSuccess: () => {
      // Invalidate this session's cache
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] });
    },
  });
}
