/**
 * Custom hooks for script CRUD operations
 * Uses React Query for server state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiConfig } from '@/lib/api';
import type { Script, ParsedScript } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface ScriptListItem {
  id: string;
  title: string;
  characterCount: number;
  sceneCount: number;
  createdAt: string;
}

interface UploadScriptResponse {
  id: string;
  title: string;
  characterCount: number;
  sceneCount: number;
  createdAt: string;
  parsed: ParsedScript;
}

interface ScriptDetailResponse {
  id: string;
  title: string;
  markdown: string;
  parsed: ParsedScript;
  analysis?: any;  // Sprint 4: OpenAI character analysis
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Fetch all scripts
 * Cached for 5 minutes
 */
export function useScripts() {
  return useQuery<ScriptListItem[]>({
    queryKey: ['scripts'],
    queryFn: async () => {
      const response = await fetch(`${apiConfig.baseURL}/api/scripts`);
      if (!response.ok) {
        throw new Error('Failed to fetch scripts');
      }
      const data = await response.json();
      return data.scripts;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch single script by ID
 */
export function useScript(id: string) {
  return useQuery<ScriptDetailResponse>({
    queryKey: ['scripts', id],
    queryFn: async () => {
      const response = await fetch(`${apiConfig.baseURL}/api/scripts/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch script');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

/**
 * Upload new script
 * Invalidates script list cache on success
 */
export function useUploadScript() {
  const queryClient = useQueryClient();

  return useMutation<UploadScriptResponse, Error, string>({
    mutationFn: async (markdown: string) => {
      const response = await fetch(`${apiConfig.baseURL}/api/scripts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markdown }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload script');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch scripts list
      queryClient.invalidateQueries({ queryKey: ['scripts'] });
    },
  });
}

/**
 * Delete script by ID
 * Invalidates script list cache on success
 */
export function useDeleteScript() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(`${apiConfig.baseURL}/api/scripts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete script');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch scripts list
      queryClient.invalidateQueries({ queryKey: ['scripts'] });
    },
  });
}
