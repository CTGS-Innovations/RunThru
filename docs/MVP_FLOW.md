# RunThru - MVP Flow (Simplified for Launch)

**Last Updated**: 2025-10-24 00:05
**Status**: Planning Complete - Ready for Implementation

---

## 🎯 Core Philosophy

**Make it work first, optimize later.**

- No voice customization in MVP (auto-assign behind the scenes)
- Multiplayer-first: Everyone rehearses together
- Shared view: All players see the same thing in real-time
- Simple controls: Any player can advance the scene

---

## 📱 The 4-Page Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│   Landing Page → Script Library → Character Selection →      │
│   (Dev Only)     (Upload/Select)  (Multiplayer Lobby)        │
│                                                               │
│                            ↓                                  │
│                                                               │
│                   Rehearsal Player                            │
│                   (Shared Real-Time View)                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Page 1: Landing Page (Development Dashboard)

**File**: `/app/page.tsx`
**URL**: `/`
**Status**: ✅ Implemented (dev testing tool)

### Purpose:
Developer-only dashboard showing sprint progress and quick navigation.

### Leave As-Is:
- Sprint progress cards
- Test instructions
- Quick links to script library

### Notes:
This is NOT the production landing page. In production, users will likely land directly at Script Library or have a simplified welcome screen. For now, this dev dashboard is perfect for testing.

---

## Page 2: Script Library

**File**: `/app/scripts/page.tsx`
**URL**: `/scripts`
**Status**: ✅ Implemented

### Purpose:
**"Choose your adventure"** - Upload a new script or select an existing one.

### Goal:
Get the user to a script as quickly as possible. This is the entry point for starting a rehearsal.

### Key Features:
- **Upload Script**
  - Drag-and-drop markdown file
  - Or paste script text
  - Server parses → Generates AI portraits → Stores in DB

- **Script Cards**
  - Show script title
  - Character count, scene count
  - Thumbnail preview (could use first character portrait)
  - Click card → Navigate to Character Selection

### User Journey:
```
Teen actor arrives
  ↓
Sees their uploaded scripts
  ↓
Clicks "10 Ways to Survive the Zombie Apocalypse"
  ↓
Goes to Character Selection
```

### UI Style Reference:
- Clean, simple cards
- Gaming aesthetic (matching character cards)
- Quick-to-scan layout
- Mobile-friendly

---

## Page 3: Character Selection (Multiplayer Lobby)

**File**: `/app/scripts/[id]/setup/page.tsx`
**URL**: `/scripts/{scriptId}/setup`
**Status**: 🔨 Needs Rework (currently has voice assignment UI)

### Purpose:
**"Pick your hero and wait for your squad"** - This is the multiplayer lobby where everyone selects their character and readies up.

### Goal:
Create anticipation and excitement. This is like the hero selection screen in a video game - you're choosing who you'll become in the performance.

### Key Features:

#### 1. Character Grid (Pokemon Card Style)
**Mockup**: `/mockups/character-card-pokemon.html`

**Visual Style**:
- Large, vibrant character cards
- AI-generated portrait prominently displayed
- Character name + tagline ("Brave Survivor")
- Role badge (Lead/Featured/Ensemble)
- Hover effects: Scale up, glow, energy
- Click to select

**Card States**:
- Available (selectable, glowing)
- Selected by you (amber border, pulsing)
- Taken by another player (dimmed, locked icon)

#### 2. Player Roster (Lobby Status)

**Shows**:
- Who's in the lobby
- Which character they selected
- Ready status (checkmark or waiting icon)

**Example Display**:
```
┌──────────────────────────────────────┐
│ Players in Lobby (3/11)              │
├──────────────────────────────────────┤
│ 🎭 Corey → GIRL          ✅ READY    │
│ 🎭 Sarah → NARRATOR 1    ⏳ Waiting  │
│ 🎭 Alex  → JIMMY         ✅ READY    │
└──────────────────────────────────────┘
```

#### 3. Ready System

**Flow**:
1. User selects character
2. "READY" button appears
3. User clicks READY → Status updates for all players
4. When all players ready → "START REHEARSAL" button enables

**Visual States**:
- Not ready: "READY UP" button (amber, pulsing)
- Ready: Green checkmark, "WAITING FOR OTHERS..."
- All ready: Big green "START REHEARSAL" button unlocks

### Design Philosophy:

**Addictive Energy** (from theater edition mockups):
- This should feel exciting, not administrative
- Pokemon/hero selection vibe
- Energy, anticipation, "let's do this!"
- Quick animations, responsive feedback
- Social: You can see your friends joining

**Visual Language**:
- Warm colors: Amber, cyan, gold
- Gradient backgrounds
- Soft glows and shadows
- Gaming UI patterns
- Theater masks, sparkles, energy

### User Journey:
```
User clicks script from library
  ↓
Sees all characters laid out (Pokemon grid)
  ↓
Clicks "GIRL" → Card pulses amber, "READY UP" button appears
  ↓
Clicks READY → Sees other players joining/selecting
  ↓
All players ready → "START REHEARSAL" unlocks
  ↓
Click → Navigate to Rehearsal Player
```

### Technical Notes:
- **WebSocket connection** for real-time lobby updates
- Character selection locks when someone else picks it
- Auto-assign voices behind the scenes (no UI for it)
- Session created when first player joins
- Session data tracks: selected characters, ready states

---

## Page 4: Rehearsal Player (Shared Real-Time View)

**File**: `/app/rehearsal/[sessionId]/page.tsx`
**URL**: `/rehearsal/{sessionId}`
**Status**: ⚠️ Placeholder only - Needs full implementation

### Purpose:
**"Everyone on the same page"** - This is the shared rehearsal experience where all players see and control the same performance in real-time.

### Goal:
Make rehearsal feel collaborative, not isolating. Everyone experiences the performance together, can pause/discuss, and advance at their own pace as a group.

### Key Features:

#### 1. Main Stage (60-70% of screen)

**Mockup**: `/mockups/rehearsal-player-v4.html`

**Visual Layout**:
```
┌────────────────────────────────────────────┐
│           Current Speaker                  │
│             🎭 NARRATOR 1                  │
│                                            │
│     (gestures urgently, looking at Girl)   │
│                                            │
│   We don't have much time. If anyone      │
│   has a plan, now's the time.             │
│                                            │
│   ▓▓▓░░░░░░░░░░  (word-by-word highlight) │
└────────────────────────────────────────────┘
```

**Features**:
- **Large, centered dialogue** (5xl-6xl font size)
- **Word-by-word highlighting** as audio plays
- **Stage directions** in italics above dialogue
- **Current speaker** indicator with portrait
- **Star moments** (breakout scenes) have golden glow

#### 2. Script Preview (Bottom 30-40%)

**"Coming Up" Section**:
Shows the next 3-4 lines in traditional script format

**Visual**:
```
┌────────────────────────────────────────────┐
│ COMING UP                                  │
├────────────────────────────────────────────┤
│ YOU (GIRL)  (confident)                    │
│ │ I have an idea. It's risky, but...      │
│                                            │
│ JIMMY                                      │
│ │ That could work! But what about...      │
│                                            │
│ SUSAN  (determined) 💙 BREAKOUT SCENE      │
│ │ I'll create a distraction...            │
└────────────────────────────────────────────┘
```

**Styling**:
- Your lines: Highlighted with amber gradient border
- Breakout scenes: Blue glow, special indicator
- Current line being read: Dimmed (40% opacity)

#### 3. Playback Controls (Bottom Center)

**Controls** (ANY player can use):
- ⏮️ Previous line
- ⏸️ Play/Pause (big central button)
- ⏭️ Next line
- 🔄 Replay current line

**Scene Progress**:
- "Line 12 of 18" in current scene
- Scene title displayed in header

#### 4. Multi-Player Synchronization

**Real-Time Features**:
- If Player A hits "Next" → All players advance
- If Player B hits "Pause" → All players pause
- Current line, playback state synced via WebSocket
- Visual indicator: "Alex paused the rehearsal"

**Why This Matters**:
- Actors can stop and discuss a moment together
- No "out of sync" issues
- Feels collaborative, not like solo practice
- Mirrors real theater rehearsal (director can call "hold")

### Design Philosophy:

**Theater Professional Context**:
- This is rehearsal, not performance
- Clean, focused, minimal distractions
- Script-first design (traditional theater formatting)
- Addictive energy through smooth playback, not flashy UI

**Visual Language**:
- Dark background (minimizes eye strain)
- High contrast text (easy to read from across room)
- Smooth animations (word highlights, line transitions)
- Cyan highlights for active elements
- Amber for user's lines
- Gold for star moments

### User Journey:
```
All players ready in lobby
  ↓
Click "START REHEARSAL"
  ↓
Everyone enters rehearsal view simultaneously
  ↓
Audio plays, words highlight in real-time
  ↓
Player hits "Pause" → Everyone pauses
  ↓
Discussion happens (in person or via chat)
  ↓
Player hits "Play" → Everyone continues
  ↓
Rehearsal progresses line by line, scene by scene
  ↓
End of script → Session complete screen
```

### Technical Notes:
- **WebSocket connection** for real-time sync
- Audio files pre-generated (not real-time TTS)
- Audio cache: `/api/audio/{scriptId}/{lineId}`
- State tracked: current scene index, current line index, playback status
- All state changes broadcast to all connected clients
- Session persistence: Users can leave and rejoin

---

## 🎨 Overall Design System

### Color Palette:
- **Background**: Dark charcoal `hsl(240 10% 3.9%)`
- **Text**: Off-white `hsl(0 0% 98%)`
- **User Lines**: Amber `hsl(24 90% 60%)`
- **AI/Other Lines**: Cyan `hsl(180 80% 60%)`
- **Star Moments**: Gold `hsl(45 100% 60%)`
- **Accents**: Magenta `hsl(330 80% 60%)`

### Typography:
- **Headers**: Bold, gaming-style
- **Dialogue**: Large (5xl), readable, high contrast
- **Script Preview**: Monospace (Courier), traditional theater format

### Animation Style:
- **Smooth, not jarring**
- **Responsive feedback** (buttons react instantly)
- **Purposeful motion** (highlights flow with reading pace)
- **No distracting effects** during rehearsal

### Reference Mockups:
1. **Character Cards**: `/mockups/character-card-pokemon.html`
   - Pokemon/hero selection energy
   - Large portraits, vibrant colors
   - Hover states, selection states

2. **Rehearsal Player**: `/mockups/rehearsal-player-v4.html`
   - Clean, focused, script-first
   - Large centered dialogue
   - Traditional script preview at bottom
   - Professional theater aesthetic

3. **Theater Edition Energy**: `/mockups/rehearsal-player-theater.html`
   - Addictive, engaging, not boring
   - Professional context, not just "homework"
   - Excitement about performance

---

## 🚀 Implementation Priority

### Phase 1: Solo Mode (MVP Core)
1. ✅ Script Library (done)
2. 🔨 Character Selection (rework to remove voice UI)
3. 🔨 Rehearsal Player (build from scratch)
4. ⚠️ Audio playback (integrate with cached files)

### Phase 2: Multiplayer (v1.1)
1. WebSocket server setup
2. Real-time lobby updates
3. Synchronized playback
4. Multi-player controls

### Phase 3: Polish (v1.2)
1. Chat/discussion features
2. Session history
3. Performance metrics
4. Social features (invite friends, etc.)

---

## 📝 Key Decisions Made

### ✅ Simplified Voice Assignment:
- No voice customization UI in MVP
- Auto-assign voices behind the scenes
- Can add customization later as advanced feature

### ✅ Multiplayer-First Design:
- Lobby system for character selection
- Shared rehearsal view
- Any player can control playback

### ✅ Pre-Generated Audio:
- All dialogue pre-generated during script upload
- Cached for instant playback
- No real-time TTS during rehearsal

### ✅ Pokemon-Style Character Selection:
- Hero selection energy and excitement
- Large, vibrant character cards
- Gaming UI patterns
- Social/collaborative feel

### ✅ Traditional Script Format:
- Bottom preview section uses theater formatting
- Familiar to actors
- Professional context
- Easy to scan ahead

---

## 🎯 Success Criteria

**A successful MVP means**:
- Teen actor can upload script in < 2 minutes
- Character selection feels exciting, not administrative
- Rehearsal feels collaborative, not isolating
- Audio playback is smooth and responsive
- Multiple actors can rehearse together in real-time
- The experience is addictive, not a chore

**User Feedback Goals**:
- "This is way better than reading alone"
- "I actually want to practice now"
- "It's like playing a game"
- "I can't wait to show my friends"

---

## 📚 Next Steps

1. **Refactor Character Selection Page**
   - Remove voice assignment UI
   - Add lobby/roster display
   - Add ready-up system
   - Polish Pokemon card styling

2. **Build Rehearsal Player**
   - Create components in `/components/rehearsal/`
   - Implement main dialogue display
   - Implement script preview panel
   - Add playback controls
   - Integrate audio playback

3. **Add WebSocket Support** (Phase 2)
   - Real-time lobby updates
   - Synchronized playback state
   - Multi-player controls

4. **Testing with Real Users**
   - Test with your daughter and her friends
   - Get feedback on character selection excitement
   - Validate multiplayer synchronization
   - Iterate on UX based on teen feedback
