# Sprint 3 Design Decisions

**Date**: 2025-10-23 18:00
**Session**: Sprint 3 Planning
**Status**: ✅ All decisions approved by @corey

---

## ✅ Approved Decisions

### 1. Voice Presets (8 total)
**Decision**: Use these 8 presets for MVP. Can add more later if needed.

1. **Teen Male** - Neutral, young, friendly
2. **Teen Female** - Neutral, young, friendly
3. **Angry Teen** - High emotion, aggressive
4. **Cheerful Kid** - High pitch, happy, playful
5. **Wise Elder** - Low pitch, slow, calm
6. **Mysterious Narrator** - Neutral emotion, storytelling cadence
7. **Angry Monster** - Very low pitch, aggressive (ZOMBIE, GHOST)
8. **Scared Character** - High pitch, nervous, fast

**Rationale**: Covers most theatrical roles. Simple enough for teens to understand. Can expand based on user feedback.

---

### 2. Character Card Emoji
**Decision**: Option B - Different emoji per role (detect from character name)

**Implementation**:
- Detect keywords in character name (ZOMBIE → 🧟, GHOST → 👻, TEEN → 🧑, etc.)
- Fallback to 🎭 if no match
- Keep it simple - don't try to be too clever with detection

**Concern**: Limited emoji variety for generic characters (BOY, GIRL, MAN, WOMAN)
**Mitigation**: Use gender-specific emoji where possible (👦👧👨👩), theater mask 🎭 as fallback

**Examples**:
- ZOMBIE → 🧟
- GHOST → 👻
- TEEN BOY → 🧑
- TEEN GIRL → 🧒
- NARRATOR → 📖
- ELDER/GRANDMA → 👵
- GUARD → 💂
- MONSTER → 👹
- Default → 🎭

---

### 3. Mobile Testing Target
**Decision**: Lowest common denominator (middle school devices)

**Target Devices**:
- Budget Android phones (3-4 years old)
- Older iPhones (iPhone 8-11 range)
- Assumption: Friends sharing devices, not flagship phones

**Design Implications**:
- **Large touch targets**: 44px minimum (iOS guideline)
- **Simple animations**: Avoid heavy CSS effects that lag on old devices
- **Optimized images**: Small file sizes, lazy loading
- **Responsive font sizes**: Scale up for readability on small screens
- **Test on real device**: Borrow middle school phone if possible

**Performance Budget**:
- Page load: < 3 seconds on 3G
- Interaction response: < 100ms
- No janky scrolling

---

### 4. Voice Preview Sample Text
**Decision**: "Hi, my name is [CHARACTER NAME]." + one fun line from the script

**Implementation**:
- Template: `"Hi, my name is ${characterName}. ${sampleLine}"`
- `sampleLine`: Pick a short, punchy dialogue line from the character (10-20 words max)
- Preference: Early line from script (easy to find, representative of character)
- Fallback: If no good line, use: "Let's rehearse together!"

**Example**:
- TEEN: "Hi, my name is TEEN. I can't believe we're stuck in a zombie apocalypse!"
- ZOMBIE: "Hi, my name is ZOMBIE. Braaaains... must have braaaains!"
- NARRATOR: "Hi, my name is NARRATOR. Welcome to the stage, where anything can happen."

**Duration**: 5-10 seconds of audio (keeps GPU usage reasonable)

---

### 5. Voice Assignment Strategy
**Decision**: Pure random assignment with persistence and shuffle

**Implementation**:
- **Initial setup**: Randomly assign each character a voice from all 8 presets
- **Persistence**: Save voice assignments to session (load same voices on return)
- **Manual override**: User can click any character to customize their voice
- **Shuffle button**: Re-randomize ALL character voices (creates variety between rehearsals)

**Flow**:
1. User creates session → Backend randomly assigns voices → Save to database
2. User can click character → Change voice (preset + sliders)
3. User can click "Shuffle Voices" → Re-randomize all characters → Save new assignments

**Rationale**:
- Theater doesn't care about gender/age matching (anyone plays any role)
- Random assignment is simple and bug-free
- Shuffle creates variety in speech patterns between practice sessions
- No complex keyword detection needed

---

## 📋 Next Steps

### Immediate Actions:
1. ✅ Install missing shadcn components: `select`, `slider`, `progress`, `label`
2. ✅ Create throwaway test for auto-assignment rules (test with 30-character script)
3. ✅ Document emoji detection rules
4. ✅ Begin component implementation (frontend worktree)
5. ✅ Begin service implementation (backend worktree)

### Research Needed:
- TTS parameter control (use tts-specialist agent)
- Voice preset → TTS param mapping
- Voice sample generation strategy

---

**All decisions captured. Ready to proceed with implementation.** 🚀
