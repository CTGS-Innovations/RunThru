import { create } from 'zustand'
import { ParsedScript, RehearsalSession } from '@/types'

interface SessionState {
  sessionId: string | null
  script: ParsedScript | null
  currentSceneIndex: number
  currentLineIndex: number
  userRole: string[]
  isPlaying: boolean

  // Actions
  setSession: (session: RehearsalSession) => void
  nextLine: () => void
  prevLine: () => void
  jumpToLine: (sceneIndex: number, lineIndex: number) => void
  togglePlayback: () => void
  reset: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  script: null,
  currentSceneIndex: 0,
  currentLineIndex: 0,
  userRole: [],
  isPlaying: false,

  setSession: (session) =>
    set({
      sessionId: session.id,
      currentSceneIndex: session.currentSceneIndex,
      currentLineIndex: session.currentLineIndex,
      userRole: session.userRole,
    }),

  nextLine: () =>
    set((state) => {
      if (!state.script) return state

      const scene = state.script.scenes[state.currentSceneIndex]
      if (!scene) return state

      // Move to next line in current scene
      if (state.currentLineIndex + 1 < scene.lines.length) {
        return { currentLineIndex: state.currentLineIndex + 1 }
      }

      // Move to first line of next scene
      if (state.currentSceneIndex + 1 < state.script.scenes.length) {
        return {
          currentSceneIndex: state.currentSceneIndex + 1,
          currentLineIndex: 0,
        }
      }

      // End of script
      return { isPlaying: false }
    }),

  prevLine: () =>
    set((state) => {
      if (!state.script) return state

      // Move to previous line in current scene
      if (state.currentLineIndex > 0) {
        return { currentLineIndex: state.currentLineIndex - 1 }
      }

      // Move to last line of previous scene
      if (state.currentSceneIndex > 0) {
        const prevScene = state.script.scenes[state.currentSceneIndex - 1]
        return {
          currentSceneIndex: state.currentSceneIndex - 1,
          currentLineIndex: prevScene ? prevScene.lines.length - 1 : 0,
        }
      }

      return state
    }),

  jumpToLine: (sceneIndex, lineIndex) =>
    set({ currentSceneIndex: sceneIndex, currentLineIndex: lineIndex }),

  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),

  reset: () =>
    set({
      sessionId: null,
      script: null,
      currentSceneIndex: 0,
      currentLineIndex: 0,
      userRole: [],
      isPlaying: false,
    }),
}))
