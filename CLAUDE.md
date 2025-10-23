# RunThru Frontend

## 🎯 Focus Area
This worktree contains **ONLY frontend code**. Backend API and TTS service are in the `RunThru-backend/` worktree.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18
- **Component Library**: shadcn/ui (Radix UI + Tailwind)
- **Styling**: Tailwind CSS 3
- **Language**: TypeScript 5
- **State Management**: Zustand 4
- **Audio**: Web Audio API + WaveSurfer.js
- **HTTP Client**: Native fetch with custom wrapper
- **Validation**: Zod

## Why shadcn/ui?
- **Proven**: User has success with it in production
- **Ownership**: Components copied into our codebase, fully customizable
- **Accessibility**: Built on Radix UI (keyboard nav, screen readers, ARIA)
- **Speed**: Pre-built Dialog, Card, Button, Progress, Slider, etc.
- **Tailwind-native**: Consistent with our design system

## Directory Structure
```
frontend/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home/welcome
│   │   ├── login/                # PIN entry
│   │   ├── scripts/              # Script library
│   │   └── rehearsal/            # Active rehearsal
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components (40+ primitives)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── progress.tsx
│   │   │   └── slider.tsx
│   │   ├── script/               # Script-related components
│   │   │   ├── ScriptUploader.tsx    # Uses Dialog, Input
│   │   │   ├── ScriptCard.tsx        # Uses Card, Button
│   │   │   └── VoiceSelector.tsx     # Uses Select
│   │   ├── rehearsal/            # Rehearsal-specific components
│   │   │   ├── LineDisplay.tsx       # Uses Card
│   │   │   ├── AudioPlayer.tsx       # Uses Slider, Button
│   │   │   └── ProgressBar.tsx       # Uses Progress
│   │   └── layout/               # Header, Footer, etc
│   ├── lib/
│   │   ├── api.ts                # API client
│   │   ├── audio.ts              # Audio playback utilities
│   │   └── utils.ts              # cn() helper + general utilities
│   ├── hooks/
│   │   ├── useAuth.ts            # PIN authentication
│   │   ├── useScripts.ts         # Script CRUD operations
│   │   ├── useRehearsalSession.ts # Session state management
│   │   └── useAudioQueue.ts      # Audio playback queue
│   ├── stores/
│   │   ├── authStore.ts          # Auth state (Zustand)
│   │   ├── sessionStore.ts       # Rehearsal session state
│   │   └── audioStore.ts         # Audio playback state
│   └── types/
│       ├── script.ts             # Script and line types
│       ├── session.ts            # Session types
│       ├── audio.ts              # Audio types
│       └── api.ts                # API response types
├── public/
│   └── assets/
├── components.json               # shadcn/ui config
├── tailwind.config.js
├── next.config.js
└── package.json
```

## Backend API
Backend runs at: `http://localhost:4000` (or configured via `NEXT_PUBLIC_API_URL`)

Key endpoints (implemented in RunThru-backend):
- `POST /api/auth/verify` - PIN verification
- `GET /api/scripts` - List all scripts
- `POST /api/scripts` - Upload new script
- `GET /api/scripts/:id` - Get script details
- `POST /api/sessions` - Create rehearsal session
- `GET /api/audio/:scriptId/:lineId` - Stream audio file

See `docs/ARCHITECTURE.md` for full API specification.

## Design System
- **Colors** (kid-friendly, professional):
  - Background: Dark charcoal `#1a1a1a`
  - User lines: Amber `#ffbf00` / Tailwind `amber-500`
  - AI lines: Cyan `#00d9ff` / Tailwind `cyan-400`
  - Accents: Magenta `#ff006e` / Tailwind `pink-600`
  - Text: Off-white `#f5f5f5` / Tailwind `gray-100`
- **Typography**:
  - Headers: Inter/Poppins (bold)
  - Body: System fonts (readable)
  - Monospace: Roboto Mono
- **Responsive**: Mobile-first, breakpoints at 640px (tablet), 1024px (desktop)
- **shadcn theming**: Customize in `app/globals.css` using CSS variables

## State Management Pattern
Using **Zustand** for global state:
- Minimal boilerplate
- Excellent performance (no context re-render issues)
- Good devtools
- Small bundle size (1KB)

Example store:
```typescript
export const useSessionStore = create<SessionState>((set) => ({
  currentLineIndex: 0,
  isPlaying: false,
  nextLine: () => set((state) => ({
    currentLineIndex: state.currentLineIndex + 1
  })),
}));
```

## Development
```bash
cd frontend
npm install
npm run dev  # Runs on localhost:3000
```

## Adding shadcn/ui Components
```bash
npx shadcn-ui@latest add [component-name]
# Example: npx shadcn-ui@latest add dialog
```

Components are copied to `src/components/ui/` and can be customized freely.

## Task Tracking
**Check TASKS.md** (symlinked from main) at start of session:
- See current sprint and your frontend tasks
- Mark tasks [x] as you complete them
- Commit: `git add TASKS.md && git commit -m "tasks: Complete X"`
- Notify @corey when you hit 🔍 CHECKPOINT markers

**TASKS.md is shared** across all three worktrees - updates here are visible everywhere.

## Context Strategy
When working in this frontend worktree:

1. **Use frontend-specialist for research**:
   ```
   use frontend-specialist to analyze the script upload UI requirements
   ```

2. **Plans saved to** `.claude/docs/frontend-plan.md` (symlinked from main)

3. **Update TASKS.md** as you complete tasks

4. **Use /clear between features** to keep context clean

5. **DO NOT modify backend code** - that's in RunThru-backend/

## Key Rules
- ✅ Build UI components, pages, and client-side logic
- ✅ Use shadcn/ui components as building blocks
- ✅ Customize shadcn components in place (they're ours now)
- ✅ Use Tailwind for styling (shadcn uses Tailwind classes)
- ✅ TypeScript strict mode - no `any` types
- ✅ Responsive design - test on mobile sizes
- ❌ Do NOT create backend endpoints here
- ❌ Do NOT modify database schemas
- ❌ Do NOT touch TTS service code

## Notes for Claude
- Target users are teens (13-18) - keep UI simple and intuitive
- Large text, obvious buttons, mobile-friendly
- Audio playback is critical - smooth, responsive controls
- Use Web Audio API for low-latency playback
- shadcn components are customizable - adjust for teen-friendly aesthetic
- Keep animations subtle (not distracting during rehearsal)
