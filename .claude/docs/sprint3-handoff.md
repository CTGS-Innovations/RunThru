# Sprint 3 Planning → Implementation Handoff

**Date**: 2025-10-23 18:10
**Status**: Planning Complete ✅, Ready for Implementation

---

## ✅ What Was Completed (Planning Phase)

### 1. Design Decisions Finalized
All 5 key decisions approved by @corey:

1. **Character Selection UX**: Large clickable cards (video game style)
2. **Voice Assignment UI**: Presets + fine-tune sliders (both options)
3. **Auto-Assignment Strategy**: Pure random (no keyword detection)
4. **Voice Preview**: On-demand generation (click "Preview" button)
5. **Voice Preset List**: 8 presets approved

**Document**: `.claude/docs/sprint3-decisions.md`

---

### 2. UX Research Complete
Frontend-specialist researched teen-friendly patterns:
- Video game character selection (Overwatch, Fortnite)
- Card-based UI design (Discord, Spotify, TikTok)
- Voice customization UIs (The Sims, character creators)
- Component architecture defined
- Complete code examples provided

**Document**: `.claude/docs/sprint3-ux-research.md` (652 lines)

---

### 3. TTS Voice Control Strategy
Researched Index TTS and Chatterbox:
- **Selected**: Chatterbox (simpler, has built-in `exaggeration` parameter)
- **Slider Mapping**:
  - Gender (0-100) → Different reference audio files
  - Emotion (0-100) → Chatterbox `exaggeration` (0.0-1.0)
  - Age (0-100) → Audio post-processing (pitch/speed)

**Document**: `.claude/docs/tts-voice-control.md`

---

### 4. Voice Reference Files Ready
8 voice files mapped and copied to `tts-service/reference-voices/`:

| Preset | File | Original | Description |
|--------|------|----------|-------------|
| Teen Male | teen-male.wav | echo.wav | Male, teen to adult, upbeat |
| Teen Female | teen-female.wav | nova.wav | Female voice |
| Angry Teen | angry-teen.wav | batman.wav | Batman character (intense) |
| Cheerful Kid | cheerful-kid.wav | alloy.wav | Female, soft spoken |
| Wise Elder | wise-elder.wav | dumbledore.wav | Old wizard voice |
| Mysterious Narrator | mysterious-narrator.wav | magnito.wav | Old character (villainous) |
| Angry Monster | angry-monster.wav | onyx.wav | Older style (deep) |
| Scared Character | scared-character.wav | jack-sparrow.wav | Pirate, crazy (frantic) |

**Location**: `RunThru-backend/tts-service/reference-voices/`
**Backup**: Original files in `RunThru/data/audio-cache/`

---

### 5. Frontend Dependencies Installed
shadcn/ui components added to frontend:
- ✅ `select` - For preset dropdown
- ✅ `slider` - For voice fine-tuning (gender, emotion, age)
- ✅ `progress` - For "3 of 11 assigned" indicator
- ✅ `label` - For slider labels

**Commit**: `277b90a` in `feature/frontend` branch

---

## 🎯 What Needs to Be Built (Implementation Phase)

### Backend Track (RunThru-backend/backend)

#### 1. VoicePresetService
**File**: `src/services/voicePreset.service.ts`

**Tasks**:
- [ ] Load 8 voice presets from config
- [ ] Each preset: `{id, name, description, gender, emotion, age, referenceAudioPath}`
- [ ] Method: `getAllPresets()` → returns array of presets
- [ ] Method: `getPresetById(id)` → returns single preset

**Config File**: `src/config/voice-presets.json`
```json
[
  {
    "id": "teen-male",
    "name": "Teen Male",
    "description": "Neutral young male voice",
    "gender": 60,
    "emotion": 50,
    "age": 25,
    "referenceAudioPath": "../tts-service/reference-voices/teen-male.wav"
  },
  // ... 7 more presets
]
```

---

#### 2. SessionService
**File**: `src/services/session.service.ts`

**Tasks**:
- [ ] Method: `createSession(scriptId, selectedCharacter, voiceAssignments)`
  - Validate scriptId exists
  - Validate selectedCharacter is in script
  - Save to database (sessions table)
  - Return session object with ID
- [ ] Method: `getSession(sessionId)` → return session state
- [ ] Method: `updateVoiceAssignment(sessionId, characterId, voiceParams)`
- [ ] Method: `shuffleVoices(sessionId)` → re-randomize all voice assignments

**Random Assignment Logic**:
```typescript
function randomAssignVoices(characters: Character[]): VoiceAssignment[] {
  const presetIds = ['teen-male', 'teen-female', 'angry-teen', 'cheerful-kid',
                     'wise-elder', 'mysterious-narrator', 'angry-monster', 'scared-character'];

  return characters.map(char => ({
    characterId: char.id,
    voicePresetId: presetIds[Math.floor(Math.random() * presetIds.length)],
    gender: 50, // Default slider values
    emotion: 50,
    age: 50
  }));
}
```

---

#### 3. API Endpoints
**File**: `src/routes/sessions.routes.ts`

**Endpoints to Create**:

```typescript
// GET /api/voices - List all voice presets
// Response: { presets: VoicePreset[] }

// POST /api/sessions - Create new rehearsal session
// Request: { scriptId, selectedCharacter }
// Response: { sessionId, ...sessionData }
// Note: Backend auto-assigns random voices to all characters

// GET /api/sessions/:id - Get session state
// Response: { session, voiceAssignments, script }

// POST /api/sessions/:id/shuffle - Re-randomize all voices
// Response: { voiceAssignments }

// PUT /api/sessions/:id/voice - Update single character's voice
// Request: { characterId, gender, emotion, age }
// Response: { voiceAssignment }
```

---

#### 4. Database Schema Updates
**File**: `src/db/schema.sql`

**Add sessions table**:
```sql
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  script_id INTEGER NOT NULL,
  selected_character TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS voice_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  character_id TEXT NOT NULL,
  voice_preset_id TEXT NOT NULL,
  gender INTEGER DEFAULT 50,
  emotion INTEGER DEFAULT 50,
  age INTEGER DEFAULT 50,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
```

---

### Frontend Track (RunThru-frontend)

#### 1. CharacterCard Component
**File**: `src/components/session/CharacterCard.tsx`

**Props**:
```typescript
interface CharacterCardProps {
  character: { id: string; name: string; lineCount: number; firstAppearance: number }
  isSelected: boolean
  onClick: () => void
}
```

**Features**:
- Large clickable card (full card is button)
- Hover: Scale 1.05x, cyan glow shadow
- Selected: 4px amber border, checkmark icon
- Show: Character name (2xl), line count, first scene
- Emoji icon (detect from name or default 🎭)

**Reference**: See code example in `.claude/docs/sprint3-ux-research.md`

---

#### 2. VoiceSliders Component
**File**: `src/components/session/VoiceSliders.tsx`

**Props**:
```typescript
interface VoiceSlidersProps {
  gender: number  // 0-100
  emotion: number // 0-100
  age: number     // 0-100
  onChange: (param: 'gender' | 'emotion' | 'age', value: number) => void
  onReset: () => void
}
```

**Features**:
- Three horizontal sliders (gender, emotion, age)
- Labels: "Gender: 65 (Male-leaning)"
- Tick marks at 0, 50, 100
- "Reset to Preset" button

**Reference**: See code example in `.claude/docs/sprint3-ux-research.md`

---

#### 3. VoicePresetSelector Component
**File**: `src/components/session/VoicePresetSelector.tsx`

**Props**:
```typescript
interface VoicePresetSelectorProps {
  presets: VoicePreset[]
  selectedPreset: string | null
  onSelect: (presetId: string) => void
}
```

**Features**:
- shadcn `Select` dropdown
- Show preset name + description
- Selected preset highlighted

---

#### 4. SessionSetup Page
**File**: `src/app/scripts/[id]/setup/page.tsx`

**Route**: `/scripts/[id]/setup`

**Layout**:
```
┌──────────────────────────────────────┐
│  Step 1: Select Your Character       │
│  ┌──────┐ ┌──────┐ ┌──────┐         │
│  │ TEEN │ │ GIRL │ │ZOMBIE│  ← Grid │
│  │  ✓   │ │      │ │      │         │
│  └──────┘ └──────┘ └──────┘         │
│                                      │
│  Step 2: Assign Voices (3 of 11)    │
│                                      │
│  [Auto-Assign] [Shuffle Voices]     │
│                                      │
│  GIRL (click to expand)              │
│  Preset: [Teen Female ▼]            │
│  Gender: ─────●─── 40               │
│  Emotion: ─────●─── 50              │
│  Age: ─────●─── 25                  │
│  [Preview Voice]                     │
│                                      │
│  [Start Rehearsal] (enabled when done)│
└──────────────────────────────────────┘
```

**Features**:
- Character grid (CharacterCard components)
- "Auto-Assign" button → POST /api/sessions (random assignment)
- "Shuffle Voices" button → POST /api/sessions/:id/shuffle
- Collapsible character sections
- Progress indicator: "3 of 11 assigned"
- "Start Rehearsal" enabled when all voices assigned

---

#### 5. API Client Hooks
**File**: `src/hooks/useSessions.ts`

**Hooks to Create**:
```typescript
// Fetch voice presets
const { data: voices } = useVoices()

// Create session (auto-assigns random voices)
const { mutate: createSession } = useCreateSession()

// Get session state
const { data: session } = useSession(sessionId)

// Shuffle all voices
const { mutate: shuffleVoices } = useShuffleVoices(sessionId)

// Update single character voice
const { mutate: updateVoice } = useUpdateVoice(sessionId)
```

---

#### 6. Update Script Detail Page
**File**: `src/app/scripts/[id]/page.tsx`

**Changes**:
- Add "Select Your Character" button (prominent CTA)
- Button navigates to `/scripts/[id]/setup`
- Large, colorful button (amber background)

---

## 📁 Key Files Created (Planning Phase)

### Documentation:
- ✅ `.claude/docs/sprint3-ux-research.md` (652 lines)
- ✅ `.claude/docs/sprint3-decisions.md` (125 lines)
- ✅ `.claude/docs/tts-voice-control.md` (74 lines)
- ✅ `.claude/docs/sprint3-handoff.md` (this file)

### Assets:
- ✅ `RunThru-backend/tts-service/reference-voices/` (8 voice files, 42MB)

### Code:
- ✅ `RunThru-frontend/src/components/ui/select.tsx`
- ✅ `RunThru-frontend/src/components/ui/slider.tsx`
- ✅ `RunThru-frontend/src/components/ui/progress.tsx`
- ✅ `RunThru-frontend/src/components/ui/label.tsx`

---

## 🚧 Implementation Strategy

### Recommended Order:

**Phase 1: Backend Foundation**
1. Create voice-presets.json config
2. Build VoicePresetService
3. Build SessionService (random assignment logic)
4. Create API endpoints
5. Test: GET /api/voices, POST /api/sessions

**Phase 2: Frontend Components**
1. Build CharacterCard component (standalone)
2. Build VoicePresetSelector component
3. Build VoiceSliders component
4. Build SessionSetup page (combine components)
5. Update script detail page (add CTA button)

**Phase 3: Integration**
1. Test: Create session → See random voice assignments
2. Test: Click character → Customize voice
3. Test: Shuffle button → Re-randomize voices
4. Test: Mobile responsive (44px touch targets)

---

## 🎯 Success Criteria (CHECKPOINT 2)

- [ ] User can upload script → Click "Select Character" → See character cards
- [ ] User can click character card → Card highlights and selects
- [ ] Session created with random voice assignments for all characters
- [ ] User can click "Shuffle Voices" → All voices re-randomize
- [ ] User can expand character → Adjust sliders → Voices update
- [ ] "Start Rehearsal" button enabled when all voices assigned
- [ ] Mobile responsive (works on budget Android phones)

---

## 📊 Progress Metrics

**Sprint 3 Status**: 10% complete (planning done)
- Design & Planning: 100% ✅
- Backend Implementation: 0%
- Frontend Implementation: 0%
- Integration Testing: 0%

**Overall MVP**: 30% complete
- Sprint 1 (Infrastructure): 100% ✅
- Sprint 2 (Script Upload): 100% ✅
- Sprint 3 (Role Selection): 10%

---

## 💬 Context for Next Session

**Start with**: "Ready to implement Sprint 3 (role selection & voice assignment). See `.claude/docs/sprint3-handoff.md` for planning details."

**Key decisions made**:
1. Pure random voice assignment (no keyword detection - @corey feedback)
2. 8 voice presets with reference audio files ready
3. Chatterbox TTS selected (has exaggeration parameter for emotion)
4. Shuffle button for variety between rehearsals

**Next steps**:
1. Build backend: VoicePresetService + SessionService + API endpoints
2. Build frontend: CharacterCard + SessionSetup page + voice controls
3. Test end-to-end: Create session → Assign voices → Shuffle

---

**Planning complete. Ready to build!** 🚀
