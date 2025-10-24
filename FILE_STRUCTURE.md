# RunThru Frontend - File Structure & Page Flow

**Last Updated**: 2025-10-23 23:55

---

## 📱 User Journey & Pages

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER FLOW                                │
└─────────────────────────────────────────────────────────────────┘

1. Landing Page
   └─> /app/page.tsx
       • Development dashboard
       • Sprint progress cards
       • Quick navigation to scripts

2. Script Library
   └─> /app/scripts/page.tsx
       • List all uploaded scripts
       • Upload new script button
       • Click script → Go to Script Detail

3. Script Detail Page
   └─> /app/scripts/[id]/page.tsx
       ✅ IMPLEMENTED with Sprint 4 portraits
       • Shows script info (characters, scenes, lines)
       • Character grid with AI-generated portraits
       • Taglines, role badges (Lead/Featured/Ensemble)
       • "START REHEARSAL" button → Session Setup

4. Session Setup (Character Selection + Voice Assignment)
   └─> /app/scripts/[id]/setup/page.tsx
       ✅ IMPLEMENTED with Sprint 4 portraits
       • Phase 1: Choose Your Role (character selection)
         - Character cards with portraits, taglines, descriptions
         - Click character → Create session
       • Phase 2: Assemble Cast (voice assignment)
         - Voice presets + sliders for all characters
         - Shuffle button
         - "LAUNCH REHEARSAL" → Rehearsal Player

5. Rehearsal Player
   └─> /app/rehearsal/[sessionId]/page.tsx
       ⚠️ PLACEHOLDER ONLY - Needs implementation
       • Currently shows "Coming Soon" message
       • Mockup: /mockups/rehearsal-player-v4.html
```

---

## 📂 Complete File Structure

### Pages (src/app/)

```
src/app/
├── page.tsx                              ✅ Landing Page (Development Dashboard)
├── layout.tsx                            ✅ Root Layout
├── globals.css                           ✅ Global Styles (Tailwind + shadcn)
│
├── scripts/
│   ├── page.tsx                          ✅ Script Library (List View)
│   └── [id]/
│       ├── page.tsx                      ✅ Script Detail (with Sprint 4 portraits)
│       └── setup/
│           ├── page.tsx                  ✅ Session Setup (Character + Voice Selection)
│           └── page-old.tsx              🗑️ Old version (can delete)
│
└── rehearsal/
    └── [sessionId]/
        └── page.tsx                      ⚠️ Placeholder (needs full implementation)
```

### Components (src/components/)

```
src/components/
│
├── ui/                                   ✅ shadcn/ui Primitives (18 components)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── select.tsx
│   ├── slider.tsx
│   ├── progress.tsx
│   ├── label.tsx
│   ├── toast.tsx
│   ├── toaster.tsx
│   ├── dropdown-menu.tsx
│   ├── alert-dialog.tsx
│   └── skeleton.tsx
│
├── script/                               ✅ Script-related Components
│   ├── ScriptCard.tsx                    • Used in script library
│   └── ScriptUploader.tsx                • Drag-and-drop + paste upload
│
├── session/                              ✅ Session Setup Components
│   ├── CharacterCard.tsx                 • ✨ Sprint 4: Now shows AI portraits, taglines, role badges
│   ├── VoicePresetSelector.tsx           • Dropdown for 8 voice presets
│   └── VoiceSliders.tsx                  • Gender/emotion/age sliders
│
└── rehearsal/                            ❌ NOT CREATED YET
    ├── RehearsalPlayer.tsx               • ⚠️ NEEDS: Main rehearsal UI
    ├── LineDisplay.tsx                   • ⚠️ NEEDS: Current line with word-by-word highlight
    ├── AudioControls.tsx                 • ⚠️ NEEDS: Play/pause/next/prev buttons
    ├── ScriptPreview.tsx                 • ⚠️ NEEDS: "Coming Up" section (bottom panel)
    └── ProgressTracker.tsx               • ⚠️ NEEDS: Scene progress indicator
```

### Types (src/types/)

```
src/types/
└── index.ts                              ✅ All TypeScript Interfaces
    ├── Script                            • Main script type
    ├── ParsedScript                      • Parsed markdown structure
    ├── Character                         • Character metadata
    ├── Scene, Line                       • Script content
    ├── Session                           • Rehearsal session
    ├── VoicePreset                       • Voice configuration
    ├── VoiceAssignment                   • Per-character voice settings
    │
    └── Sprint 4 OpenAI Types:
        ├── ScriptAnalysis                • ✨ NEW: AI analysis container
        ├── CharacterAnalysisWithPortrait • ✨ NEW: Character + portrait data
        ├── CharacterPortrait             • ✨ NEW: DALL-E image info
        ├── ScriptMetadata                • ✨ NEW: Genre, themes, runtime
        └── SceneAnalysis                 • ✨ NEW: Scene context, moods
```

### Hooks (src/hooks/)

```
src/hooks/
├── useScripts.ts                         ✅ Script CRUD (React Query)
│   ├── useScripts()                      • List all scripts
│   ├── useScript(id)                     • Get single script
│   ├── useUploadScript()                 • Upload new script
│   └── useDeleteScript()                 • Delete script
│
├── useSessions.ts                        ✅ Session Management (React Query)
│   ├── useVoices()                       • List voice presets
│   ├── useCreateSession()                • Create session
│   ├── useSession(id)                    • Get session
│   ├── useShuffleVoices(id)              • Shuffle all voices
│   └── useUpdateVoice(id)                • Update single character voice
│
└── use-toast.ts                          ✅ Toast Notifications (shadcn)
```

### Utilities (src/lib/)

```
src/lib/
├── utils.ts                              ✅ General utilities (cn() for classnames)
└── api.ts                                ✅ API Client
    └── baseURL: http://localhost:4000
```

---

## 🎨 Mockups vs Implementation

### Implemented Pages (Match Mockups):

1. **Character Cards** (`mockups/character-cards-v3.html`)
   - ✅ Implemented in `CharacterCard.tsx`
   - ✅ Now shows AI-generated portraits (Sprint 4)
   - ✅ Taglines, role badges, descriptions

2. **Session Setup** (gaming/quest aesthetic)
   - ✅ Implemented in `scripts/[id]/setup/page.tsx`
   - ✅ Two-phase flow (character selection → voice assignment)

### Needs Implementation:

3. **Rehearsal Player** (`mockups/rehearsal-player-v4.html`)
   - ⚠️ Only placeholder exists (`rehearsal/[sessionId]/page.tsx`)
   - 🔨 NEEDS: Full implementation (Sprint 6)
   - Design: Large centered dialogue, script preview at bottom, playback controls

---

## 🔗 Page Routing & URLs

```
/                                         → Landing Page
/scripts                                  → Script Library
/scripts/[scriptId]                       → Script Detail
/scripts/[scriptId]/setup                 → Session Setup (Character + Voice)
/rehearsal/[sessionId]                    → Rehearsal Player (needs implementation)
```

### Example Flow:

```
User arrives at:        /
Clicks:                 "Script Library" button
Navigates to:           /scripts
Clicks:                 Script card "10 Ways to Survive..."
Navigates to:           /scripts/01af3528-4dd3-401d-a5c5-d17c96c445ac
Sees:                   Character portraits, taglines, role badges
Clicks:                 "START REHEARSAL"
Navigates to:           /scripts/01af3528-4dd3-401d-a5c5-d17c96c445ac/setup
Selects:                Character "GIRL"
Creates:                Session 3f2a1b...
Customizes:             Voice assignments
Clicks:                 "LAUNCH REHEARSAL"
Navigates to:           /rehearsal/3f2a1b5e-8c3d-4e2a-9b1f-7d8e6a9c0f1d
Currently shows:        "Coming Soon" placeholder
NEEDS:                  Full rehearsal player implementation
```

---

## 🚀 Sprint 4 Status: What's New

### ✅ Completed (Sprint 4):

1. **CharacterCard.tsx** - Enhanced with:
   - AI-generated portrait display (Next.js Image)
   - Tagline display ("Brave Survivor", "Witty Guide")
   - Role badges (Lead/Featured/Ensemble with icons)
   - Character description preview (line-clamp-2)
   - Graceful fallback to emoji if no portrait

2. **Script Detail Page** - Enhanced with:
   - Portrait grid in character selection
   - Taglines below character names
   - Role badges overlaid on portraits
   - Next.js image config for backend portraits

3. **Type System** - Added:
   - ScriptAnalysis interfaces
   - CharacterAnalysisWithPortrait
   - Portrait metadata types

### ⚠️ Next Sprint (Sprint 5):

**Audio Generation & Caching**
- Generate TTS audio for all dialogue lines
- Cache audio files
- Progress UI during generation
- NOT the rehearsal player yet (that's Sprint 6)

### 🔨 Future Sprint (Sprint 6):

**Rehearsal Player Implementation**
- Build components in `components/rehearsal/`
- Implement `rehearsal/[sessionId]/page.tsx`
- Match mockup: `rehearsal-player-v4.html`

---

## 📝 File Naming Convention

```
Pages:           page.tsx (Next.js App Router convention)
Components:      PascalCase.tsx (CharacterCard.tsx)
Utilities:       camelCase.ts (api.ts, utils.ts)
Hooks:           camelCase.ts with "use" prefix (useScripts.ts)
Types:           index.ts (centralized in types/)
Styles:          kebab-case.css or globals.css
```

---

## 🎯 Quick Reference for Development

**Want to modify the landing page?**
→ Edit `/app/page.tsx`

**Want to modify script library?**
→ Edit `/app/scripts/page.tsx`

**Want to modify script detail (with portraits)?**
→ Edit `/app/scripts/[id]/page.tsx`

**Want to modify character selection/voice assignment?**
→ Edit `/app/scripts/[id]/setup/page.tsx`

**Want to BUILD the rehearsal player?**
→ Create components in `/components/rehearsal/`
→ Implement `/app/rehearsal/[sessionId]/page.tsx`
→ Reference mockup: `/mockups/rehearsal-player-v4.html`

**Want to add a new page?**
→ Create folder in `/app/` with `page.tsx`

**Want to add a new component?**
→ Create in appropriate subfolder (`/components/script/`, `/components/session/`, etc.)

**Want to add TypeScript types?**
→ Add to `/types/index.ts`
