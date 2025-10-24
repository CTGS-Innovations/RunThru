'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface AuthState {
  isLoading: boolean
  isPinAuthenticated: boolean
  isLobbyParticipant: boolean
  hasAnyAuth: boolean
  pin: string | null
  lobbyToken: string | null
  playerName: string | null
}

/**
 * Authentication hook for RunThru
 *
 * Supports two authentication types:
 * 1. PIN authentication (full access to all features)
 * 2. Lobby participant (limited access to specific lobby/rehearsal)
 */
export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true, // CRITICAL: Start as loading to prevent premature redirects
    isPinAuthenticated: false,
    isLobbyParticipant: false,
    hasAnyAuth: false,
    pin: null,
    lobbyToken: null,
    playerName: null,
  })

  useEffect(() => {
    // Check localStorage for authentication
    const pin = localStorage.getItem('runthru_pin')
    const lobbyToken = localStorage.getItem('runthru_lobby_token')
    const playerName = localStorage.getItem('runthru_player_name')

    console.log('[useAuth] Checking localStorage:', { pin: !!pin, lobbyToken: !!lobbyToken, playerName: !!playerName })

    const isPinAuthenticated = !!pin
    const isLobbyParticipant = !!(lobbyToken && playerName)
    const hasAnyAuth = isPinAuthenticated || isLobbyParticipant

    setAuthState({
      isLoading: false, // Done loading
      isPinAuthenticated,
      isLobbyParticipant,
      hasAnyAuth,
      pin,
      lobbyToken,
      playerName,
    })
  }, [])

  return authState
}

/**
 * Auth guard for pages that require PIN authentication
 * Redirects to home page if not authenticated
 */
export function useRequirePin() {
  const router = useRouter()
  const { isLoading, isPinAuthenticated } = useAuth()

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) {
      console.log('[useRequirePin] Still loading auth state...')
      return
    }

    // Now we know the real auth state
    if (!isPinAuthenticated) {
      console.log('[useRequirePin] No PIN found - redirecting to home')
      router.push('/')
    } else {
      console.log('[useRequirePin] PIN authenticated - allowing access')
    }
  }, [isLoading, isPinAuthenticated, router])

  return { isChecking: isLoading, isPinAuthenticated }
}

/**
 * Auth guard for pages that require either PIN or lobby participation
 * Redirects to home page if no authentication
 */
export function useRequireAuth() {
  const router = useRouter()
  const { isLoading, hasAnyAuth } = useAuth()

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) {
      console.log('[useRequireAuth] Still loading auth state...')
      return
    }

    // Now we know the real auth state
    if (!hasAnyAuth) {
      console.log('[useRequireAuth] No authentication found - redirecting to home')
      router.push('/')
    } else {
      console.log('[useRequireAuth] Authenticated - allowing access')
    }
  }, [isLoading, hasAnyAuth, router])

  return { isChecking: isLoading, hasAnyAuth }
}

/**
 * Logout function - clears all authentication
 */
export function logout() {
  localStorage.removeItem('runthru_pin')
  localStorage.removeItem('runthru_lobby_token')
  localStorage.removeItem('runthru_player_name')
  localStorage.removeItem('runthru_participant_id')

  console.log('[Auth] Logged out - all credentials cleared')
}
