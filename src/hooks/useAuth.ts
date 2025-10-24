'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface AuthState {
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

    const isPinAuthenticated = !!pin
    const isLobbyParticipant = !!(lobbyToken && playerName)
    const hasAnyAuth = isPinAuthenticated || isLobbyParticipant

    setAuthState({
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
  const { isPinAuthenticated } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isPinAuthenticated) {
      console.log('[Auth] PIN required - redirecting to home')
      router.push('/')
    } else {
      setIsChecking(false)
    }
  }, [isPinAuthenticated, router])

  return { isChecking, isPinAuthenticated }
}

/**
 * Auth guard for pages that require either PIN or lobby participation
 * Redirects to home page if no authentication
 */
export function useRequireAuth() {
  const router = useRouter()
  const { hasAnyAuth } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!hasAnyAuth) {
      console.log('[Auth] Authentication required - redirecting to home')
      router.push('/')
    } else {
      setIsChecking(false)
    }
  }, [hasAnyAuth, router])

  return { isChecking, hasAnyAuth }
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
