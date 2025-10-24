# Synchronized Multiplayer Rehearsal - PRD

**Created**: 2025-10-24
**Status**: Draft
**Owner**: @corey + Claude

---

## Problem Statement

When multiple users join a rehearsal session, they all need to see the **same line at the same time** with synchronized audio playback. The host (or any participant) shouldn't manually click "Next" - instead, the system should:

1. **Auto-play audio** for AI-spoken lines (characters not played by humans)
2. **Pause on user turns** when it's a participant's character speaking
3. **Wait for user input** (participant clicks "Continue" after speaking IRL)
4. **Keep everyone in sync** across network latency and different devices

This is critical for the multiplayer experience - if users get out of sync, the rehearsal breaks down.

---

## User Flow

### Scenario: 3 participants rehearsing "Zombie Apocalypse"

**Setup:**
- Host: Playing NARRATOR
- Participant 1: Playing GIRL
- Participant 2: Playing JIMMY
- AI: Playing ZOMBIE, GUARD, and 8 other characters

**Rehearsal Sequence:**

1. **Host clicks "START REHEARSAL"** in lobby
   - All participants redirect to `/rehearsal/{sessionId}`
   - Server initializes playback state: `currentLineIndex = 0, isPlaying = false`

2. **First line: NARRATOR (Host's character)**
   - All screens show: **Line 1** (NARRATOR's dialogue)
   - Host's screen highlights: "YOUR LINE" (amber border)
   - Other screens show: "Waiting for NARRATOR (Host)..." (dimmed)
   - Audio: **Does NOT auto-play** (it's a human's turn)
   - Host speaks line out loud IRL
   - Host clicks **"Continue"** button
   - Server updates: `currentLineIndex = 1`
   - All clients poll and see the update → advance to Line 2

3. **Second line: ZOMBIE (AI character)**
   - All screens show: **Line 2** (ZOMBIE's dialogue)
   - All screens highlight: "AI Speaking..." (cyan glow)
   - Audio: **Auto-plays** pre-generated `zombie-line-002.wav`
   - When audio ends (detected by frontend):
     - Frontend calls: `POST /api/sessions/{id}/advance` (if host or designated advancer)
     - Server updates: `currentLineIndex = 2`
     - All clients poll and advance to Line 3

4. **Third line: GIRL (Participant 1's character)**
   - Participant 1's screen: "YOUR LINE" (amber)
   - Host + Participant 2 screens: "Waiting for GIRL (Participant 1)..."
   - Audio: **Does NOT play** (human's turn)
   - Participant 1 speaks, clicks "Continue"
   - Server advances to Line 4

5. **Process repeats** for all 428 lines of the script

---

## Technical Architecture

### 1. Playback State (Server-Side)

**Database: `sessions` table**
```sql
ALTER TABLE sessions ADD COLUMN current_line_index INTEGER DEFAULT 0;
ALTER TABLE sessions ADD COLUMN playback_state TEXT DEFAULT 'paused'; -- 'playing' | 'paused' | 'waiting_for_user'
ALTER TABLE sessions ADD COLUMN last_state_update DATETIME;
```

**Why database?**
- Single source of truth for all clients
- Survives server restarts
- Prevents race conditions (atomic updates)

### 2. Synchronization Strategy

**Option A: Polling (Simpler, MVP)**
- Frontend polls `GET /api/sessions/{id}/playback` every 500ms
- Server returns: `{currentLineIndex, playbackState, currentLineAudioUrl}`
- When local state differs, client updates UI
- **Pros**: Simple, no WebSocket infrastructure needed
- **Cons**: 500ms latency, extra API calls

**Option B: WebSocket (Ideal for future)**
- Server pushes state changes to all connected clients instantly
- **Pros**: Real-time (<50ms), no polling overhead
- **Cons**: More complex infrastructure (Socket.IO, connection management)

**Decision for MVP: Option A (Polling)**
- Simpler to implement and debug
- 500ms latency is acceptable for rehearsal (not a game)
- Can upgrade to WebSocket in Sprint 8 if needed

### 3. Audio Playback Logic

**Client-Side (Frontend)**
```typescript
const audioRef = useRef<HTMLAudioElement>(null);

useEffect(() => {
  const line = lines[currentLineIndex];
  const participant = participants.find(p => p.characterName === line.character);

  if (participant && !participant.isAI) {
    // Human's turn - pause and wait
    setPlaybackState('waiting_for_user');
  } else {
    // AI's turn - play audio
    audioRef.current.src = line.audioUrl; // e.g., /audio/{sessionId}/line-042.wav
    audioRef.current.play();

    audioRef.current.onended = () => {
      // Auto-advance to next line
      advanceLine();
    };
  }
}, [currentLineIndex]);
```

**Server-Side Audio Generation**
- Pre-generate all audio files when session starts (Sprint 6)
- Store in: `/backend/public/audio/{sessionId}/line-{index}.wav`
- Frontend fetches: `http://localhost:4000/audio/{sessionId}/line-042.wav`

### 4. API Endpoints

#### GET /api/sessions/:id/playback
**Returns current playback state (polled every 500ms)**
```json
{
  "currentLineIndex": 42,
  "playbackState": "playing", // 'playing' | 'paused' | 'waiting_for_user'
  "currentLine": {
    "id": "line-42",
    "character": "ZOMBIE",
    "text": "Braaaains...",
    "audioUrl": "/audio/abc123/line-042.wav",
    "isAI": true
  },
  "nextLine": {
    "id": "line-43",
    "character": "GIRL",
    "text": "Run!",
    "isAI": false,
    "playerName": "Participant 1"
  }
}
```

#### POST /api/sessions/:id/advance
**Move to next line (called by host or participant after their turn)**
```json
// Request
{
  "participantId": "p123" // Verify caller is allowed to advance
}

// Response
{
  "currentLineIndex": 43,
  "playbackState": "waiting_for_user"
}
```

#### POST /api/sessions/:id/rewind
**Go back to previous line (host only)**
```json
{
  "participantId": "p123"
}
```

#### POST /api/sessions/:id/jump
**Jump to specific line or scene (host only)**
```json
{
  "participantId": "p123",
  "targetLineIndex": 200
}
```

### 5. Permissions & Controls

**Who can advance?**
- **Host**: Can always advance (has override control)
- **Current speaker**: Can advance after their line
- **AI lines**: Auto-advance when audio ends (any client can trigger, first one wins)

**Database: Add to `participants` table**
```sql
ALTER TABLE participants ADD COLUMN can_control_playback BOOLEAN DEFAULT 0;
-- Host automatically gets can_control_playback = 1
```

---

## UI/UX Design

### Rehearsal Page Layout

```
┌─────────────────────────────────────────────┐
│ Scene 3: The Ambush              [You: GIRL]│ ← Sticky header
├─────────────────────────────────────────────┤
│                                             │
│  ┌────────────────────────────────┐         │
│  │ [Portrait]  ZOMBIE (AI)        │         │
│  │ "Braaaains..."                 │ ← Current line (cyan glow)
│  │ 🔊 Playing audio...            │
│  └────────────────────────────────┘         │
│                                             │
│  ┌────────────────────────────────┐         │
│  │ [Portrait]  GIRL (You)         │         │
│  │ "Run!"                         │ ← Next line (preview, dimmed)
│  └────────────────────────────────┘         │
│                                             │
├─────────────────────────────────────────────┤
│  [◀ Prev]  [⏸ Pause]  [Continue ▶]         │ ← Footer controls
│  Line 42/428 • Scene 3/12                  │
└─────────────────────────────────────────────┘
```

### State-Specific UI

**AI Speaking (Audio Playing)**
- Current line: Cyan glow + 🔊 icon + progress bar
- Controls: "Pause" button (pauses audio, doesn't advance)
- Other participants: See same view

**Your Turn (Human Speaking)**
- Current line: Amber glow + "YOUR LINE" badge
- Controls: "Continue" button (advances when ready)
- Other participants: "Waiting for [Name] (CHARACTER)..."

**Waiting for Another User**
- Current line: Neutral + "Waiting for [Name] (CHARACTER)..."
- Controls: Disabled (grayed out)
- Other participants: Same view

### Mobile Considerations
- Pause/Continue buttons: 60px height (easy thumb reach)
- Audio progress bar: Prominent (shows time remaining)
- Line preview: Collapsed on mobile, full on desktop

---

## Audio Generation Strategy

### Phase 1: Test Audio (This Sprint)
**Goal**: Validate synchronization logic without TTS overhead

- Use **single test WAV file** (`test-dialogue.wav`) for ALL AI lines
- Hardcode: `audioUrl = "/audio/test-dialogue.wav"` for all `isAI` lines
- Focus on: Polling, state sync, auto-advance, pause/resume
- Test with 3+ browsers (simulate multiplayer)

### Phase 2: Pre-Generated Audio (Sprint 6)
**Goal**: Generate real audio for each AI line using Chatterbox

**Endpoint**: `POST /api/sessions/:id/generate-audio`
```json
{
  "sessionId": "abc123"
}
```

**Server Process**:
1. Load session + script from database
2. Identify all AI-spoken lines (characters with `isAI = true`)
3. For each AI line:
   - Get character's assigned voice preset (from `voice_assignments` table)
   - Call Chatterbox TTS: `POST http://localhost:5000/synthesize`
   - Save to: `/backend/public/audio/{sessionId}/line-{index}.wav`
4. Update database: `audio_generated = true, audio_generated_at = NOW()`

**Generation Time Estimate**:
- 428 lines × 0.5s per line = ~214 seconds (~3.5 minutes)
- Show progress bar in UI: "Generating audio... 42/428 lines"

**Caching Strategy**:
- Audio files persist until session deleted
- If user changes voice preset → regenerate only that character's lines
- Future: Cache by (text + voice params) hash for reuse across sessions

---

## Testing Strategy

### Phase 1 Testing (This Sprint)

**Test 1: Single User + Test Audio**
- Create session, start rehearsal
- Verify: Test audio plays, auto-advances to next line
- Verify: User's lines pause, wait for "Continue" click

**Test 2: Two Browsers + Polling**
- Open `/rehearsal/{id}` in Chrome + Firefox
- Host advances line → Firefox sees update within 500ms
- Verify: Both stay in sync through 10+ lines

**Test 3: Three Users + Mixed Roles**
- Host plays NARRATOR, P1 plays GIRL, P2 plays JIMMY
- Verify: Each user sees "YOUR LINE" only on their character
- Verify: AI lines auto-play for all users
- Verify: Waiting states show correct player names

**Test 4: Network Latency Simulation**
- Use Chrome DevTools: Network → Throttle to "Fast 3G"
- Verify: Polling still works, just slower
- Verify: No duplicate advances (race condition check)

### Phase 2 Testing (Sprint 6)
- Test audio generation for full 428-line script
- Verify voice assignments match presets
- Verify audio quality (Chatterbox exaggeration parameter)
- Test cache invalidation when voices change

---

## Performance Considerations

### Polling Overhead
- 500ms polling interval = 2 requests/sec/client
- 5 clients = 10 requests/sec
- Negligible for local server, acceptable for Cloudflare Tunnel

### Audio File Size
- 428 lines × ~5 seconds average × 32 kbps WAV = ~0.86 MB per session
- WebP compression + streaming recommended
- Future: Convert to MP3 for smaller files

### Database Writes
- Each advance = 1 UPDATE query
- 428 lines = 428 writes per rehearsal session
- SQLite handles this easily (1000s of writes/sec)

---

## Open Questions

1. **Who can pause/rewind?**
   - Option A: Host only (simpler, prevents chaos)
   - Option B: Anyone (democratic, but risk of conflicts)
   - **Recommendation**: Host only for MVP, add voting system later

2. **What if someone disconnects mid-rehearsal?**
   - Option A: Pause for everyone, wait for reconnect
   - Option B: Continue without them, they catch up on rejoin
   - **Recommendation**: Option B (localStorage remembers participant ID, they rejoin seamlessly)

3. **Replay/bookmark specific scenes?**
   - Future feature: "Jump to Scene 5" dropdown (host only)
   - Saves time for focused rehearsals

4. **Real-time feedback (reactions, notes)?**
   - Future: Emoji reactions (👏🔥😂) for good deliveries
   - Future: Text notes on specific lines ("Try angrier here")

---

## Success Metrics

**MVP Success Criteria**:
- [ ] 3+ users stay in sync through 50+ lines without manual intervention
- [ ] Audio auto-plays for AI lines and pauses for human lines
- [ ] <1 second lag between host advancing and other clients seeing update
- [ ] No race conditions (duplicate advances, skipped lines)
- [ ] Works on mobile + desktop browsers

**Performance Targets**:
- Polling latency: <500ms average
- Audio generation: <5 minutes for 400-line script
- Page load time: <2 seconds (with cached portraits)

---

## Implementation Plan

### Sprint 5.5: Synchronization Foundation (This Session)
- [ ] Add playback state columns to `sessions` table
- [ ] Create `GET /api/sessions/:id/playback` endpoint
- [ ] Create `POST /api/sessions/:id/advance` endpoint
- [ ] Add polling logic to rehearsal page (500ms interval)
- [ ] Add "Continue" button (visible only on user's turns)
- [ ] Test with single test audio file (`test-dialogue.wav`)
- [ ] Verify 2-3 browser synchronization

### Sprint 6: Audio Generation
- [ ] Integrate Chatterbox TTS adapter (already planned)
- [ ] Create `POST /api/sessions/:id/generate-audio` endpoint
- [ ] Generate audio for all AI lines on session start
- [ ] Add progress bar: "Generating audio... X/Y lines"
- [ ] Update rehearsal page to use real audio URLs
- [ ] Test full 428-line script generation

### Sprint 8: Real-Time Sync (Optional)
- [ ] Upgrade to WebSocket (Socket.IO)
- [ ] Sub-100ms latency for state updates
- [ ] Add "User typing..." indicators
- [ ] Add emoji reactions

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Polling too slow (>1s lag) | High | Reduce interval to 250ms, or upgrade to WebSocket |
| Race conditions (duplicate advances) | Medium | Server-side locking (SQLite transactions) |
| Audio generation takes >10 min | High | Parallel generation (10 lines at once), show progress |
| Network issues mid-rehearsal | Medium | localStorage reconnection, session resume |
| Users get out of sync | High | "Resync" button (forces everyone to host's line) |

---

## Future Enhancements

1. **WebSocket real-time sync** (Sprint 8)
2. **Voice chat** for remote rehearsals (Twilio/Agora)
3. **Session recording** (save audio + transcript)
4. **Director mode** (watch-only observer)
5. **Split scenes** (multiple groups rehearse different scenes)
6. **Emotion feedback** (AI detects if delivery matches tone)

---

## Appendix: State Machine

```
Initial State: IDLE
  ↓
Host clicks START → READY
  ↓
Load first line → PLAYING or WAITING_FOR_USER
  ↓
┌──────────────────┐
│ PLAYING          │ (AI line, audio auto-playing)
│ - Show progress  │
│ - Allow pause    │
└──────────────────┘
  ↓ (audio ends)
Advance to next line
  ↓
┌──────────────────┐
│ WAITING_FOR_USER │ (Human's turn)
│ - Highlight line │
│ - Show "Continue"│
└──────────────────┘
  ↓ (user clicks)
Advance to next line
  ↓
Repeat until last line → COMPLETED
```

---

**Next Steps**:
1. Review this PRD with @corey
2. Update TASKS.md with Sprint 5.5 tasks
3. Implement playback state backend
4. Add polling to rehearsal UI
5. Test with 3 browsers + test audio
