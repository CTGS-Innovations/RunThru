# 🧪 Sprint 2 Integration Testing

## Status: READY FOR TESTING 🔍

**Date**: 2025-10-23
**Sprint**: Sprint 2 - Script Upload Feature
**Progress**: 100% Complete (Backend ✅ + Frontend ✅)

---

## What Was Built

### Backend (feature/backend branch)
- ✅ ScriptParserService (464 lines) - Parses markdown → structured JSON
- ✅ POST /api/scripts - Upload + parse script
- ✅ GET /api/scripts - List all scripts
- ✅ GET /api/scripts/:id - Get single script
- ✅ DELETE /api/scripts/:id - Delete script
- ✅ Test Results: 428 dialogue lines, 11 characters, 12 scenes parsed

### Frontend (feature/frontend branch)
- ✅ ScriptUploader component (drag-and-drop + paste)
- ✅ ScriptCard component (metadata + actions)
- ✅ ScriptLibrary page (/scripts)
- ✅ React Query hooks (useScripts, useUploadScript, useDeleteScript)
- ✅ 11 shadcn/ui components installed
- ✅ Build successful

---

## How to Test

### Step 1: Start Backend Server

```bash
cd /home/corey/projects/RunThru-backend/backend
npm run dev
```

**Expected output:**
```
Server running on http://localhost:4000
Database initialized successfully
```

### Step 2: Start Frontend Server

Open a **new terminal**:

```bash
cd /home/corey/projects/RunThru-frontend
npm run dev
```

**Expected output:**
```
  ▲ Next.js 15.5.6
  - Local:        http://localhost:3000
```

### Step 3: Test in Browser

1. **Open**: http://localhost:3000/scripts
2. **You should see**: Empty state - "Upload your first script"

---

## Test Cases

### ✅ Test 1: Upload via File (Drag-and-Drop)

1. Click "Upload Script" button
2. Drag `data/scripts/10 Ways to Survive the Zombie Apocalypse.md` into the drop zone
3. Click "Upload Script"

**Expected**:
- ✓ Toast: "Script uploaded"
- ✓ Script appears in library
- ✓ Shows: "10 Ways to Survive the Zombie Apocalypse"
- ✓ Shows: "11 characters • 12 scenes"
- ✓ Shows: Upload date

### ✅ Test 2: Upload via Paste

1. Click "Upload Script" button
2. Click "Paste Markdown" tab
3. Open `data/scripts/10 Ways to Survive the Zombie Apocalypse.md` in editor
4. Copy all content
5. Paste into textarea
6. Click "Upload Script"

**Expected**:
- ✓ Character count updates as you paste
- ✓ Toast: "Script uploaded"
- ✓ Script appears in library

### ✅ Test 3: Validation - File Size

1. Create a file > 5MB (or use any large file)
2. Try to upload

**Expected**:
- ✗ Toast: "File too large - Please select a file smaller than 5MB"

### ✅ Test 4: Validation - File Type

1. Try to upload a .pdf or .docx file

**Expected**:
- ✗ Toast: "Invalid file type - Please select a .md or .txt file"

### ✅ Test 5: Validation - Empty Markdown

1. Click "Upload Script" → "Paste Markdown"
2. Leave textarea empty
3. Click "Upload Script"

**Expected**:
- ✗ Toast: "Empty script - Please enter or upload script markdown"

### ✅ Test 6: Delete Script

1. Upload a script (if not already)
2. Hover over script card (3-dot menu appears)
3. Click 3-dot menu → "Delete"
4. Confirm in dialog

**Expected**:
- ✓ Confirmation dialog: "This will permanently delete..."
- ✓ After confirm: Toast "Script deleted"
- ✓ Script removed from list
- ✓ If last script: Shows empty state again

### ✅ Test 7: Loading States

1. Upload a script
2. Immediately after upload, observe UI

**Expected**:
- ✓ Uploader shows: "Uploading..." with spinner
- ✓ Library shows: Skeleton cards while loading
- ✓ Smooth transition to actual cards

### ✅ Test 8: Responsive Design

1. Resize browser window:
   - Mobile (<640px): 1 column grid
   - Tablet (640-1024px): 2 column grid
   - Desktop (>1024px): 3 column grid

**Expected**:
- ✓ Grid adapts to screen size
- ✓ Upload dialog responsive
- ✓ Touch targets large enough on mobile

---

## Edge Cases to Test

### Edge Case 1: Parser Accuracy

Upload scripts with:
- ✓ Multi-paragraph dialogue (Christy's long speech)
- ✓ Inline stage directions: `*(To the audience:)*`
- ✓ Offstage dialogue: `**JIMMY:** *(Offstage:)* Ah Zombies!`
- ✓ Character variants: `**JIMMY (JAMIE):**` → Should show as "JIMMY"
- ✓ Numbers in names: "ZOMBIE 1", "ZOMBIE 2"

### Edge Case 2: Multiple Scripts

1. Upload 5-10 different scripts
2. Check that:
   - ✓ All appear in list
   - ✓ Sorted by newest first
   - ✓ Each shows correct metadata

### Edge Case 3: Network Errors

1. Stop backend server
2. Try to upload script

**Expected**:
- ✗ Toast: "Failed to upload script - Connection error"

---

## API Endpoint Testing (Optional)

If you want to test the backend directly:

### Test with curl:

```bash
# Upload script
curl -X POST http://localhost:4000/api/scripts \
  -H "Content-Type: application/json" \
  -d '{"markdown":"# Test Script\n\n**CHARACTER:** Hello world"}'

# List all scripts
curl http://localhost:4000/api/scripts

# Get single script (replace ID)
curl http://localhost:4000/api/scripts/<script-id>

# Delete script (replace ID)
curl -X DELETE http://localhost:4000/api/scripts/<script-id>
```

---

## Success Criteria

**Sprint 2 is complete when:**
- [ ] ✓ User can upload script via drag-and-drop
- [ ] ✓ User can upload script via paste
- [ ] ✓ Script appears in library with correct metadata
- [ ] ✓ User can delete scripts with confirmation
- [ ] ✓ All validation works (file size, type, empty)
- [ ] ✓ Loading states work (skeleton, spinner)
- [ ] ✓ Toast notifications work (success/error)
- [ ] ✓ Responsive design works (mobile/tablet/desktop)
- [ ] ✓ Parser correctly identifies all characters and scenes
- [ ] ✓ No TypeScript errors (build successful)
- [ ] ✓ No console errors in browser

---

## Known Issues / Limitations

**None currently!**

If you find bugs, add them here:
- [ ] Bug 1: ...
- [ ] Bug 2: ...

---

## Next Steps After Testing

1. **If tests pass** ✅:
   - Mark CHECKPOINT 1 complete in TASKS.md
   - Merge feature/frontend → main
   - Merge feature/backend → main
   - Start Sprint 3 (Role Selection & Voice Assignment)

2. **If tests fail** ❌:
   - Document bugs in this file
   - Create fix tasks in TASKS.md
   - Iterate until tests pass

---

## Files to Review (Optional)

If you want to review the code:

**Backend**:
- `RunThru-backend/backend/src/services/scriptParser.service.ts` (464 lines)
- `RunThru-backend/backend/src/routes/scripts.routes.ts` (216 lines)

**Frontend**:
- `RunThru-frontend/src/app/scripts/page.tsx` (ScriptLibrary page)
- `RunThru-frontend/src/components/script/ScriptUploader.tsx` (Upload dialog)
- `RunThru-frontend/src/components/script/ScriptCard.tsx` (Card component)
- `RunThru-frontend/src/hooks/useScripts.ts` (React Query hooks)

---

**Ready to test!** 🚀

Let me know if you encounter any issues or have questions.
