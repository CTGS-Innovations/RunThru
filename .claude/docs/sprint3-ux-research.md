# Sprint 3 UX Research: Role Selection & Voice Assignment

**Date**: 2025-10-23
**Sprint**: 3 (Role Selection & Voice Assignment)
**Target Audience**: Teen actors (13-18 years old)
**Focus**: Teen-friendly, visual, playful UI design

---

## 1. Video Game Character Selection Patterns

### Research: Overwatch, Fortnite, Among Us

**Layout Patterns:**
- **Grid-based selection**: 3-4 columns on desktop, 1-2 on mobile
- **Large character portraits**: Minimum 200px x 200px per card
- **Hero cards with stats**: Name, role/class, quick stats
- **Responsive grids**: Flexible columns that adapt to screen size

**Interaction Patterns:**
- **Hover effects**:
  - Scale transform (1.05x)
  - Glowing shadow effect
  - Border highlight (accent color)
  - Subtle bounce animation
- **Selected state**:
  - Bold colored border (4px+)
  - Checkmark/selected icon
  - Elevated appearance (z-index + larger shadow)
  - Accent background glow
- **Audio feedback**: Click sounds (we can skip for MVP)

**Key Takeaways for RunThru:**
- Use large, bold cards (not small list items)
- Grid layout: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- Selected state must be VERY obvious (teens need clear feedback)
- Hover effects create playful, interactive feel

---

## 2. Teen-Friendly Card UI Design

### Research: Discord, Spotify, TikTok, Roblox

**Visual Design:**
- **Dark mode default**: Teens expect dark UI
- **Bold accent colors**: Not subtle grays - use amber, cyan, magenta
- **Rounded corners**: Border radius 12-16px (softer than corporate apps)
- **Icons & emoji**: Visual recognition aids (character emoji, role icons)
- **Micro-interactions**: Bounce, pulse, slide effects on hover/click

**Typography:**
- **Large text sizes**: 18px+ for body, 24px+ for headings
- **Bold weights**: 600-700 for primary text (easier to read)
- **High contrast**: White/light text on dark background

**Touch Targets:**
- **Minimum 44px**: iOS/Android guideline for touch elements
- **Generous spacing**: 16px+ between cards to avoid mis-taps
- **Full-card clickable**: Not just button - entire card is interactive

**Key Takeaways for RunThru:**
- Use shadcn's dark mode with custom accent colors
- Large, bold typography (2xl for character names)
- Full-card click targets (easier than tiny buttons)
- Emoji/icons for quick visual cues

---

## 3. Voice/Audio Customization UIs

### Research: The Sims, Skyrim Character Creator, Snapchat Voice Filters

**Two-Tier Approach:**
- **Tier 1: Presets (80% of users)**
  - Pre-configured voices: "Teen Male", "Angry Monster", "Wise Elder"
  - One-click selection (no sliders needed)
  - Instant preview available
  - Example: The Sims voice selection (pitch 1-3, no fine control)

- **Tier 2: Fine-tuning (20% power users)**
  - Gender slider: 0-100 (Female ← → Male)
  - Emotion slider: 0-100 (Calm ← → Happy ← → Angry)
  - Age slider: 0-100 (Child ← → Teen ← → Adult ← → Elder)
  - "Reset to Preset" button (easy undo)

**Preview Patterns:**
- **"Preview Voice" button**: Explicit action (not auto-play)
- **Loading state**: Spinner + "Generating preview..." text
- **Inline audio player**: Play/pause/stop controls
- **Sample text**: Short, relevant phrase (10-15 seconds max)

**Slider Design Best Practices:**
- **Horizontal layout**: Easier to understand than vertical
- **Value labels**: Show current value (e.g., "Gender: 65 (Male-leaning)")
- **Tick marks**: Optional visual guides at 0, 50, 100
- **Smooth dragging**: 0-100 range (no snapping unless intentional)

**Key Takeaways for RunThru:**
- Start with presets dropdown (80% will never touch sliders)
- Sliders below preset selector (progressive disclosure)
- "Preview Voice" button (on-demand, saves GPU)
- Reset button always visible (teens experiment and need undo)

---

## 4. Component Architecture

### New Components to Build:

#### 4.1 `CharacterCard.tsx`
**Props:**
- `character: { id, name, lineCount, firstAppearance }`
- `isSelected: boolean`
- `onClick: () => void`

**Visual States:**
- **Default**: Gray border (`border-gray-700`), no shadow
- **Hover**: Scale 1.05x, cyan glow shadow, lighter border
- **Selected**: 4px amber border, amber glow, checkmark icon top-right

**Layout:**
```
┌─────────────────────────┐
│ 🎭                    ✓ │  ← Emoji + checkmark (if selected)
│                         │
│   CHARACTER NAME        │  ← 2xl bold text
│                         │
│   42 lines · Scene 1    │  ← sm muted text
└─────────────────────────┘
```

**Code Pattern:**
```tsx
<Card
  className={cn(
    "cursor-pointer transition-all duration-200",
    "hover:scale-105 hover:shadow-cyan-500/50",
    isSelected && "border-4 border-amber-500 shadow-lg shadow-amber-500/30"
  )}
  onClick={onClick}
>
  <CardHeader>
    <div className="flex justify-between items-start">
      <span className="text-4xl">🎭</span>
      {isSelected && <Check className="text-amber-500" />}
    </div>
    <CardTitle className="text-2xl">{character.name}</CardTitle>
    <CardDescription>{character.lineCount} lines · Scene {character.firstAppearance}</CardDescription>
  </CardHeader>
</Card>
```

---

#### 4.2 `VoicePresetSelector.tsx`
**Props:**
- `presets: VoicePreset[]`
- `selectedPreset: string | null`
- `onSelect: (presetId: string) => void`

**Design:**
- Use shadcn `Select` component (dropdown)
- List 8-10 presets with descriptions
- Selected preset shows in button

**Presets to Include** (pending @corey approval):
1. "Teen Male" - Neutral, young, friendly
2. "Teen Female" - Neutral, young, friendly
3. "Angry Teen" - High emotion, aggressive
4. "Cheerful Kid" - High pitch, happy, playful
5. "Wise Elder" - Low pitch, slow, calm
6. "Mysterious Narrator" - Neutral emotion, storytelling cadence
7. "Angry Monster" - Very low pitch, aggressive (ZOMBIE, GHOST)
8. "Scared Character" - High pitch, nervous, fast

---

#### 4.3 `VoiceSliders.tsx`
**Props:**
- `gender: number (0-100)`
- `emotion: number (0-100)`
- `age: number (0-100)`
- `onChange: (param: string, value: number) => void`
- `onReset: () => void`

**Layout:**
```
Gender: 65 (Male-leaning)
[0]──────●─────────[100]
   Female    Neutral    Male

Emotion: 80 (Excited)
[0]──────────────●─[100]
   Calm    Neutral    Excited

Age: 25 (Young Adult)
[0]─────●──────────[100]
  Child   Teen   Adult   Elder

[Reset to Preset]
```

**Code Pattern:**
```tsx
<div className="space-y-6">
  <div>
    <Label>Gender: {gender} ({getGenderLabel(gender)})</Label>
    <Slider value={[gender]} onValueChange={([v]) => onChange('gender', v)} />
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>Female</span>
      <span>Neutral</span>
      <span>Male</span>
    </div>
  </div>
  {/* Emotion, Age similar... */}
  <Button variant="outline" onClick={onReset}>Reset to Preset</Button>
</div>
```

---

#### 4.4 `VoicePreview.tsx`
**Props:**
- `characterName: string`
- `voiceParams: { gender, emotion, age }`
- `onGenerate: () => Promise<string>` (returns audio URL)

**States:**
- **Idle**: "Preview Voice" button
- **Generating**: Spinner + "Generating preview..."
- **Ready**: Audio player visible (play/pause/stop)

**Sample Text:**
- "Hello, I'm [CHARACTER NAME]. Let's rehearse together!"
- Keep it short (5-10 seconds of audio)

---

#### 4.5 `SessionSetupPage.tsx` (Full Page)
**Route**: `/scripts/[id]/setup`

**Layout:**
```
┌────────────────────────────────────────┐
│  RunThru > Zombie Script > Setup       │
├────────────────────────────────────────┤
│                                        │
│  Step 1: Select Your Character         │
│  ┌──────┐ ┌──────┐ ┌──────┐           │
│  │ TEEN │ │ GIRL │ │ZOMBIE│  ← Cards  │
│  │  ✓   │ │      │ │      │           │
│  └──────┘ └──────┘ └──────┘           │
│                                        │
│  Step 2: Assign Voices (3 of 11)      │
│                                        │
│  GIRL                                  │
│  Preset: [Teen Female ▼]              │
│  Gender: ─────●─── 30 (Female)        │
│  [Preview Voice] [⏵ Playing...]       │
│                                        │
│  ZOMBIE                                │
│  Preset: [Angry Monster ▼]            │
│  [Auto-assigned - click to customize] │
│                                        │
│  ... (other characters)                │
│                                        │
│  [Use Smart Defaults] [Start Rehearsal]│
└────────────────────────────────────────┘
```

**Features:**
- Progress indicator: "3 of 11 characters assigned"
- "Use Smart Defaults" button → Auto-assign all voices
- "Start Rehearsal" disabled until all voices assigned
- Collapsible character sections (expand to customize)

---

## 5. shadcn/ui Component Mapping

### Already Installed:
- ✅ `card` - For CharacterCard base
- ✅ `button` - For Preview, Reset, Start buttons
- ✅ `dialog` - For mobile full-screen voice editor
- ✅ `alert-dialog` - For "Are you sure?" confirmations
- ✅ `skeleton` - For loading states

### Need to Install:
- ❌ `select` - For voice preset dropdown
- ❌ `slider` - For gender/emotion/age sliders
- ❌ `progress` - For "3 of 11 assigned" indicator
- ❌ `label` - For slider labels

**Installation Command:**
```bash
cd RunThru-frontend
npx shadcn@latest add select slider progress label --yes
```

---

## 6. Responsive Design (Mobile-First)

### Breakpoints:
- **Mobile** (< 640px): 1 column, full-width cards
- **Tablet** (640-1024px): 2 columns, medium cards
- **Desktop** (> 1024px): 3 columns, large cards

### Mobile Optimizations:
- **Touch targets**: 44px minimum (character cards 200px+ height)
- **Full-screen voice editor**: Use Dialog for sliders on mobile
- **Stacked layout**: No side-by-side content below 640px
- **Larger text**: Scale up font sizes on mobile (easier to read)

**Grid Code:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {characters.map(char => <CharacterCard key={char.id} {...char} />)}
</div>
```

---

## 7. Accessibility Guidelines

### Keyboard Navigation:
- **Tab**: Navigate between cards, sliders, buttons
- **Enter/Space**: Select character card
- **Arrow keys**: Adjust sliders (5-point increments)
- **Escape**: Close dialogs/previews

### ARIA Labels:
- Character cards: `aria-pressed={isSelected}` (toggle button)
- Sliders: `aria-label="Gender slider"` + `aria-valuenow={gender}`
- Preview button: `aria-busy={isGenerating}` during loading
- Progress: `aria-live="polite"` for "3 of 11 assigned" updates

### Focus States:
- **Ring style**: 4px amber ring on all focusable elements
- **High contrast**: `focus-visible:ring-4 focus-visible:ring-amber-500`
- **Skip to content**: "Skip to voice assignment" link for keyboard users

### Screen Reader Announcements:
- "TEEN selected as your character"
- "Gender set to 65, male-leaning"
- "Generating voice preview, please wait"
- "Voice preview ready, click play to hear"

### Color Contrast:
- Amber (#F59E0B) on dark background: AAA compliant
- Cyan (#06B6D4) on dark background: AA compliant
- Ensure text meets WCAG 2.1 standards

---

## 8. Animation & Micro-Interactions

### Character Cards:
```css
/* Hover animation */
.character-card:hover {
  transform: scale(1.05);
  box-shadow: 0 20px 40px rgba(6, 182, 212, 0.3); /* Cyan glow */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* Selected animation */
.character-card.selected {
  border: 4px solid #F59E0B; /* Amber */
  box-shadow: 0 20px 60px rgba(245, 158, 11, 0.4); /* Amber glow */
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.9; }
}
```

### Sliders:
```css
/* Smooth dragging */
.voice-slider {
  transition: background-color 0.15s ease;
}

.voice-slider:active {
  cursor: grabbing;
}
```

### Buttons:
```css
/* Preview button loading state */
.preview-button.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## 9. Design Tokens (Tailwind CSS)

### Colors:
- **Primary**: Amber (`amber-500`, `#F59E0B`)
- **Secondary**: Cyan (`cyan-500`, `#06B6D4`)
- **Accent**: Magenta (`pink-500`, `#EC4899`)
- **Background**: Dark (`gray-950`, `#030712`)
- **Card**: Slightly lighter dark (`gray-900`, `#111827`)
- **Border**: Gray (`gray-700`, `#374151`)
- **Text**: White (`gray-50`, `#F9FAFB`)
- **Muted**: Gray (`gray-400`, `#9CA3AF`)

### Spacing:
- **Card gap**: `gap-6` (24px)
- **Section spacing**: `space-y-8` (32px)
- **Padding**: `p-6` (24px) for cards

### Typography:
- **Heading**: `text-3xl font-bold` (30px)
- **Character name**: `text-2xl font-semibold` (24px)
- **Body**: `text-base` (16px)
- **Muted**: `text-sm text-muted-foreground` (14px)

### Borders & Shadows:
- **Default border**: `border border-gray-700` (1px)
- **Selected border**: `border-4 border-amber-500` (4px)
- **Hover shadow**: `shadow-lg shadow-cyan-500/30`
- **Selected shadow**: `shadow-xl shadow-amber-500/40`
- **Border radius**: `rounded-lg` (12px)

---

## 10. Code Examples (Ready to Use)

### CharacterCard Component:
```tsx
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CharacterCardProps {
  character: {
    id: string
    name: string
    lineCount: number
    firstAppearance: number
  }
  isSelected: boolean
  onClick: () => void
}

export function CharacterCard({ character, isSelected, onClick }: CharacterCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200",
        "hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 hover:border-cyan-500/50",
        isSelected && "border-4 border-amber-500 shadow-xl shadow-amber-500/40 animate-pulse"
      )}
      onClick={onClick}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <CardHeader className="space-y-4">
        <div className="flex justify-between items-start">
          <span className="text-4xl" role="img" aria-label="Theater mask">🎭</span>
          {isSelected && (
            <Check className="w-8 h-8 text-amber-500" aria-label="Selected" />
          )}
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">{character.name}</CardTitle>
          <CardDescription className="text-sm mt-2">
            {character.lineCount} lines · First appears in Scene {character.firstAppearance}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  )
}
```

### VoiceSliders Component:
```tsx
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface VoiceSlidersProps {
  gender: number  // 0-100
  emotion: number // 0-100
  age: number     // 0-100
  onChange: (param: 'gender' | 'emotion' | 'age', value: number) => void
  onReset: () => void
}

export function VoiceSliders({ gender, emotion, age, onChange, onReset }: VoiceSlidersProps) {
  const getGenderLabel = (val: number) => {
    if (val < 33) return 'Female-leaning'
    if (val < 67) return 'Neutral'
    return 'Male-leaning'
  }

  const getEmotionLabel = (val: number) => {
    if (val < 33) return 'Calm'
    if (val < 67) return 'Neutral'
    return 'Excited'
  }

  const getAgeLabel = (val: number) => {
    if (val < 25) return 'Child'
    if (val < 50) return 'Teen'
    if (val < 75) return 'Adult'
    return 'Elder'
  }

  return (
    <div className="space-y-6">
      {/* Gender Slider */}
      <div className="space-y-2">
        <Label htmlFor="gender-slider">
          Gender: {gender} ({getGenderLabel(gender)})
        </Label>
        <Slider
          id="gender-slider"
          value={[gender]}
          onValueChange={([v]) => onChange('gender', v)}
          max={100}
          step={1}
          className="w-full"
          aria-label="Gender slider"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Female</span>
          <span>Neutral</span>
          <span>Male</span>
        </div>
      </div>

      {/* Emotion Slider */}
      <div className="space-y-2">
        <Label htmlFor="emotion-slider">
          Emotion: {emotion} ({getEmotionLabel(emotion)})
        </Label>
        <Slider
          id="emotion-slider"
          value={[emotion]}
          onValueChange={([v]) => onChange('emotion', v)}
          max={100}
          step={1}
          className="w-full"
          aria-label="Emotion slider"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Calm</span>
          <span>Neutral</span>
          <span>Excited</span>
        </div>
      </div>

      {/* Age Slider */}
      <div className="space-y-2">
        <Label htmlFor="age-slider">
          Age: {age} ({getAgeLabel(age)})
        </Label>
        <Slider
          id="age-slider"
          value={[age]}
          onValueChange={([v]) => onChange('age', v)}
          max={100}
          step={1}
          className="w-full"
          aria-label="Age slider"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Child</span>
          <span>Teen</span>
          <span>Adult</span>
          <span>Elder</span>
        </div>
      </div>

      {/* Reset Button */}
      <Button variant="outline" onClick={onReset} className="w-full">
        Reset to Preset
      </Button>
    </div>
  )
}
```

---

## 11. Next Steps for Implementation

### Phase 1: Install Missing Components
```bash
cd RunThru-frontend
npx shadcn@latest add select slider progress label --yes
```

### Phase 2: Build Components (Order)
1. `CharacterCard.tsx` - Standalone, easy to test
2. `VoicePresetSelector.tsx` - Depends on backend `/api/voices` endpoint
3. `VoiceSliders.tsx` - Standalone, no backend dependency
4. `VoicePreview.tsx` - Depends on backend `/api/sessions/:id/voice-preview`
5. `SessionSetupPage.tsx` - Combines all components

### Phase 3: Testing Strategy
- Test character selection on mobile first (44px touch targets)
- Test keyboard navigation (Tab, Enter, Arrow keys)
- Test screen reader announcements (VoiceOver on Mac, NVDA on Windows)
- Test with teen user (your daughter) for feedback on design

### Phase 4: Iteration
- Adjust colors based on user feedback
- Tweak animation timing if too fast/slow
- Refine voice slider mappings after TTS testing
- Add more presets if 8-10 isn't enough

---

## 12. Open Questions for @corey

1. **Voice Preset Names**: Do you like the 8 presets listed? Any changes?
   - Teen Male, Teen Female, Angry Teen, Cheerful Kid, Wise Elder, Mysterious Narrator, Angry Monster, Scared Character

2. **Character Emoji**: Should we add emoji to character cards? (🎭 for all, or different per role?)

3. **Mobile Testing**: Can we test on your daughter's phone early? (iPhone/Android?)

4. **Voice Preview Sample Text**: Is "Hello, I'm [NAME]. Let's rehearse together!" good, or other text?

5. **Auto-Assign Fallback**: If auto-assign can't detect gender/age, random voice or prompt user?

---

**Research complete. Ready for mockup phase and implementation.** 🎨
